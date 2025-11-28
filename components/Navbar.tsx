'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav className="bg-black/80 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              KnowledgeHub Bot
            </h1>
          </div>
          <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </nav>
  );
}

