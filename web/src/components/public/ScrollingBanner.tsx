
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Announcement {
  id: string
  title: string
  category: string
}

export default function ScrollingBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, category')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5)
      setAnnouncements(data || [])
    }
    
    fetchAnnouncements()
  }, [supabase])

  if (!user || announcements.length === 0) return null

  return (
    <div className="scrolling-banner">
      <div className="banner-tag">UPDATES</div>
      <div className="ticker-container">
        <div className="ticker-track">
          {[...announcements, ...announcements].map((a, i) => (
            <span key={`${a.id}-${i}`} className="ticker-item">
              <span className="ticker-category">[{a.category.toUpperCase()}]</span>
              {a.title}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        .scrolling-banner {
          height: 40px;
          background: linear-gradient(90deg, #1e3a8a, #3b82f6);
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          z-index: 40;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .banner-tag {
          background: #ef4444;
          color: white;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 0 1rem;
          height: 100%;
          display: flex;
          align-items: center;
          z-index: 2;
          box-shadow: 10px 0 20px rgba(0,0,0,0.2);
          clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
        }
        .ticker-container {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-track {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .ticker-item {
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0 3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ticker-category {
          color: #93c5fd;
          font-weight: 700;
          font-size: 0.75rem;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
