'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // For now, redirect to a search results page or handle filtering dynamically
    // A robust search would hit an API route that queries students, subjects, announcements.
    router.push(`/admin/students?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '400px', marginLeft: '1rem' }}>
      <input 
        type="text" 
        placeholder="Search students, subjects, announcements..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem'
        }}
      />
    </form>
  );
}
