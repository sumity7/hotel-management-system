import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './AuthContext';
import { getHomeForRole } from './routeHome';

import Layout from './Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Calendar from './pages/Calendar';
import Rooms from './pages/Rooms';
import Folios from './pages/Folios';
import Housekeeping from './pages/Housekeeping';
import GenericModule from './pages/GenericModule';
import Reports from './pages/Reports';
import AI from './pages/AI';
import Audit from './pages/Audit';
import Approvals from './pages/Approvals';
import Admin from './pages/Admin';
import BookingEngine from './pages/BookingEngine';
import GuestPortal from './pages/GuestPortal';
import POS from './pages/POS';
import RevenueDistribution from './pages/RevenueDistribution';
import GuestExperience from './pages/GuestExperience';
import ReservationControl from './pages/ReservationControl';
import CheckIn from './pages/CheckIn';
import Procurement from './pages/Procurement';
import OperationsCenter from './pages/OperationsCenter';

function Guard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center">Loading…</div>;
  }

  return user ? <Layout /> : <Navigate to="/login" replace />;
}

function RoleHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getHomeForRole(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route path="/" element={<Home />} />

        <Route
          path="/book"
          element={<BookingEngine />}
        />

        <Route
          path="/guest"
          element={<GuestPortal />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* STAFF / ADMIN */}
        <Route element={<Guard />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/reservations"
            element={<Reservations />}
          />

          <Route
            path="/reservation-control"
            element={<ReservationControl />}
          />

          <Route
            path="/check-in"
            element={<CheckIn />}
          />

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/rooms"
            element={<Rooms />}
          />

          <Route
            path="/folios"
            element={<Folios />}
          />

          <Route
            path="/housekeeping"
            element={<Housekeeping />}
          />

          <Route
            path="/revenue-distribution"
            element={<RevenueDistribution />}
          />

          <Route
            path="/guest-experience"
            element={<GuestExperience />}
          />

          <Route
            path="/pos"
            element={<POS />}
          />

          <Route
            path="/procurement"
            element={<Procurement />}
          />

          <Route
            path="/ops/:module"
            element={<OperationsCenter />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/ai"
            element={<AI />}
          />

          <Route
            path="/audit"
            element={<Audit />}
          />

          <Route
            path="/approvals"
            element={<Approvals />}
          />

          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/m/:module"
            element={<GenericModule />}
          />
        </Route>

        <Route
          path="*"
          element={<RoleHome />}
        />
      </Routes>
    </AuthProvider>
  );
}