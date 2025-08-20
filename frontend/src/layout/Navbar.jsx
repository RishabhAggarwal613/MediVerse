// src/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AvatarMenu from '@/components/ui/AvatarMenu.jsx';
import logoUrl from '@/assets/logos/mediverse.svg';

const navItems = [
  { to: '/medi-ai', label: 'MediAI' },
  { to: '/report-scanner', label: 'Report Scanner' },
  { to: '/wearables', label: 'Wearables' },
  { to: '/diet-planner', label: 'Diet Planner' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useSelector((s) => s.auth || {});
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#1A1F1D] bg-[#0B0F10]/80 backdrop-blur-md">
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-x-0 focus:top-2 focus:mx-auto focus:w-max focus:rounded-md focus:bg-emerald-500 focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2 font-semibold">
          <img src={logoUrl} alt="MediVerse" className="h-7 w-7" />
          <span className="text-gray-100 group-hover:text-white">MediVerse</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm transition',
                    isActive ? 'bg-emerald-500 text-black' : 'text-gray-300 hover:bg-white/5',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <AvatarMenu />
          ) : (
            <>
              <Link
                to="/auth/login"
                className="rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <IconButton
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            size="small"
            sx={{
              border: '1px solid #1A1F1D',
              backgroundColor: '#0F1412',
              '&:hover': { backgroundColor: '#111815' },
              color: '#E5E7EB',
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="border-t border-[#1A1F1D] bg-[#0F1412]">
            <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        'block rounded-lg px-3 py-2 text-sm transition',
                        isActive ? 'bg-emerald-500 text-black' : 'text-gray-300 hover:bg-white/5',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li className="mt-2">
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <AvatarMenu />
                  ) : (
                    <>
                      <Link
                        to="/auth/login"
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-lg px-3 py-2 text-center text-sm text-gray-300 hover:bg-white/5"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/auth/signup"
                        onClick={() => setOpen(false)}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
