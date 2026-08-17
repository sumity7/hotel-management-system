require('dotenv').config();

const connectDB = require('./config/db');

const {
  Organization,
  Brand,
  Region,
  Property,
  Building,
  Floor,
  User,
  RoomType,
  Room,
  Guest,
  Reservation,
  Folio,
} = require('./models/core');

const ent = require('./models/enterprise');
const { v4: uuid } = require('uuid');

const cfg = {
  orgName:
    process.env.SEED_ORGANIZATION_NAME ||
    'Demo Hospitality Group',

  orgCode:
    process.env.SEED_ORGANIZATION_CODE ||
    'HMS',

  brandName:
    process.env.SEED_BRAND_NAME ||
    'Demo Hotels',

  brandCode:
    process.env.SEED_BRAND_CODE ||
    'DH',

  regionName:
    process.env.SEED_REGION_NAME ||
    'Demo Region',

  propertyName:
    process.env.SEED_PROPERTY_NAME ||
    'Demo Hotel',

  propertyCode:
    process.env.SEED_PROPERTY_CODE ||
    'HTL001',

  city:
    process.env.SEED_CITY ||
    'Demo City',

  state:
    process.env.SEED_STATE ||
    '',

  country:
    process.env.SEED_COUNTRY ||
    'India',

  adminEmail:
    process.env.SEED_ADMIN_EMAIL ||
    'admin@hms.local',

  adminPassword:
    process.env.SEED_ADMIN_PASSWORD ||
    'Admin@123',

  frontDeskEmail:
    process.env.SEED_FRONTDESK_EMAIL ||
    'frontdesk@hms.local',

  frontDeskPassword:
    process.env.SEED_FRONTDESK_PASSWORD ||
    'FrontDesk@123',

  bookingPrefix:
    process.env.BOOKING_PREFIX ||
    'HMS',
};

