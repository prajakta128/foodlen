import React from 'react';
import { Navbar, Footer, MobileBottomNav } from '../components/navigation';
import { authService } from '../services/api';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isAuthed = authService.isAuthenticated();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className={`flex-1 ${isAuthed ? 'pb-16 md:pb-0' : ''}`}>{children}</main>
      <Footer />
      {isAuthed && <MobileBottomNav />}
    </div>
  );
};

export default AppLayout;
