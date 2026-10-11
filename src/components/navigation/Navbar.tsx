import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Button from '../ui/Button';
import Logo from '../brand/Logo';
import { authService } from '../../services/api';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthed = authService.isAuthenticated();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = isAuthed
    ? [
        { path: '/', label: 'Home' },
        { path: '/scan', label: 'Scan' },
        { path: '/search', label: 'Search' },
        { path: '/restaurants', label: 'Restaurants' },
        { path: '/saved', label: 'Saved' },
      ]
    : [{ path: '/', label: 'Home' }];

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Logo size={32} />
            <span className="font-bold text-gray-900 text-lg hidden sm:inline">
              FoodLens
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthed ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2 space-y-2">
              {isAuthed ? (
                <Button variant="outline" fullWidth size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="outline" fullWidth size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button fullWidth size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
