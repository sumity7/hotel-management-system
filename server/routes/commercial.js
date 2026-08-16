const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const permit = require('../middleware/permit');
const audit = require('../utils/audit');
const { v4: uuid } = require('uuid');
const { Property, Room, RoomType, Guest, Reservation, Folio, Notification } = require('../models/core');
const ent = require('../models/enterprise');

router.use(auth, tenant);

const overlap = (checkIn, checkOut) => ({
  checkIn: { $lt: checkOut },
  checkOut: { $gt: checkIn },
  status: { $nin: ['cancelled', 'no-show', 'checked-out'] }
});

function nightsBetween(a, b) {
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

function applyRule(amount, rule) {
  const v = Number(rule.adjustmentValue || 0);
  if (rule.adjustmentType === 'percent') return amount * (1 + v / 100);
  if (rule.adjustmentType === 'discount-percent') return amount * (1 - v / 100);
  if (rule.adjustmentType === 'fixed') return amount + v;
  if (rule.adjustmentType === 'set') return v;
  return amount;
}

router.post('/rate-quote', permit('modules.rate-plans.view'), asyncHandler(async (req, res) => {
  const { roomType, checkIn, checkOut, ratePlan, adults = 1, children = 0, source = 'Direct' } = req.body;
  const ci = new Date(checkIn), co = new Date(checkOut);
  if (!roomType || !(ci < co)) return res.status(400).json({ message: 'roomType and valid stay dates are required' });
  const rt = await RoomType.findOne({ _id: roomType, ...req.organizationFilter });
  if (!rt) return res.status(404).json({ message: 'Room type not found' });
  const plan = ratePlan ? await ent['rate-plans'].findOne({ ...req.organizationFilter, property: req.propertyId, $or: [{ _id: ratePlan }, { code: ratePlan }, { name: ratePlan }] }) : null;
  const rules = await ent['rate-rules'].find({ ...req.organizationFilter, property: req.propertyId, active: true }).sort({ priority: 1 });
  const nights = nightsBetween(ci, co);
  let nightlyBase = Number(plan?.baseRate || rt.baseRate || 0);
  const breakdown = [];
  let roomTotal = 0;
  for (let i = 0; i < nights; i++) {
    const date = new Date(ci); date.setDate(date.getDate() + i);
    let price = nightlyBase;
    const applied = [];
    for (const rule of rules) {
      const startOk = !rule.startDate || date >= new Date(rule.startDate);
      const endOk = !rule.endDate || date <= new Date(rule.endDate);
      const weekdayOk = !rule.weekday || String(rule.weekday).toLowerCase() === date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (startOk && endOk && weekdayOk) {
        const before = price;
        price = applyRule(price, rule);
        applied.push({ name: rule.name, before, after: price });
      }
    }
    price = Math.max(0, Number(price.toFixed(2)));
    roomTotal += price;
    breakdown.push({ date: date.toISOString().slice(0, 10), base: nightlyBase, price, applied });
  }
  const extraGuestCharge = Math.max(0, adults - (rt.defaultOccupancy || 2)) * 500 * nights + Math.max(0, children - (rt.maxChildren || 1)) * 250 * nights;
  const subtotal = roomTotal + extraGuestCharge;
  const taxPercent = Number(req.body.taxPercent ?? 12);
  const tax = Number((subtotal * taxPercent / 100).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  res.json({ roomType: rt, ratePlan: plan, nights, source, breakdown, roomTotal, extraGuestCharge, subtotal, taxPercent, tax, total, currency: process.env.DEFAULT_CURRENCY || 'INR' });
}));

router.get('/crs/search', permit('reservations.view'), asyncHandler(async (req, res) => {
  const ci = new Date(req.query.checkIn), co = new Date(req.query.checkOut);
  if (!(ci < co)) return res.status(400).json({ message: 'Valid checkIn/checkOut are required' });
  const propertyQuery = req.user.role === 'saas_super_admin' ? { status: 'active' } : { organization: req.user.organization, status: 'active' };
  if (req.query.city) propertyQuery.city = new RegExp(req.query.city, 'i');
  const properties = await Property.find(propertyQuery).lean();
  const results = [];
  for (const p of properties) {
    const reserved = await Reservation.find({ property: p._id, ...overlap(ci, co) }).distinct('room');
    const types = await RoomType.find({ property: p._id, active: true }).lean();
    for (const rt of types) {
      const available = await Room.countDocuments({ property: p._id, roomType: rt._id, _id: { $nin: reserved }, status: { $nin: ['Out of Order', 'Out of Service', 'Maintenance', 'Blocked'] } });
      if (available > 0) results.push({ property: p, roomType: rt, available, baseRate: rt.baseRate });
    }
  }
  res.json(results);
}));

router.post('/channel-sync', permit('modules.channel-mappings.update'), asyncHandler(async (req, res) => {
  const { channel, direction = 'push', dryRun = true } = req.body;
  if (!channel) return res.status(400).json({ message: 'channel is required' });
  const mappings = await ent['channel-mappings'].find({ ...req.organizationFilter, property: req.propertyId, channel });
  const errors = [];
  const synced = [];
  for (const m of mappings) {
    if (!m.externalRoomType || !m.internalRoomType) errors.push({ id: m._id, message: 'Room type mapping incomplete' });
    else synced.push({ id: m._id, externalRoomType: m.externalRoomType, internalRoomType: m.internalRoomType, direction });
  }
  const now = new Date();
  await ent['channel-mappings'].updateMany({ ...req.organizationFilter, property: req.propertyId, channel }, { $set: { lastSync: now, lastError: errors.length ? `${errors.length} mapping error(s)` : '', status: errors.length ? 'warning' : 'synced' } });
  await audit(req, { action: 'CHANNEL_SYNC', module: 'channel-manager', entityType: 'ChannelMapping', newValue: { channel, direction, dryRun, synced: synced.length, errors: errors.length } });
  res.json({ channel, direction, dryRun, liveVendorCall: false, message: dryRun ? 'Dry-run sync completed. Live OTA calls require vendor credentials/certification.' : 'Local synchronization state updated; vendor call adapter is not configured.', synced, errors, at: now });
}));

router.post('/groups', permit('modules.groups.create'), asyncHandler(async (req, res) => {
  const { name, type = 'group', arrival, departure, roomsBlocked = 1, roomType, negotiatedRate, deposit = 0, releaseDate, masterFolio = true, guestName, phone } = req.body;
  const ci = new Date(arrival), co = new Date(departure);
  if (!name || !roomType || !(ci < co)) return res.status(400).json({ message: 'name, roomType and valid arrival/departure required' });
  const reserved = await Reservation.find({ property: req.propertyId, ...overlap(ci, co) }).distinct('room');
  const availableRooms = await Room.find({ property: req.propertyId, roomType, _id: { $nin: reserved }, status: { $nin: ['Out of Order', 'Out of Service', 'Maintenance', 'Blocked'] } }).limit(Number(roomsBlocked));
  if (availableRooms.length < Number(roomsBlocked)) return res.status(409).json({ message: `Only ${availableRooms.length} room(s) available for requested block` });
  const groupId = `GRP-${uuid().slice(0, 8).toUpperCase()}`;
  const group = await ent['groups'].create({ organization: req.user.organization, property: req.propertyId, name, type, arrival: ci, departure: co, roomsBlocked: Number(roomsBlocked), releaseDate, negotiatedRate, deposit, masterFolio, status: 'confirmed', groupId });
  const guest = await Guest.create({ organization: req.user.organization, property: req.propertyId, fullName: guestName || `${name} Coordinator`, phone });
  const created = [];
  for (const room of availableRooms) {
    const r = await Reservation.create({ organization: req.user.organization, property: req.propertyId, confirmationNumber: `GRP-${uuid().slice(0, 8).toUpperCase()}`, guest: guest._id, roomType, room: room._id, checkIn: ci, checkOut: co, nights: nightsBetween(ci, co), adults: 1, ratePlan: 'Group Rate', mealPlan: req.body.mealPlan || 'Room Only', source: 'Group', reservationType: 'group', status: 'group', rate: Number(negotiatedRate || 0), depositRequired: Number(deposit || 0), groupId });
    await Room.findByIdAndUpdate(room._id, { status: 'Reserved' });
    await Folio.create({ organization: req.user.organization, property: req.propertyId, reservation: r._id, guest: guest._id, currency: process.env.DEFAULT_CURRENCY || 'INR' });
    created.push(r);
  }
  await audit(req, { action: 'CREATE_GROUP', module: 'groups', entityType: 'Group', entityId: group._id, newValue: { groupId, reservations: created.map(x => x._id) } });
  res.status(201).json({ group, groupId, reservations: created });
}));

router.get('/guests', permit('reservations.view'), asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = { ...req.organizationFilter };
  if (req.propertyId) filter.property = req.propertyId;
  if (q) filter.$or = [{ fullName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }, { loyaltyNumber: new RegExp(q, 'i') }];
  const guests = await Guest.find(filter).sort({ updatedAt: -1 }).limit(100);
  res.json(guests);
}));

