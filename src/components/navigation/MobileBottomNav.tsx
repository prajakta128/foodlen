import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Barcode, Search, Heart, User } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: Home, end: true },
  { path: '/scan', label: 'Scan', icon: Barcode, end: false },
  { path: '/search', label: 'Search', icon: Search, end: false },
  { path: '/saved', label: 'Saved', icon: Heart, end: false },
  { path: '/profile', label: 'Profile', icon: User, end: false },
];

/** App-style bottom tab bar for signed-in users on small screens. Desktop keeps the top navbar. */
const MobileBottomNav: React.FC = () => (
  <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-5">
      {tabs.map(({ path, label, icon: Icon, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
              isActive ? 'text-emerald-600' : 'text-gray-500'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default MobileBottomNav;
