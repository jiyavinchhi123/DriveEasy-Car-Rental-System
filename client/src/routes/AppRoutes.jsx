import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import FleetPage from '../pages/FleetPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import AdminPanel from '../pages/AdminPanel';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * AppRoutes Component
 * Central route configuration for DriveEasy Car Rental System
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Home / System Overview */}
      <Route path="/" element={<HomePage />} />

      {/* Required Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/fleet" element={<FleetPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