router.get('/guests/:id/history', permit('reservations.view'), asyncHandler(async (req, res) => {
  const guest = await Guest.findOne({ _id: req.params.id, ...req.organizationFilter });
  if (!guest) return res.status(404).json({ message: 'Guest not found' });
  const reservations = await Reservation.find({ guest: guest._id }).populate('property room roomType').sort({ checkIn: -1 });
  const folios = await Folio.find({ guest: guest._id });
  const serviceRequests = await ent['service-requests'].find({ guestId: guest._id }).sort({ createdAt: -1 });
  const lifetimeSpend = folios.reduce((s, f) => s + f.items.reduce((a, i) => a + Number(i.amount || 0) + Number(i.tax || 0) - Number(i.discount || 0), 0), 0);
  const completed = reservations.filter(r => ['checked-out', 'in-house'].includes(r.status));
  const totalNights = completed.reduce((s, r) => s + Number(r.nights || 0), 0);
  const averageRate = completed.length ? completed.reduce((s, r) => s + Number(r.rate || 0), 0) / completed.length : 0;
  guest.stats = { totalStays: completed.length, totalNights, lifetimeSpend, averageRate: Number(averageRate.toFixed(2)) };
  await guest.save();
  res.json({ guest, reservations, folios, serviceRequests });
}));

