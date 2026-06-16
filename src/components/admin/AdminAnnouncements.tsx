import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Power } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { formatDistanceToNow } from 'date-fns';

export function AdminAnnouncements() {
  const { announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement } = useAdminData();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      addAnnouncement(title, content);
      setTitle('');
      setContent('');
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string, annTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${annTitle}"?`)) {
      deleteAnnouncement(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">Manage banners that appear at the top of your website.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-royal-purple/90 dark:hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-royal-purple/20 dark:border-white/10 p-6 transition-colors">
          <h2 className="font-serif text-xl text-royal-purple dark:text-gold-light mb-4">Create Announcement</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-1 block">Short Title (Internal)</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Diwali Sale 2026"
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 dark:bg-[#121212] dark:text-white rounded-xl focus:border-royal-purple outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-sans uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-1 block">Banner Message *</label>
              <input 
                type="text" 
                value={content} 
                onChange={e => setContent(e.target.value)}
                placeholder="e.g. 🎉 Special Diwali Offer: Flat 20% off on all Premium Tiles! Shop Now."
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 dark:bg-[#121212] dark:text-white rounded-xl focus:border-royal-purple outline-none text-sm transition-colors"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This text will be scrolled across the top of your website.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 rounded-xl text-sm font-semibold bg-royal-purple dark:bg-divine-gold dark:text-royal-purple text-white hover:bg-royal-purple/90 dark:hover:opacity-90 transition-all">
                Publish Banner
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#1e1e1e] transition-colors">
            <Megaphone className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">No announcements yet. Create one to display a banner on your site.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className={`bg-white dark:bg-[#1e1e1e] rounded-2xl border p-6 relative transition-colors ${ann.isActive ? 'border-green-400 dark:border-green-500/50 shadow-md shadow-green-100 dark:shadow-none' : 'border-gray-200 dark:border-white/10 shadow-sm opacity-75'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-lg text-gray-900 dark:text-white">{ann.title}</h3>
                    {ann.isActive ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">Disabled</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Created {formatDistanceToNow(ann.createdAt, { addSuffix: true })}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleAnnouncement(ann.id, !ann.isActive)}
                    className={`p-2 rounded-full transition-colors ${ann.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    title={ann.isActive ? "Disable Banner" : "Enable Banner"}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-colors">
                <p className="font-sans text-sm text-gray-700 dark:text-gray-300 italic">"{ann.content}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
