import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import FleetPage from '../pages/FleetPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import Loading from '../components/Loading';

// Lazy-loaded AdminPanel component via React.lazy
const AdminPanel = React.lazy(() => import('../pages/AdminPanel'));

/**
 * Central Application Routes Configuration
 * 
 * Required Route Map:
 * - /             → LoginPage
 * - /fleet        → FleetPage (Protected)
 * - /my-bookings  → MyBookingsPage (Protected)
 * - /admin        → AdminPanel (Protected with role guard & Lazy Loaded with Suspense)
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Entry: Login Page at / */}
      <Route path="/" element={<LoginPage />} />

      {/* 2. Protected Route: Fleet Page */}
      <Route
        path="/fleet"
        element={
          <ProtectedRoute>
            <FleetPage />
          </ProtectedRoute>
        }
      />

      {/* 3. Protected Route: My Bookings Page */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />

      {/* 4. Protected & Lazy-Loaded Route: Admin Panel (Restricted to 'admin' and 'fleet_manager') */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'fleet_manager']}>
            <Suspense fallback={<Loading message="Loading Administrator & Fleet Console..." />}>
              <AdminPanel />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* 5. Catch-all: 404 Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