router.post('/loyalty/:guestId/earn', permit('modules.loyalty-accounts.update'), asyncHandler(async (req, res) => {
  const guest = await Guest.findOne({ _id: req.params.guestId, ...req.organizationFilter });
  if (!guest) return res.status(404).json({ message: 'Guest not found' });
  let account = await ent['loyalty-accounts'].findOne({ guestId: guest._id, ...req.organizationFilter });
  if (!account) account = await ent['loyalty-accounts'].create({ organization: guest.organization, property: guest.property, guestId: guest._id, membershipNumber: `LOY-${uuid().slice(0,8).toUpperCase()}`, tier: 'Silver', points: 0, lifetimePoints: 0, status: 'active' });
  const points = Math.max(0, Number(req.body.points || 0));
  account.points = Number(account.points || 0) + points;
  account.lifetimePoints = Number(account.lifetimePoints || 0) + points;
  if (account.lifetimePoints >= 10000) account.tier = 'Platinum'; else if (account.lifetimePoints >= 5000) account.tier = 'Gold';
  await account.save();
  const tx = await ent['loyalty-transactions'].create({ organization: guest.organization, property: guest.property, guestId: guest._id, type: 'earn', points, reference: req.body.reference, description: req.body.description || 'Points earned' });
  res.json({ account, transaction: tx });
}));

router.post('/loyalty/:guestId/redeem', permit('modules.loyalty-accounts.update'), asyncHandler(async (req, res) => {
  const guest = await Guest.findOne({ _id: req.params.guestId, ...req.organizationFilter });
  if (!guest) return res.status(404).json({ message: 'Guest not found' });
  const account = await ent['loyalty-accounts'].findOne({ guestId: guest._id, ...req.organizationFilter });
  const points = Math.max(0, Number(req.body.points || 0));
  if (!account || Number(account.points || 0) < points) return res.status(409).json({ message: 'Insufficient loyalty points' });
  account.points -= points; await account.save();
  const tx = await ent['loyalty-transactions'].create({ organization: guest.organization, property: guest.property, guestId: guest._id, type: 'redeem', points: -points, reference: req.body.reference, description: req.body.description || 'Points redeemed' });
  res.json({ account, transaction: tx });
}));

router.patch('/service-requests/:id', permit('modules.service-requests.update'), asyncHandler(async (req, res) => {
  const old = await ent['service-requests'].findOne({ _id: req.params.id, ...req.organizationFilter });
  if (!old) return res.status(404).json({ message: 'Request not found' });
  const update = { ...req.body };
  if (update.status === 'Resolved' && !update.resolution) return res.status(400).json({ message: 'Resolution is required when resolving a request' });
  const doc = await ent['service-requests'].findOneAndUpdate({ _id: req.params.id, ...req.organizationFilter, ...(req.propertyId ? { property: req.propertyId } : {}) }, update, { new: true, runValidators: true });
  await audit(req, { action: 'UPDATE_SERVICE_REQUEST', module: 'service-requests', entityType: 'ServiceRequest', entityId: doc._id, oldValue: old, newValue: doc });
  res.json(doc);
}));

