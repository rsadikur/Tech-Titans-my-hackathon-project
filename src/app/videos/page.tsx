'use client';

import { useState } from 'react';
import { useQuery, api } from '@/lib/convexDisconnected';
import { useConvexReady } from '@/hooks/useConvex';
import { FiVideo, FiImage, FiUser, FiCalendar, FiTag, FiStar, FiGrid, FiList } from 'react-icons/fi';

export default function VideosPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState('all');
  const convexReady = useConvexReady();
  const videos = useQuery(api.evidence.list, convexReady ? { category: category === 'all' ? undefined : category, limit: 50 } : 'skip');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'roads', label: 'Roads' },
    { id: 'corruption', label: 'Corruption' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'environment', label: 'Environment' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">Evidence Videos</h1>
            <p className="text-sm text-muted dark:text-muted-dark mt-1">Browse approved evidence submissions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-primary/10 text-primary dark:text-blue-400' : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-primary/10 text-primary dark:text-blue-400' : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === c.id
                  ? 'bg-primary dark:bg-blue-500 text-white'
                  : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {!videos ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center mb-4">
              <FiVideo className="w-6 h-6 text-primary dark:text-blue-400" />
            </div>
            <p className="text-muted dark:text-muted-dark text-sm">Loading...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center mb-4">
              <FiVideo className="w-6 h-6 text-primary dark:text-blue-400" />
            </div>
            <p className="text-muted dark:text-muted-dark text-sm">No videos yet</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((item: any) => (
              <div key={item._id} className={`rounded-2xl overflow-hidden border border-border dark:border-border-dark glass group ${
                item.status === 'important' ? 'ring-1 ring-amber-500/30' : ''
              }`}>
                {item.url ? (
                  item.type === 'video' ? (
                    <video src={item.url} controls className="w-full h-44 object-cover bg-black" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-44 object-cover bg-black" />
                  )
                ) : (
                  <div className="w-full h-44 bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center">
                    {item.type === 'video' ? <FiVideo className="w-8 h-8 text-muted dark:text-muted-dark" /> : <FiImage className="w-8 h-8 text-muted dark:text-muted-dark" />}
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-semibold text-primary dark:text-white truncate">{item.title}</h3>
                    {item.status === 'important' && <FiStar className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-muted dark:text-muted-dark line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 text-[9px] text-muted dark:text-muted-dark">
                    <span className="flex items-center gap-0.5"><FiUser className="w-2.5 h-2.5" />Anonymous</span>
                    <span className="flex items-center gap-0.5"><FiCalendar className="w-2.5 h-2.5" />{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-0.5"><FiTag className="w-2.5 h-2.5" />{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((item: any) => (
              <div key={item._id} className={`flex gap-4 p-4 rounded-2xl border border-border dark:border-border-dark glass ${
                item.status === 'important' ? 'ring-1 ring-amber-500/30' : ''
              }`}>
                {item.url ? (
                  item.type === 'video' ? (
                    <video src={item.url} controls className="w-32 h-20 rounded-xl object-cover bg-black shrink-0" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-32 h-20 rounded-xl object-cover bg-black shrink-0" />
                  )
                ) : (
                  <div className="w-32 h-20 rounded-xl bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center shrink-0">
                    <FiVideo className="w-6 h-6 text-muted dark:text-muted-dark" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary dark:text-white truncate">{item.title}</h3>
                    {item.status === 'important' && <FiStar className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted dark:text-muted-dark line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted dark:text-muted-dark">
                    <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />Anonymous</span>
                    <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FiTag className="w-3 h-3" />{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
