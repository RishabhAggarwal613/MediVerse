// src/layout/Footer.jsx
import { Link } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import logoUrl from '@/assets/logos/mediverse.svg';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[#1A1F1D] bg-[#0B0F10]">
      {/* subtle emerald top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="MediVerse logo" className="h-8 w-8" />
              <span className="text-lg font-semibold text-gray-100">MediVerse</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-gray-400">
              AI health chat, report scanner, wearables sync, and diet planning — privacy-first.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                aria-label="GitHub"
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-gray-300 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
              >
                <GitHubIcon fontSize="small" />
              </a>
              <a
                aria-label="X"
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-gray-300 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
              >
                <XIcon fontSize="small" />
              </a>
              <a
                aria-label="LinkedIn"
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-gray-300 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
              >
                <LinkedInIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link to="/medi-ai" className="hover:text-gray-200">MediAI</Link></li>
              <li><Link to="/report-scanner" className="hover:text-gray-200">Report Scanner</Link></li>
              <li><Link to="/wearables" className="hover:text-gray-200">Wearables</Link></li>
              <li><Link to="/diet-planner" className="hover:text-gray-200">Diet Planner</Link></li>
              <li><Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-gray-200">Features</a></li>
              <li><a href="#about" className="hover:text-gray-200">About</a></li>
              <li><a href="#faq" className="hover:text-gray-200">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-gray-200">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-gray-200">Terms</Link></li>
              <li><Link to="/security" className="hover:text-gray-200">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[#1A1F1D] pt-6 text-sm text-gray-500">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {year} MediVerse. All rights reserved.</p>
            <p className="text-gray-400">
              Built with <span className="text-emerald-500">React</span> • Tailwind • MUI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
