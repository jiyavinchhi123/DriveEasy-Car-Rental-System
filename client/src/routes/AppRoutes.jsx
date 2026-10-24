import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * AppRoutes Component
 * Central route configuration for DriveEasy Car Rental System
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Home / Foundation Dashboard */}
      <Route path="/" element={<HomePage />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
