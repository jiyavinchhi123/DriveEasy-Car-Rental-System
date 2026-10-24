import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

/**
 * App Component - Root Application Shell
 */
function App() {
  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="main-content">
        <div className="container">
          <AppRoutes />
        </div>
      </main>

      {/* Examination & Project Footer */}
      <Footer />
    </div>
  );
}

export default App;
