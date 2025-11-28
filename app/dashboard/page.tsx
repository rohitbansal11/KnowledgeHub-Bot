'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface KnowledgeBaseItem {
  _id: string;
  vectorId: string;
  title: string;
  content: string;
  source?: 'file' | 'website';
  fileName?: string;
  sourceUrl?: string;
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState<KnowledgeBaseItem[]>([]);
  const [pasteTitle, setPasteTitle] = useState<string>('');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [pasting, setPasting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and fetch knowledge base items
    fetch('/api/knowledge-base')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
        } else if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.items) {
          setKnowledgeBaseItems(data.items);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', fileTitle || file.name);

      const response = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setFile(null);
      setFileTitle('');
      setLoading(false);
      
      // Refresh knowledge base items
      fetch('/api/knowledge-base')
        .then((res) => res.json())
        .then((data) => {
          if (data?.items) {
            setKnowledgeBaseItems(data.items);
          }
        });
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setLoading(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/knowledge-base/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title: urlTitle || url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Scraping failed' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Website scraped successfully!' });
      setUrl('');
      setUrlTitle('');
      setLoading(false);
      
      // Refresh knowledge base items
      fetch('/api/knowledge-base')
        .then((res) => res.json())
        .then((data) => {
          if (data?.items) {
            setKnowledgeBaseItems(data.items);
          }
        });
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setLoading(false);
    }
  };

  const handlePasteText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) {
      setMessage({ type: 'error', text: 'Please paste some text content' });
      return;
    }

    setPasting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/knowledge-base/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pasteTitle || 'Pasted Text',
          content: pasteContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save text' });
        setPasting(false);
        return;
      }

      setMessage({ type: 'success', text: 'Text saved successfully!' });
      setPasteTitle('');
      setPasteContent('');
      setPasting(false);
      
      // Refresh knowledge base items
      fetch('/api/knowledge-base')
        .then((res) => res.json())
        .then((data) => {
          if (data?.items) {
            setKnowledgeBaseItems(data.items);
          }
        });
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setPasting(false);
    }
  };

  const stats = {
    totalItems: knowledgeBaseItems.length,
    files: knowledgeBaseItems.filter(item => item.source === 'file' && item.fileName).length,
    websites: knowledgeBaseItems.filter(item => item.source === 'website').length,
    pasted: knowledgeBaseItems.filter(item => item.source === 'file' && !item.fileName).length,
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your knowledge base and add new content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Items</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalItems}</p>
              </div>
              <div className="bg-indigo-500/20 rounded-full p-3 border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Files</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.files}</p>
              </div>
              <div className="bg-blue-500/20 rounded-full p-3 border border-blue-500/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Websites</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.websites}</p>
              </div>
              <div className="bg-green-500/20 rounded-full p-3 border border-green-500/30">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pasted Text</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pasted}</p>
              </div>
              <div className="bg-purple-500/20 rounded-full p-3 border border-purple-500/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg flex items-center gap-3 border backdrop-blur-xl ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload Section */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 backdrop-blur-xl px-6 py-4 border-b border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 rounded-lg p-2 border border-indigo-500/30">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Upload Text File</h2>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
                    Title <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter title for the file"
                  />
                </div>
                <div>
                  <label htmlFor="file" className="block text-sm font-semibold text-gray-300 mb-2">
                    Select File
                  </label>
                  <div className="relative">
                    <input
                      id="file"
                      type="file"
                      accept="text/*,.txt,.md,.json,.csv,.log,.xml,.html,.css,.js,.ts,.py,.java,.cpp,.c,.h,.sh,.yaml,.yml,.ini,.conf,.properties,.sql"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 file:border file:border-indigo-500/30 hover:file:bg-indigo-500/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Supports: .txt, .md, .json, .csv, .log, .xml, .html, code files, and more
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Web Scraping Section */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-xl px-6 py-4 border-b border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Scrape Website</h2>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleScrape} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="urlTitle" className="block text-sm font-semibold text-gray-300 mb-2">
                    Title <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="urlTitle"
                    type="text"
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter title for the website"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scraping...
                    </span>
                  ) : (
                    'Scrape Website'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Paste Text Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-xl px-6 py-4 border-b border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Paste Text</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-6">
              Copy text from anywhere and paste it here to add it to your knowledge base
            </p>
            <form onSubmit={handlePasteText} className="space-y-4">
              <div>
                <label htmlFor="pasteTitle" className="block text-sm font-semibold text-gray-300 mb-2">
                  Title <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="pasteTitle"
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter a title for this text"
                />
              </div>
              <div>
                <label htmlFor="pasteContent" className="block text-sm font-semibold text-gray-300 mb-2">
                  Paste Your Text Here
                </label>
                <textarea
                  id="pasteContent"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  placeholder="Paste or type your text here..."
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  {pasteContent.length} characters
                </p>
              </div>
              <button
                type="submit"
                disabled={pasting || loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/20"
              >
                {pasting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save to Knowledge Base'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