(async () => {
  await connectDB();

  /*
  ============================================================
  SAFE SEED MODE
  ============================================================
  */

  const forceReset =
    String(process.env.SEED_RESET || '')
      .toLowerCase() === 'true';

  if (forceReset) {
    console.log(
      'WARNING: SEED_RESET=true -> clearing database collections...'
    );

    for (
      const model of Object.values(
        require('mongoose').models
      )
    ) {
      await model.deleteMany({});
    }

    console.log(
      'Database reset complete. Rebuilding demo data...'
    );
  } else {
    const existingProperty =
      await Property.findOne({
        code: cfg.propertyCode,
      });

    if (existingProperty) {
      console.log(
        `Existing property ${cfg.propertyCode} found.`
      );

      console.log(
        'Running SAFE production seed...'
      );

      const ensureUser = async ({
        name,
        email,
        password,
        role,
        department,
      }) => {
        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();

        let user =
          await User.findOne({
            email: normalizedEmail,
          });

        if (!user) {
          user = new User({
            organization:
              existingProperty.organization,

            properties: [
              existingProperty._id,
            ],

            name,
            email: normalizedEmail,
            password,
            role,

            ...(department
              ? { department }
              : {}),
          });
        } else {
          user.organization =
            existingProperty.organization;

          const currentProperties =
            Array.isArray(user.properties)
              ? user.properties
              : [];

          const alreadyHasProperty =
            currentProperties.some(
              (id) =>
                String(id) ===
                String(existingProperty._id)
            );

          if (!alreadyHasProperty) {
            user.properties = [
              ...currentProperties,
              existingProperty._id,
            ];
          }

          user.name = name;
          user.email = normalizedEmail;
          user.password = password;
          user.role = role;

          if (department) {
            user.department = department;
          }
        }

        await user.save();

        console.log(
          `Login ready: ${normalizedEmail}`
        );
      };

      await ensureUser({
        name: 'SaaS Super Admin',
        email: cfg.adminEmail,
        password: cfg.adminPassword,
        role: 'saas_super_admin',
        department: 'IT',
      });

      await ensureUser({
        name: 'Front Desk Demo',
        email: cfg.frontDeskEmail,
        password: cfg.frontDeskPassword,
        role: 'front_desk',
        department: 'Front Desk',
      });

      const demoUsers = [
        {
          name: 'Housekeeping Demo',
          email: 'housekeeping@hms.local',
          password: 'Housekeeping@123',
          role: 'housekeeping_supervisor',
          department: 'Housekeeping',
        },
        {
          name: 'Finance Demo',
          email: 'finance@hms.local',
          password: 'Finance@123',
          role: 'finance',
          department: 'Finance',
        },
        {
          name: 'Revenue Demo',
          email: 'revenue@hms.local',
          password: 'Revenue@123',
          role: 'revenue_manager',
          department: 'Revenue',
        },
        {
          name: 'Engineering Demo',
          email: 'engineering@hms.local',
          password: 'Engineering@123',
          role: 'engineering',
          department: 'Engineering',
        },
        {
          name: 'Restaurant Demo',
          email: 'restaurant@hms.local',
          password: 'Restaurant@123',
          role: 'fnb_cashier_waiter',
          department: 'F&B',
        },
        {
          name: 'Kitchen Demo',
          email: 'kitchen@hms.local',
          password: 'Kitchen@123',
          role: 'kitchen_staff',
          department: 'Kitchen',
        },
        {
          name: 'General Manager',
          email: 'gm@hms.local',
          password: 'Manager@123',
          role: 'general_manager',
          department: 'Management',
        },
        {
          name: 'Sales & Events',
          email: 'sales@hms.local',
          password: 'Sales@123',
          role: 'sales_events',
          department: 'Sales',
        },
        {
          name: 'Cashier Demo',
          email: 'cashier@hms.local',
          password: 'Cashier@123',
          role: 'cashier',
          department: 'Finance',
        },
        {
          name: 'System Admin',
          email: 'system@hms.local',
          password: 'System@123',
          role: 'system_admin',
          department: 'IT',
        },
      ];

      for (const data of demoUsers) {
        await ensureUser(data);
      }

      console.log('');
      console.log(
        '========================================'
      );
      console.log(
        'SAFE PRODUCTION SEED COMPLETE'
      );
      console.log(
        '========================================'
      );
      console.log(
        `Property: ${cfg.propertyCode}`
      );
      console.log(
        `Admin: ${cfg.adminEmail} / ${cfg.adminPassword}`
      );
      console.log(
        `Front Desk: ${cfg.frontDeskEmail} / ${cfg.frontDeskPassword}`
      );
      console.log(
        'Existing hotel data was NOT deleted.'
      );
      console.log(
        '========================================'
      );

      process.exit(0);
    }

    console.log(
      `Property ${cfg.propertyCode} not found.`
    );

    console.log(
      'Fresh database detected. Creating full demo dataset...'
    );
  }

  /*
  ============================================================
  ORGANIZATION / PROPERTY STRUCTURE
  ============================================================
  */

  const org =
    await Organization.create({
      name: cfg.orgName,
      code: cfg.orgCode,
      plan: 'enterprise',
    });

  const brand =
    await Brand.create({
      organization: org._id,
      name: cfg.brandName,
      code: cfg.brandCode,
    });

  const region =
    await Region.create({
      organization: org._id,
      brand: brand._id,
      name: cfg.regionName,
      code: 'REGION',
    });

  const property =
    await Property.create({
      organization: org._id,
      brand: brand._id,
      region: region._id,
      name: cfg.propertyName,
      code: cfg.propertyCode,
      city: cfg.city,
      state: cfg.state,
      country: cfg.country,
    });

  const building =
    await Building.create({
      organization: org._id,
      property: property._id,
      name: 'Main Building',
      code: 'MAIN',
    });

  const floor =
    await Floor.create({
      organization: org._id,
      property: property._id,
      building: building._id,
      name: 'First Floor',
      number: 1,
    });

  /*
  ============================================================
  USERS
  ============================================================
  */

  await User.create({
    organization: org._id,
    properties: [property._id],
    name: 'SaaS Super Admin',
    email: cfg.adminEmail,
    password: cfg.adminPassword,
    role: 'saas_super_admin',
  });

  await User.create({
    organization: org._id,
    properties: [property._id],
    name: 'Front Desk Demo',
    email: cfg.frontDeskEmail,
    password: cfg.frontDeskPassword,
    role: 'front_desk',
  });

  const demoUsers = [
    [
      'Housekeeping Demo',
      'housekeeping@hms.local',
      'Housekeeping@123',
      'housekeeping_supervisor',
      'Housekeeping',
    ],
    [
      'Finance Demo',
      'finance@hms.local',
      'Finance@123',
      'finance',
      'Finance',
    ],
    [
      'Revenue Demo',
      'revenue@hms.local',
      'Revenue@123',
      'revenue_manager',
      'Revenue',
    ],
    [
      'Engineering Demo',
      'engineering@hms.local',
      'Engineering@123',
      'engineering',
      'Engineering',
    ],
    [
      'Restaurant Demo',
      'restaurant@hms.local',
      'Restaurant@123',
      'fnb_cashier_waiter',
      'F&B',
    ],
    [
      'Kitchen Demo',
      'kitchen@hms.local',
      'Kitchen@123',
      'kitchen_staff',
      'Kitchen',
    ],
    [
      'General Manager',
      'gm@hms.local',
      'Manager@123',
      'general_manager',
      'Management',
    ],
    [
      'Sales & Events',
      'sales@hms.local',
      'Sales@123',
      'sales_events',
      'Sales',
    ],
    [
      'Cashier Demo',
      'cashier@hms.local',
      'Cashier@123',
      'cashier',
      'Finance',
    ],
    [
      'System Admin',
      'system@hms.local',
      'System@123',
      'system_admin',
      'IT',
    ],
  ];

  for (
    const [
      name,
      email,
      password,
      role,
      department,
    ] of demoUsers
  ) {
    await User.create({
      organization: org._id,
      properties: [property._id],
      name,
      email,
      password,
      role,
      department,
    });
  }

  /*
  ============================================================
  ROOM TYPES
  ============================================================
  */

  const deluxe =
    await RoomType.create({
      organization: org._id,
      property: property._id,
      name: 'Deluxe',
      code: 'DLX',
      baseRate: 4500,
      maxOccupancy: 3,
      amenities: [
        'Wi-Fi',
        'Breakfast',
        'Smart TV',
        'Mini Bar',
        'Air Conditioning',
      ],
    });

  const suite =
    await RoomType.create({
      organization: org._id,
      property: property._id,
      name: 'Executive Suite',
      code: 'STE',
      baseRate: 8500,
      maxOccupancy: 4,
      amenities: [
        'Wi-Fi',
        'Breakfast',
        'Living Area',
        'Bathtub',
        'Mini Bar',
        'Smart TV',
      ],
    });

  const premium =
    await RoomType.create({
      organization: org._id,
      property: property._id,
      name: 'Premium Suite',
      code: 'PRM',
      baseRate: 12500,
      maxOccupancy: 5,
      amenities: [
        'Wi-Fi',
        'Breakfast',
        'Luxury Lounge',
        'Smart TV',
        'Mini Bar',
        'Bathtub',
        'Concierge',
        'Premium View',
      ],
    });

  /*
  ============================================================
  ACTUAL ROOMS
  ============================================================
  */

  const rooms = [];

  for (
    let i = 101;
    i <= 105;
    i++
  ) {
    rooms.push(
      await Room.create({
        organization: org._id,
        property: property._id,
        building: building._id,
        floor: floor._id,
        roomType: deluxe._id,
        number: String(i),
        bedType: 'King',
        capacity: 3,
        status: 'Vacant Clean',
      })
    );
  }

  for (
    let i = 106;
    i <= 109;
    i++
  ) {
    rooms.push(
      await Room.create({
        organization: org._id,
        property: property._id,
        building: building._id,
        floor: floor._id,
        roomType: suite._id,
        number: String(i),
        bedType: 'King',
        capacity: 4,
        status: 'Vacant Clean',
      })
    );
  }

  for (
    let i = 110;
    i <= 112;
    i++
  ) {
    rooms.push(
      await Room.create({
        organization: org._id,
        property: property._id,
        building: building._id,
        floor: floor._id,
        roomType: premium._id,
        number: String(i),
        bedType: 'Luxury King',
        capacity: 5,
        status: 'Vacant Clean',
      })
    );
  }

  /*
  ============================================================
  DEMO GUEST
  ============================================================
  */

  const guest =
    await Guest.create({
      organization: org._id,
      property: property._id,
      fullName: 'Demo Guest',
      email: 'guest@example.com',
      phone: '9999999999',
      tags: ['VIP'],
      preferences: {
        food: 'Vegetarian',
      },
    });

  /*
  ============================================================
  DEMO RESERVATION
  ============================================================
  */

  const cin = new Date();

  cin.setDate(
    cin.getDate() + 1
  );

  cin.setHours(
    14,
    0,
    0,
    0
  );

  const cout =
    new Date(cin);

  cout.setDate(
    cout.getDate() + 2
  );

  const reservation =
    await Reservation.create({
      organization: org._id,
      property: property._id,

      confirmationNumber:
        `${cfg.bookingPrefix}-${uuid()
          .slice(0, 8)
          .toUpperCase()}`,

      guest:
        guest._id,

      roomType:
        deluxe._id,

      room:
        rooms[0]._id,

      checkIn:
        cin,

      checkOut:
        cout,

      nights:
        2,

      adults:
        2,

      ratePlan:
        'Best Available Rate',

      mealPlan:
        'Breakfast',

      source:
        'Direct',

      status:
        'confirmed',

      rate:
        4500,
    });

  await Room.findByIdAndUpdate(
    rooms[0]._id,
    {
      status:
        'Reserved',
    }
  );

  /*
  ============================================================
  DEMO FOLIO
  ============================================================
  */

  await Folio.create({
    organization:
      org._id,

    property:
      property._id,

    reservation:
      reservation._id,

    guest:
      guest._id,

    currency:
      process.env.DEFAULT_CURRENCY ||
      'INR',

    items: [
      {
        type:
          'room',

        department:
          'Rooms',

        description:
          'Advance room charge - demo booking',

        qty:
          2,

        unitPrice:
          4500,

        amount:
          9000,

        tax:
          1080,
      },
    ],
  });

  /*
  ============================================================
  RATE PLANS
  ============================================================
  */

  await ent[
    'rate-plans'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    name:
      'Best Available Rate',

    code:
      'BAR',

    mealPlan:
      'Breakfast',

    baseRate:
      4500,

    refundable:
      true,

    active:
      true,
  });

  await ent[
    'rate-rules'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    name:
      'Weekend uplift',

    ruleType:
      'weekday',

    weekday:
      'Saturday',

    adjustmentType:
      'percent',

    adjustmentValue:
      10,

    priority:
      10,

    active:
      true,
  });

  /*
  ============================================================
  CHANNEL MAPPING
  ============================================================
  */

  await ent[
    'channel-mappings'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    channel:
      'Booking.com',

    externalRoomType:
      'DELUXE_EXT',

    internalRoomType:
      'DLX',

    externalRatePlan:
      'BAR_EXT',

    internalRatePlan:
      'BAR',

    status:
      'configured',
  });

  /*
  ============================================================
  UPSELLS
  ============================================================
  */

  await ent[
    'upsell-offers'
  ].insertMany([
    {
      organization:
        org._id,

      property:
        property._id,

      name:
        'Breakfast Upgrade',

      type:
        'meal',

      price:
        650,

      eligibility: {
        minNights:
          1,
      },

      inventoryRequired:
        false,

      active:
        true,

      revenueAttribution:
        0,
    },

    {
      organization:
        org._id,

      property:
        property._id,

      name:
        'Late Checkout',

      type:
        'late-checkout',

      price:
        1200,

      eligibility: {
        status:
          'confirmed',

        beforeCheckInOnly:
          true,
      },

      inventoryRequired:
        true,

      active:
        true,

      revenueAttribution:
        0,
    },
  ]);

  /*
  ============================================================
  PROMO CODES
  ============================================================
  */

  await ent[
    'promo-codes'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    code:
      'WELCOME10',

    description:
      'Direct booking welcome offer',

    discountType:
      'percent',

    discountValue:
      10,

    minNights:
      1,

    memberOnly:
      false,

    active:
      true,
  });

  await ent[
    'promo-codes'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    code:
      'FREESTAY100',

    description:
      'Demo complimentary direct-booking coupon',

    discountType:
      'percent',

    discountValue:
      100,

    minNights:
      1,

    memberOnly:
      false,

    active:
      true,
  });

  /*
  ============================================================
  HOTEL PACKAGES
  ============================================================
  */

  await ent[
    'hotel-packages'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    name:
      'Stay & Dine',

    code:
      'STAYDINE',

    description:
      'Room with breakfast and dinner credit',

    roomTypeId:
      deluxe._id,

    ratePlan:
      'Best Available Rate',

    price:
      5600,

    addons: [
      {
        name:
          'Dinner Credit',

        price:
          1000,
      },
    ],

    active:
      true,
  });

  await ent[
    'hotel-packages'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    name:
      'Premium Escape',

    code:
      'PREMIUMESCAPE',

    description:
      'Premium Suite with breakfast, concierge service and spa credit',

    roomTypeId:
      premium._id,

    ratePlan:
      'Best Available Rate',

    price:
      14500,

    addons: [
      {
        name:
          'Spa Credit',

        price:
          1500,
      },

      {
        name:
          'Welcome Amenities',

        price:
          500,
      },
    ],

    active:
      true,
  });

  /*
  ============================================================
  LOYALTY
  ============================================================
  */

  await ent[
    'loyalty-accounts'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    guestId:
      guest._id,

    membershipNumber:
      'LOY-DEMO001',

    tier:
      'Silver',

    points:
      500,

    lifetimePoints:
      500,

    status:
      'active',
  });

  /*
  ============================================================
  SAAS PLANS
  ============================================================
  */

  await ent[
    'plans'
  ].insertMany([
    {
      organization:
        org._id,

      name:
        'Standard',

      code:
        'STD',

      priceMonthly:
        4999,

      modules: [
        'PMS',
        'Housekeeping',
        'Basic Reports',
      ],

      active:
        true,
    },

    {
      organization:
        org._id,

      name:
        'Premium',

      code:
        'PREM',

      priceMonthly:
        12999,

      modules: [
        'PMS',
        'POS',
        'Inventory',
        'CRM',
        'Booking Engine',
        'Channel Manager',
        'Maintenance',
        'Loyalty',
        'Spa',
        'Banquet',
      ],

      active:
        true,
    },

    {
      organization:
        org._id,

      name:
        'Enterprise',

      code:
        'ENT',

      priceMonthly:
        29999,

      modules: [
        'All Premium',
        'Multi-property',
        'CRS',
        'SSO',
        'Advanced RBAC',
        'Approvals',
        'API Hub',
        'Forecasting',
        'AI',
        'Smart Room',
      ],

      active:
        true,
    },
  ]);

  /*
  ============================================================
  SUPPLIERS
  ============================================================
  */

  await ent[
    'suppliers'
  ].insertMany([
    {
      organization:
        org._id,

      property:
        property._id,

      name:
        'Demo Hospitality Supplies',

      contact:
        'Procurement Desk',

      email:
        'supplier@example.com',

      phone:
        '9999999998',

      paymentTerms:
        'Net 30',

      rating:
        4.5,

      status:
        'active',
    },

    {
      organization:
        org._id,

      property:
        property._id,

      name:
        'Premium Linen & Amenities',

      contact:
        'Sales Desk',

      email:
        'linen@example.com',

      phone:
        '9999999997',

      paymentTerms:
        'Net 15',

      rating:
        4.7,

      status:
        'active',
    },
  ]);

  /*
  ============================================================
  INVENTORY
  ============================================================
  */

  await ent[
    'inventory-items'
  ].create({
    organization:
      org._id,

    property:
      property._id,

    sku:
      'HK-SOAP-01',

    name:
      'Guest Soap',

    category:
      'Amenities',

    department:
      'Housekeeping',

    store:
      'Main Store',

    unit:
      'pcs',

    qtyOnHand:
      500,

    minStock:
      100,

    reorderPoint:
      150,

    averageCost:
      18,
  });

  /*
  ============================================================
  RESTAURANT MENU
  ============================================================
  */

  await ent[
    'menu-items'
  ].insertMany([
    {
      organization:
        org._id,

      property:
        property._id,

      category:
        'Main Course',

      name:
        'Paneer Tikka',

      price:
        420,

      taxPercent:
        5,

      available:
        true,

      kitchenStation:
        'Hot Kitchen',
    },

    {
      organization:
        org._id,

      property:
        property._id,

      category:
        'Main Course',

      name:
        'Dal Makhani',

      price:
        360,

      taxPercent:
        5,

      available:
        true,

      kitchenStation:
        'Hot Kitchen',
    },

    {
      organization:
        org._id,

      property:
        property._id,

      category:
        'Beverages',

      name:
        'Fresh Lime Soda',

      price:
        180,

      taxPercent:
        5,

      available:
        true,

      kitchenStation:
        'Beverage',
    },

    {
      organization:
        org._id,

      property:
        property._id,

      category:
        'Dessert',

      name:
        'Chocolate Brownie',

      price:
        280,

      taxPercent:
        5,

      available:
        true,

      kitchenStation:
        'Dessert',
    },
  ]);

  /*
  ============================================================
  COMPLETE
  ============================================================
  */

  console.log('');
  console.log(
    '=============================='
  );

  console.log(
    'Hotel Management Seed Complete'
  );

  console.log(
    '=============================='
  );

  console.log(
    `Property code: ${cfg.propertyCode}`
  );

  console.log('');

  console.log(
    `Admin: ${cfg.adminEmail} / ${cfg.adminPassword}`
  );

  console.log(
    `Front Desk: ${cfg.frontDeskEmail} / ${cfg.frontDeskPassword}`
  );

  console.log('');

  console.log(
    'Room Types:'
  );

  console.log(
    'Deluxe: ₹4,500 | Rooms 101-105'
  );

  console.log(
    'Executive Suite: ₹8,500 | Rooms 106-109'
  );

  console.log(
    'Premium Suite: ₹12,500 | Rooms 110-112'
  );

  console.log('');

  console.log(
    'Free booking coupon: FREESTAY100'
  );

  console.log(
    'Welcome coupon: WELCOME10'
  );

  console.log(
    '=============================='
  );

  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});