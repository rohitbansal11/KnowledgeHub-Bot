'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function EmbedPage() {
  const [embedCode, setEmbedCode] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    // Get the current origin for the embed URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/embed/chat`;
    setIframeUrl(url);
    
    // Generate embed code
    const code = `<iframe 
  src="${url}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  allow="clipboard-read; clipboard-write">
</iframe>

<!-- Or use a div with specific dimensions -->
<div style="width: 100%; height: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <iframe 
    src="${url}" 
    width="100%" 
    height="100%" 
    frameborder="0"
    allow="clipboard-read; clipboard-write">
  </iframe>
</div>`;
    
    setEmbedCode(code);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Embed Chat Widget</h1>
        <p className="text-gray-400 mb-8">
          Embed the AI chat widget into your website using the code below.
        </p>

        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
          <div className="border border-white/10 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={iframeUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ display: 'block' }}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Embed Code</h2>
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              Copy Code
            </button>
          </div>
          <textarea
            readOnly
            value={embedCode}
            className="w-full h-64 p-4 border border-white/10 rounded-lg font-mono text-sm bg-gray-900/50 text-gray-300"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Copy the embed code above</li>
            <li>Paste it into your website's HTML where you want the chat widget to appear</li>
            <li>Adjust the width and height attributes to fit your design</li>
            <li>Users will need to be logged in to use the chat (they'll be redirected to login if not authenticated)</li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-xl">
            <p className="text-sm text-yellow-400">
              <strong>Note:</strong> The chat widget requires users to be authenticated. Make sure users are logged in to your KnowledgeHub Bot application before using the embedded chat.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

