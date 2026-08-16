import React, {
  useMemo,
  useState,
} from 'react';

import { api } from '../api';

import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Coffee,
  Copy,
  CreditCard,
  Gift,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';

const money = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

const FREE_CODE = 'FREESTAY100';

function getRoomImage(roomType) {
  const value = String(
    `${roomType?.name || ''} ${roomType?.code || ''}`
  ).toLowerCase();

  if (
    value.includes('premium') ||
    value.includes('presidential') ||
    value.includes('prm')
  ) {
    return '/room-premium.jpg';
  }

  if (
    value.includes('executive') ||
    value.includes('suite') ||
    value.includes('ste')
  ) {
    return '/room-executive.jpg';
  }

  if (
    value.includes('deluxe') ||
    value.includes('dlx')
  ) {
    return '/room-deluxe.jpg';
  }

  return '/hotel-room.jpg';
}

export default function BookingEngine() {
  const [propertyCode, setPropertyCode] =
    useState(
      import.meta.env
        .VITE_DEFAULT_PROPERTY_CODE ||
        'HTL001'
    );

  const [checkIn, setCheckIn] =
    useState('');

  const [checkOut, setCheckOut] =
    useState('');

  const [adults, setAdults] =
    useState(2);

  const [children, setChildren] =
    useState(0);

  const [roomsCount, setRoomsCount] =
    useState(1);

  const [promoCode, setPromoCode] =
    useState('');

  const [
    promoPreview,
    setPromoPreview,
  ] = useState(null);

  const [
    availability,
    setAvailability,
  ] = useState([]);

  const [selected, setSelected] =
    useState(null);

  const [guest, setGuest] =
    useState({
      fullName: '',
      email: '',
      phone: '',

      consents: {
        email: true,
        whatsapp: true,
      },
    });

  const [addons, setAddons] =
    useState([]);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('Pay at Hotel');

  const [done, setDone] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [
    promoMessage,
    setPromoMessage,
  ] = useState('');

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil(
        (new Date(checkOut) -
          new Date(checkIn)) /
          86400000
      )
    );
  }, [checkIn, checkOut]);

  const extras = [
    {
      name: 'Airport Pickup',
      price: 700,
    },

    {
      name: 'Breakfast Upgrade',
      price: 500,
    },

    {
      name: 'Early Check-in',
      price: 900,
    },

    {
      name: 'Late Checkout',
      price: 1200,
    },

    {
      name: 'Spa Credit',
      price: 1500,
    },

    {
      name: 'Extra Bed',
      price: 900,
    },
  ];

  const roomTotal =
    (selected?.roomType?.baseRate || 0) *
    nights *
    roomsCount;

  const extrasTotal =
    addons.reduce(
      (sum, item) =>
        sum + item.price,
      0
    );

  const rawSubtotal =
    roomTotal + extrasTotal;

  const isFreePromo =
    promoPreview?.discountType ===
      'percent' &&
    Number(
      promoPreview?.discountValue ||
        0
    ) >= 100;

  const previewDiscount =
    isFreePromo
      ? rawSubtotal
      : promoPreview
          ?.discountType ===
        'percent'
      ? Math.min(
          roomTotal,
          roomTotal *
            (Number(
              promoPreview
                .discountValue || 0
            ) /
              100)
        )
      : Math.min(
          roomTotal,
          Number(
            promoPreview
              ?.discountValue || 0
          )
        );

  const discountedSubtotal =
    Math.max(
      0,
      rawSubtotal -
        previewDiscount
    );

  const tax = Math.round(
    discountedSubtotal * 0.12
  );

  const total =
    discountedSubtotal + tax;

  async function search() {
    setError('');

    if (
      !checkIn ||
      !checkOut ||
      !(
        new Date(checkIn) <
        new Date(checkOut)
      )
    ) {
      return setError(
        'Please select valid check-in and check-out dates.'
      );
    }

    setLoading(true);

    try {
      const { data } =
        await api.get(
          `/public/properties/${propertyCode}/availability`,
          {
            params: {
              checkIn,
              checkOut,
            },
          }
        );

      setAvailability(data);
      setSelected(null);

      setTimeout(() => {
        document
          .getElementById('rooms')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 100);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleAddon(addon) {
    setAddons((current) =>
      current.some(
        (item) =>
          item.name === addon.name
      )
        ? current.filter(
            (item) =>
              item.name !==
              addon.name
          )
        : [...current, addon]
    );
  }

  async function applyPromo() {
    setError('');
    setPromoMessage('');

    const code =
      promoCode
        .trim()
        .toUpperCase();

    if (!code) {
      return setPromoMessage(
        'Enter a coupon code first.'
      );
    }

    setLoading(true);

    try {
      const { data } =
        await api.get(
          `/public/properties/${propertyCode}`
        );

      const promo =
        (data.promos || []).find(
          (item) =>
            String(
              item.code || ''
            ).toUpperCase() ===
              code &&
            item.active
        );

      if (!promo) {
        setPromoPreview(null);

        return setPromoMessage(
          'Coupon code is invalid or inactive.'
        );
      }

      const now = new Date();

      if (
        (promo.startDate &&
          now <
            new Date(
              promo.startDate
            )) ||
        (promo.endDate &&
          now >
            new Date(
              promo.endDate
            ))
      ) {
        setPromoPreview(null);

        return setPromoMessage(
          'Coupon is outside its active period.'
        );
      }

      setPromoPreview(promo);

      setPromoMessage(
        Number(
          promo.discountValue ||
            0
        ) >= 100
          ? 'Coupon applied — your booking is complimentary.'
          : `Coupon applied — ${promo.discountValue}${
              promo.discountType ===
              'percent'
                ? '%'
                : ' INR'
            } off.`
      );
    } catch (e) {
      setPromoPreview(null);

      setPromoMessage(
        e.response?.data?.message ||
          e.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyFreeCode() {
    setPromoCode(FREE_CODE);

    try {
      await navigator.clipboard?.writeText(
        FREE_CODE
      );
    } catch {}

    setPromoMessage(
      `${FREE_CODE} copied. Click Apply Coupon at checkout.`
    );
  }

  async function book() {
    setError('');

    if (!selected) {
      return setError(
        'Please select a room first.'
      );
    }

    if (
      !guest.fullName ||
      !guest.phone
    ) {
      return setError(
        'Guest name and phone are required.'
      );
    }

    setLoading(true);

    try {
      const { data } =
        await api.post(
          `/public/properties/${propertyCode}/book`,
          {
            checkIn,
            checkOut,

            roomType:
              selected.roomType._id,

            rate:
              selected.roomType
                .baseRate,

            guest,

            adults,

            children,

            rooms: roomsCount,

            promoCode:
              promoCode
                .trim()
                .toUpperCase(),

            ratePlan:
              'Best Available Rate',

            mealPlan:
              'Breakfast',

            addons,
          }
        );

      const finalTotal =
        Number(
          data.amountDue ??
            total
        );

      setDone({
        ...data,

        total: finalTotal,

        paymentMethod,

        phone: guest.phone,

        complimentary:
          finalTotal <= 0.009,
      });
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function payNow() {
    if (
      !done ||
      done.total <= 0
    ) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const {
        data: order,
      } = await api.post(
        '/public/payments/create-order',
        {
          propertyCode,

          amount: done.total,

          currency: 'INR',

          receipt:
            done.confirmationNumber,
        }
      );

      if (
        order.provider ===
        'mock'
      ) {
        const paymentId =
          `pay_mock_${Date.now()}`;

        await api.post(
          '/public/payments/capture',
          {
            confirmationNumber:
              done.confirmationNumber,

            confirmationNumbers:
              done.confirmationNumbers,

            phone: done.phone,

            orderId:
              order.orderId,

            paymentId,

            signature:
              'mock_signature',

            amount: done.total,

            currency: 'INR',

            method: 'Online',
          }
        );

        setDone({
          ...done,
          paid: true,
          paymentReference:
            paymentId,
        });

        return;
      }

      if (!window.Razorpay) {
        await new Promise(
          (resolve, reject) => {
            const script =
              document.createElement(
                'script'
              );

            script.src =
              'https://checkout.razorpay.com/v1/checkout.js';

            script.onload =
              resolve;

            script.onerror =
              reject;

            document.body.appendChild(
              script
            );
          }
        );
      }

      const options = {
        key: order.keyId,

        amount: order.amount,

        currency: order.currency,

        name:
          'Hotel Management System',

        description:
          `Booking ${done.confirmationNumber}`,

        order_id:
          order.orderId,

        handler:
          async (response) => {
            await api.post(
              '/public/payments/capture',
              {
                confirmationNumber:
                  done.confirmationNumber,

                confirmationNumbers:
                  done.confirmationNumbers,

                phone:
                  done.phone,

                orderId:
                  response
                    .razorpay_order_id,

                paymentId:
                  response
                    .razorpay_payment_id,

                signature:
                  response
                    .razorpay_signature,

                amount:
                  done.total,

                currency:
                  'INR',

                method:
                  'Online',
              }
            );

            setDone(
              (current) => ({
                ...current,

                paid: true,

                paymentReference:
                  response
                    .razorpay_payment_id,
              })
            );
          },

        prefill: {
          name:
            guest.fullName,

          email:
            guest.email,

          contact:
            guest.phone,
        },

        theme: {
          color: '#d7a542',
        },
      };

      new window.Razorpay(
        options
      ).open();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="luxBookingPage">

        <header className="luxBookingNav">

          <a
            className="luxBookingBrand"
            href="/"
          >
            <div>
              H
            </div>

            <span>
              <b>
                Hotel Management System
              </b>

              <small>
                Premium Enterprise
              </small>
            </span>
          </a>

          <nav>
            <a href="/">
              Home
            </a>

            <a href="/guest">
              Guest Portal
            </a>
          </nav>

        </header>

        <div className="luxConfirmationStage">

          <div className="luxConfirmationCard">

            <CheckCircle2
              size={58}
            />

            <span className="luxEyebrow">
              RESERVATION CONFIRMED
            </span>

            <h1>
              {done.complimentary
                ? 'Your complimentary stay is booked'
                : 'Welcome to your stay'}
            </h1>

            <p>
              Your confirmation number
            </p>

            <div className="luxConfirmationNumber">
              {done.confirmationNumber}
            </div>

            <div className="luxSummaryGrid">

              <div>
                <span>
                  Total
                </span>

                <b>
                  {money(done.total)}
                </b>
              </div>

              <div>
                <span>
                  Payment
                </span>

                <b>
                  {done.complimentary
                    ? 'Complimentary'
                    : done.paid
                    ? 'Paid'
                    : 'Pending'}
                </b>
              </div>

              <div>
                <span>
                  Access
                </span>

                <b>
                  Phone + Confirmation
                </b>
              </div>

            </div>

            {done.complimentary && (
              <div className="luxPromoSuccess">
                <Gift size={18} />

                {done.promoApplied ||
                  FREE_CODE}{' '}
                applied — no payment
                required.
              </div>
            )}

            {!done.complimentary &&
              !done.paid &&
              done.paymentMethod !==
                'Pay at Hotel' && (
                <button
                  className="luxGoldButton"
                  onClick={payNow}
                  disabled={loading}
                >
                  <CreditCard size={17} />

                  {loading
                    ? 'Opening payment…'
                    : `Pay ${money(
                        done.total
                      )} securely`}
                </button>
              )}

            {done.paid && (
              <div className="luxNotice">
                <ShieldCheck
                  size={16}
                />

                Payment captured ·{' '}
                {
                  done.paymentReference
                }
              </div>
            )}

            <a
              className="luxPortalLink"
              href="/guest"
            >
              Open Guest Portal

              <ArrowRight size={16} />
            </a>

            {error && (
              <p className="error">
                {error}
              </p>
            )}

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="luxBookingPage">

      {/* NAV */}

      <header className="luxBookingNav">

        <a
          className="luxBookingBrand"
          href="/"
        >
          <div>
            H
          </div>

          <span>
            <b>
              Hotel Management System
            </b>

            <small>
              Premium Enterprise
            </small>
          </span>
        </a>

        <nav>

          <a href="/#rooms">
            Rooms
          </a>

          <a href="#offers">
            Offers
          </a>

          <a href="/guest">
            Guest Portal
          </a>

          <a href="/login">
            Staff Login
          </a>

        </nav>

      </header>

      {/* HERO */}

      <section className="luxBookingHero">

        <div className="luxHeroMedia">

          <img
            src="/hotel-room.jpg"
            alt="Luxury hotel room"
          />

          <div className="luxHeroOverlay" />

          <div className="luxHeroCopy">

            <span className="luxEyebrow">
              DIRECT BOOKING ENGINE · LIVE PMS INVENTORY
            </span>

            <h1>
              Stay beautifully.
              <br />
              Book effortlessly.
            </h1>

            <p>
              Discover refined rooms,
              live availability and a
              seamless direct-booking
              journey connected to the
              hotel PMS.
            </p>

            <div className="luxHeroBadges">

              <span>
                <ShieldCheck size={15} />
                Secure booking
              </span>

              <span>
                <CalendarDays
                  size={15}
                />
                Real-time availability
              </span>

              <span>
                <Gift size={15} />
                Exclusive direct offers
              </span>

            </div>

          </div>

        </div>

        {/* GLASS SEARCH CARD */}

        <div className="luxSearchWrap">

          <div className="luxSearchCard">

            <span className="luxEyebrow">
              FIND YOUR STAY
            </span>

            <h2>
              Check Availability
            </h2>

            <label>
              Property code

              <input
                value={propertyCode}
                onChange={(e) =>
                  setPropertyCode(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              <CalendarDays
                size={15}
              />

              Check-in

              <input
                type="datetime-local"
                value={checkIn}
                onChange={(e) =>
                  setCheckIn(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              <CalendarDays
                size={15}
              />

              Check-out

              <input
                type="datetime-local"
                value={checkOut}
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
              />
            </label>

            <div className="luxGuestGrid">

              <label>
                <Users size={15} />

                Adults

                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) =>
                    setAdults(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </label>

              <label>
                Children

                <input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) =>
                    setChildren(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </label>

              <label>
                Rooms

                <input
                  type="number"
                  min="1"
                  max="5"
                  value={roomsCount}
                  onChange={(e) =>
                    setRoomsCount(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </label>

            </div>

            <button
              className="luxGoldButton"
              onClick={search}
              disabled={loading}
            >
              {loading
                ? 'Searching…'
                : 'Search Rooms'}
            </button>

          </div>

        </div>

      </section>

      {/* OFFER */}

      <section
        id="offers"
        className="luxOffer"
      >

        <div>
          <Sparkles size={27} />
        </div>

        <div>
          <span>
            LIMITED DEMO OFFER
          </span>

          <h3>
            Book a complimentary stay
          </h3>

          <p>
            Apply the coupon during
            checkout and eligible
            bookings become ₹0.
          </p>
        </div>

        <div className="luxCoupon">
          <small>
            COUPON CODE
          </small>

          <b>
            {FREE_CODE}
          </b>
        </div>

        <button
          onClick={copyFreeCode}
        >
          <Copy size={16} />

          Copy code
        </button>

      </section>

      {error && (
        <div className="luxError">
          {error}
        </div>
      )}

      {/* LIVE ROOMS */}

      <section
        id="rooms"
        className="luxBookingSection"
      >

        <div className="luxSectionTitle">

          <span>
            01
          </span>

          <div>
            <h2>
              Premium Rooms & Suites
            </h2>

            <p>
              Live availability directly
              from the hotel PMS.
            </p>
          </div>

        </div>

        {availability.length >
        0 ? (
          <div className="luxRoomGrid">

            {availability.map(
              (item) => (
                <article
                  key={
                    item.roomType._id
                  }
                  className={`luxRoomCard ${
                    selected
                      ?.roomType?._id ===
                    item.roomType._id
                      ? 'selected'
                      : ''
                  }`}
                >

                  <div className="luxRoomPhoto">

                    <img
                      src={getRoomImage(
                        item.roomType
                      )}
                      alt={
                        item.roomType
                          .name
                      }
                    />

                    <div />

                    <span className="luxRoomCode">
                      {item.roomType
                        .code ||
                        'ROOM'}
                    </span>

                    <span className="luxAvailable">
                      {item.count}{' '}
                      available
                    </span>

                  </div>

                  <div className="luxRoomBody">

                    <div className="luxRoomTop">

                      <div>
                        <h3>
                          {
                            item
                              .roomType
                              .name
                          }
                        </h3>

                        <p>
                          {item
                            .roomType
                            .description ||
                            'Premium accommodation with refined interiors and curated hotel amenities.'}
                        </p>
                      </div>

                      <div className="luxRoomPrice">
                        {money(
                          item
                            .roomType
                            .baseRate
                        )}

                        <small>
                          / night
                        </small>
                      </div>

                    </div>

                    <div className="luxRoomMeta">

                      <span>
                        <Users
                          size={13}
                        />

                        Up to{' '}
                        {item.roomType
                          .maxOccupancy ||
                          2}
                      </span>

                      <span>
                        <BedDouble
                          size={13}
                        />

                        King Bed
                      </span>

                      <span>
                        <Wifi
                          size={13}
                        />

                        Wi-Fi
                      </span>

                      <span>
                        <Coffee
                          size={13}
                        />

                        Breakfast
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        setSelected(
                          item
                        )
                      }
                    >
                      {selected
                        ?.roomType
                        ?._id ===
                      item.roomType._id
                        ? 'Selected'
                        : 'Select Room'}
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        ) : (
          <div className="luxEmptyRooms">
            Select dates and click
            Search Rooms to view live
            room availability.
          </div>
        )}

      </section>

      {/* CHECKOUT */}

      {selected && (
        <section className="luxBookingSection">

          <div className="luxSectionTitle">

            <span>
              02
            </span>

            <div>
              <h2>
                Booking Checkout
              </h2>

              <p>
                Guest information,
                experiences, coupon and
                payment preference.
              </p>
            </div>

          </div>

          <div className="luxCheckoutGrid">

            <div className="luxCheckoutCard">

              <h3>
                Guest information
              </h3>

              <div className="luxFormGrid">

                <input
                  placeholder="Full name"
                  value={
                    guest.fullName
                  }
                  onChange={(e) =>
                    setGuest({
                      ...guest,
                      fullName:
                        e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Email"
                  value={guest.email}
                  onChange={(e) =>
                    setGuest({
                      ...guest,
                      email:
                        e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Phone"
                  value={guest.phone}
                  onChange={(e) =>
                    setGuest({
                      ...guest,
                      phone:
                        e.target.value,
                    })
                  }
                />

              </div>

              <h3>
                Coupon / Member Code
              </h3>

              <div className="luxPromoRow">

                <input
                  placeholder={`Try ${FREE_CODE}`}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(
                      e.target.value.toUpperCase()
                    );

                    setPromoPreview(
                      null
                    );

                    setPromoMessage(
                      ''
                    );
                  }}
                />

                <button
                  onClick={applyPromo}
                  disabled={loading}
                >
                  Apply Coupon
                </button>

              </div>

              {promoMessage && (
                <div
                  className={
                    promoPreview
                      ? 'luxPromoSuccess'
                      : 'luxPromoInfo'
                  }
                >
                  {promoPreview && (
                    <CheckCircle2
                      size={15}
                    />
                  )}

                  {promoMessage}
                </div>
              )}

              <h3>
                Add Experiences
              </h3>

              <div className="luxAddonGrid">

                {extras.map(
                  (addon) => (
                    <button
                      key={
                        addon.name
                      }
                      className={
                        addons.some(
                          (item) =>
                            item.name ===
                            addon.name
                        )
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        toggleAddon(
                          addon
                        )
                      }
                    >
                      <span>
                        {addon.name}
                      </span>

                      <b>
                        +{' '}
                        {money(
                          addon.price
                        )}
                      </b>
                    </button>
                  )
                )}

              </div>

              <h3>
                Payment preference
              </h3>

              <div className="luxPaymentChoices">

                {[
                  'UPI / Card Online',
                  'Pay at Hotel',
                  'Corporate Billing',
                ].map((method) => (
                  <button
                    key={method}
                    className={
                      paymentMethod ===
                      method
                        ? 'selected'
                        : ''
                    }
                    onClick={() =>
                      setPaymentMethod(
                        method
                      )
                    }
                  >
                    {method}
                  </button>
                ))}

              </div>

            </div>

            <aside className="luxPriceSummary">

              <span className="luxEyebrow">
                RESERVATION SUMMARY
              </span>

              <h3>
                {selected.roomType.name}
              </h3>

              <div>
                <span>
                  {nights} night(s) ·{' '}
                  {roomsCount} room(s)
                </span>

                <b>
                  {money(roomTotal)}
                </b>
              </div>

              <div>
                <span>
                  Add-ons
                </span>

                <b>
                  {money(
                    extrasTotal
                  )}
                </b>
              </div>

              {promoPreview && (
                <div className="luxDiscountLine">
                  <span>
                    Discount (
                    {
                      promoPreview.code
                    }
                    )
                  </span>

                  <b>
                    -{' '}
                    {money(
                      previewDiscount
                    )}
                  </b>
                </div>
              )}

              <div>
                <span>
                  Tax (12%)
                </span>

                <b>
                  {money(tax)}
                </b>
              </div>

              <div className="luxSummaryTotal">

                <span>
                  Total
                </span>

                <b>
                  {money(total)}
                </b>

              </div>

              {isFreePromo && (
                <div className="luxPromoSuccess">
                  <Gift size={16} />

                  Complimentary
                  booking — no payment
                  will be collected.
                </div>
              )}

              <button
                className="luxGoldButton"
                onClick={book}
                disabled={
                  loading ||
                  !guest.fullName ||
                  !guest.phone
                }
              >
                {loading
                  ? 'Confirming…'
                  : total <= 0
                  ? 'Book Free Stay'
                  : 'Confirm Booking'}
              </button>

              <small>
                Final price is validated
                by the server.
              </small>

            </aside>

          </div>

        </section>
      )}

    </div>
  );
}