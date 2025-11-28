'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              KnowledgeHub Bot
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium text-gray-300 hover:text-white"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/knowledge-base')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium text-gray-300 hover:text-white"
            >
              Knowledge Base
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium text-gray-300 hover:text-white"
            >
              Chat
            </button>
            <button
              onClick={() => router.push('/embed')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium text-gray-300 hover:text-white"
            >
              Embed
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200 text-sm font-medium text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all duration-200 text-white"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-left text-sm font-medium text-gray-300 hover:text-white"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('/knowledge-base')}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-left text-sm font-medium text-gray-300 hover:text-white"
              >
                Knowledge Base
              </button>
              <button
                onClick={() => handleNavigation('/chat')}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-left text-sm font-medium text-gray-300 hover:text-white"
              >
                Chat
              </button>
              <button
                onClick={() => handleNavigation('/embed')}
                className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-left text-sm font-medium text-gray-300 hover:text-white"
              >
                Embed
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200 text-left text-sm font-medium text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