router.post('/guest-journey/schedule', permit('modules.guest-journeys.create'), asyncHandler(async (req, res) => {
  const { reservationId, trigger = 'pre-arrival', channel = 'email', template = 'default', scheduledAt } = req.body;
  const r = await Reservation.findOne({ _id: reservationId, ...req.organizationFilter }).populate('guest');
  if (!r) return res.status(404).json({ message: 'Reservation not found' });
  const journey = await ent['guest-journeys'].create({ organization: r.organization, property: r.property, guestId: r.guest._id, reservationId: r._id, trigger, channel, template, scheduledAt: scheduledAt || new Date(), status: 'scheduled' });
  const recipient = channel === 'email' ? r.guest.email : r.guest.phone;
  const note = await Notification.create({ organization: r.organization, property: r.property, recipientType: 'guest', recipient, channel: ['email','sms','whatsapp','push'].includes(channel) ? channel : 'in-app', template, event: trigger, payload: { reservationId: r._id }, status: 'queued' });
  res.status(201).json({ journey, notification: note });
}));

router.get('/upsells/:reservationId', permit('modules.upsell-offers.view'), asyncHandler(async (req, res) => {
  const r = await Reservation.findOne({ _id: req.params.reservationId, ...req.organizationFilter });
  if (!r) return res.status(404).json({ message: 'Reservation not found' });
  const offers = await ent['upsell-offers'].find({ ...req.organizationFilter, property: r.property, active: true });
  const now = new Date();
  const eligible = offers.filter(o => {
    const e = o.eligibility || {};
    if (e.status && e.status !== r.status) return false;
    if (e.minNights && Number(r.nights || 0) < Number(e.minNights)) return false;
    if (e.beforeCheckInOnly && now >= new Date(r.checkIn)) return false;
    return true;
  });
  res.json(eligible);
}));

router.post('/upsells/:reservationId/accept', permit('modules.upsell-offers.update'), asyncHandler(async (req, res) => {
  const r = await Reservation.findOne({ _id: req.params.reservationId, ...req.organizationFilter });
  const offer = await ent['upsell-offers'].findOne({ _id: req.body.offerId, ...req.organizationFilter, active: true });
  if (!r || !offer) return res.status(404).json({ message: 'Reservation or offer not found' });
  const folio = await Folio.findOne({ reservation: r._id });
  if (!folio) return res.status(400).json({ message: 'Folio missing' });
  folio.items.push({ type: 'upsell', department: 'Ancillary', description: offer.name, qty: Number(req.body.qty || 1), unitPrice: Number(offer.price || 0), amount: Number(offer.price || 0) * Number(req.body.qty || 1) });
  await folio.save();
  offer.revenueAttribution = Number(offer.revenueAttribution || 0) + Number(offer.price || 0) * Number(req.body.qty || 1); await offer.save();
  res.json({ offer, folio });
}));

router.post('/concierge', permit('modules.service-requests.create'), asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  const q = message.toLowerCase();
  const property = await Property.findOne({ _id: req.propertyId, ...req.organizationFilter });
  let answer = 'I can help with property information, restaurant/spa/taxi and housekeeping service requests.';
  let serviceRequest = null;
  if (q.includes('check in') || q.includes('check-in')) answer = `Standard check-in time is ${property?.checkInTime || '14:00'}.`;
  else if (q.includes('check out') || q.includes('checkout')) answer = `Standard check-out time is ${property?.checkOutTime || '11:00'}.`;
  else if (q.includes('breakfast')) answer = 'Breakfast timing is controlled by the configured F&B outlet schedule. Please verify the active outlet timing in Restaurant POS settings.';
  else if (q.includes('towel') || q.includes('clean') || q.includes('housekeep')) {
    serviceRequest = await ent['service-requests'].create({ organization: req.user.organization, property: req.propertyId, guestId: req.body.guestId, roomId: req.body.roomId, category: 'Housekeeping', priority: req.body.priority || 'normal', department: 'Housekeeping', status: 'Open', slaDueAt: new Date(Date.now() + 30 * 60000), description: message });
    answer = `Housekeeping request created. Reference ${serviceRequest._id}.`;
  } else if (q.includes('taxi') || q.includes('airport')) {
    serviceRequest = await ent['service-requests'].create({ organization: req.user.organization, property: req.propertyId, guestId: req.body.guestId, roomId: req.body.roomId, category: 'Transport', priority: 'normal', department: 'Front Office', status: 'Open', slaDueAt: new Date(Date.now() + 20 * 60000), description: message });
    answer = `Transport request created. Reference ${serviceRequest._id}.`;
  } else if (q.includes('spa')) answer = 'Spa availability is managed in Spa & Wellness. Reception can create an appointment from the active service schedule.';
  res.json({ answer, serviceRequest, knowledgeSource: 'property-config-and-operational-routing', liveLLM: false });
}));

module.exports = router;
