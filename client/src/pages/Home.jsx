import React from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Coffee,
  ConciergeBell,
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
} from 'lucide-react';

const rooms = [
  {
    name: 'Deluxe Room',
    type: 'DLX',
    price: '₹4,500',
    guests: 'Up to 3 Guests',
    bed: 'King Bed',
    image: '/room-deluxe.jpg',
    description:
      'Elegant premium accommodation with refined interiors, modern comforts and curated amenities.',
    amenities: [
      'Wi-Fi',
      'Breakfast',
      'Smart TV',
      'Mini Bar',
    ],
  },

  {
    name: 'Executive Suite',
    type: 'STE',
    price: '₹8,500',
    guests: 'Up to 4 Guests',
    bed: 'King Bed',
    image: '/room-executive.jpg',
    description:
      'Spacious executive suite with a separate living area and premium hospitality experience.',
    amenities: [
      'Wi-Fi',
      'Breakfast',
      'Living Area',
      'Bathtub',
    ],
  },

  {
    name: 'Premium Suite',
    type: 'PRM',
    price: '₹12,500',
    guests: 'Up to 5 Guests',
    bed: 'Luxury King Bed',
    image: '/room-premium.jpg',
    description:
      'Signature luxury suite with elegant lounge space, premium views and personalized service.',
    amenities: [
      'Wi-Fi',
      'Breakfast',
      'Luxury Lounge',
      'Concierge',
    ],
  },
];

export default function Home() {
  return (
    <div className="homeLuxuryPage">

      {/* HEADER */}

      <header className="homeLuxuryNav">

        <div className="homeBrand">

          <div className="homeLogo">
            H
          </div>

          <div>
            <strong>
              Hotel Management System
            </strong>

            <span>
              Premium Enterprise
            </span>
          </div>

        </div>

        <nav>

          <a href="#rooms">
            Rooms
          </a>

          <a href="#experience">
            Experience
          </a>

          <Link to="/guest">
            Guest Portal
          </Link>

          <Link
            to="/login"
            className="homeStaffBtn"
          >
            Staff Login
          </Link>

          <Link
            to="/book"
            className="homeBookBtn"
          >
            Book Now

            <ArrowRight size={17} />
          </Link>

        </nav>

      </header>

      {/* HERO */}

      <section className="homeHero">

        <div className="homeHeroGlow glowOne" />
        <div className="homeHeroGlow glowTwo" />

        <div className="homeHeroCopy">

          <div className="homeEyebrow">
            <Sparkles size={15} />

            Premium hospitality experience
          </div>

          <h1>
            Your Exceptional Stay

            <span>
              Starts Here.
            </span>
          </h1>

          <p>
            Discover premium rooms, effortless booking,
            personalized services and a seamless digital
            guest experience — all in one connected
            hospitality platform.
          </p>

          <div className="homeHeroActions">

            <Link
              to="/book"
              className="homePrimaryBtn"
            >
              <CalendarCheck size={19} />

              Book Your Stay

              <ArrowRight size={17} />
            </Link>

            <Link
              to="/guest"
              className="homeSecondaryBtn"
            >
              Guest Portal
            </Link>

          </div>

          <div className="homeTrust">

            <span>
              <ShieldCheck size={17} />
              Secure Booking
            </span>

            <span>
              <Star size={17} />
              Premium Rooms
            </span>

            <span>
              <ConciergeBell size={17} />
              24/7 Guest Service
            </span>

          </div>

        </div>

        {/* SIGNATURE IMAGE */}

        <div className="homeHeroImageCard">

          <img
            src="/hotel-room.jpg"
            alt="Signature luxury hotel room"
          />

          <div className="homeImageGradient" />

          <div className="homeImageContent">

            <span>
              SIGNATURE COLLECTION
            </span>

            <h2>
              Designed for exceptional stays
            </h2>

            <a href="#rooms">
              Explore Rooms
              <ArrowRight size={17} />
            </a>

          </div>

        </div>

      </section>

      {/* ROOMS */}

      <section
        id="rooms"
        className="homeRooms"
      >

        <div className="homeSectionHead">

          <div>
            <span className="homeSectionLabel">
              STAY YOUR WAY
            </span>

            <h2>
              Rooms & Suites
            </h2>

            <p>
              Premium accommodation for business,
              leisure and luxury stays.
            </p>
          </div>

          <Link
            to="/book"
            className="homeCheckBtn"
          >
            Check Availability

            <ArrowRight size={17} />
          </Link>

        </div>

        <div className="homeRoomGrid">

          {rooms.map((room, index) => (

            <article
              className="homeRoomCard"
              key={room.name}
            >

              <div className="homeRoomImage">

                <img
                  src={room.image}
                  alt={room.name}
                />

                <div className="homeRoomShade" />

                <span className="homeRoomCode">
                  {room.type}
                </span>

                {index === 0 && (
                  <span className="homePopular">
                    <Crown size={12} />
                    Most Popular
                  </span>
                )}

              </div>

              <div className="homeRoomBody">

                <div className="homeRoomTitle">

                  <div>
                    <h3>
                      {room.name}
                    </h3>

                    <p>
                      {room.description}
                    </p>
                  </div>

                  <div className="homePrice">
                    {room.price}

                    <small>
                      / night
                    </small>
                  </div>

                </div>

                <div className="homeRoomMeta">

                  <span>
                    <Users size={14} />
                    {room.guests}
                  </span>

                  <span>
                    <BedDouble size={14} />
                    {room.bed}
                  </span>

                </div>

                <div className="homeAmenities">

                  {room.amenities.map((amenity) => (
                    <span key={amenity}>
                      {amenity}
                    </span>
                  ))}

                </div>

                <Link
                  to="/book"
                  className="homeSelectRoom"
                >
                  Check Availability

                  <ArrowRight size={17} />
                </Link>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* EXPERIENCE */}

      <section
        id="experience"
        className="homeExperience"
      >

        <div className="homeCenterTitle">

          <span className="homeSectionLabel">
            THE HOTEL EXPERIENCE
          </span>

          <h2>
            Everything You Need,
            All In One Stay
          </h2>

        </div>

        <div className="homeExperienceGrid">

          <div>
            <Wifi size={28} />

            <h3>
              High-Speed Wi-Fi
            </h3>

            <p>
              Reliable premium connectivity throughout
              the property.
            </p>
          </div>

          <div>
            <Coffee size={28} />

            <h3>
              Breakfast Included
            </h3>

            <p>
              Start the day with a curated hotel
              breakfast experience.
            </p>
          </div>

          <div>
            <ConciergeBell size={28} />

            <h3>
              Digital Concierge
            </h3>

            <p>
              Manage services and requests using
              the Guest Portal.
            </p>
          </div>

          <div>
            <ShieldCheck size={28} />

            <h3>
              Secure Booking
            </h3>

            <p>
              Safe reservations and integrated
              payment services.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="homeCTA">

        <div>

          <span className="homeSectionLabel">
            YOUR STAY AWAITS
          </span>

          <h2>
            Ready to experience premium hospitality?
          </h2>

          <p>
            Search live room availability and reserve
            your stay instantly.
          </p>

        </div>

        <Link
          to="/book"
          className="homeBookBtn"
        >
          <CalendarCheck size={18} />

          Check Availability

          <ArrowRight size={17} />
        </Link>

      </section>

      <section className="homeBenefits">

        {[
          'Best Price Guarantee',
          'Instant Confirmation',
          'Secure Payment',
          'Guest Portal Access',
        ].map((item) => (

          <span key={item}>
            <CheckCircle2 size={17} />

            {item}
          </span>

        ))}

      </section>

    </div>
  );
}