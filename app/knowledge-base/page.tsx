'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface KnowledgeBaseItem {
  _id: string;
  title: string;
  content: string;
  source: 'file' | 'website';
  sourceUrl?: string;
  fileName?: string;
  vectorId: string;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setItems(data.items || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching items:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (vectorId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge-base?vectorId=${vectorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to delete item');
        return;
      }

      fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('An error occurred while deleting');
    }
  };

  const handleEdit = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectorId: editingItem.vectorId,
          title: editTitle,
          content: editContent,
        }),
      });

      if (!response.ok) {
        alert('Failed to update item');
        setSaving(false);
        return;
      }

      setEditingItem(null);
      setEditTitle('');
      setEditContent('');
      fetchItems();
      setSaving(false);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('An error occurred while updating');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Knowledge Base</h1>

        {editingItem && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-2xl mb-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/20"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 border border-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {items.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-2xl text-center text-gray-400 border border-white/10">
              No items in your knowledge base yet. Upload a file or scrape a website to get started.
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-2xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.source === 'file' ? `File: ${item.fileName}` : `Website: ${item.sourceUrl}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-500/30 border border-indigo-500/30 text-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.vectorId)}
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 border border-red-500/30 text-sm transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {item.content.substring(0, 500)}
                    {item.content.length > 500 && '...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

