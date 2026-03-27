'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BulkImport({ onImportSuccess }: { onImportSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Placeholder logic for future CSV parsing
    setTimeout(() => {
      toast.success(`Bulk import simulated for ${file.name}`);
      setLoading(false);
      onImportSuccess();
    }, 1000);
  };

  return (
    <div>
      <label 
        style={{ 
          cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '0.5rem',
          background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
          fontWeight: 600, fontSize: '0.875rem', opacity: loading ? 0.7 : 1,
          display: 'inline-block', border: '1px solid rgba(16, 185, 129, 0.4)'
        }}
      >
        {loading ? '⏳ Importing...' : '📥 Bulk Import'}
        <input 
          type="file" 
          accept=".csv,.xlsx" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          disabled={loading}
        />
      </label>
    </div>
  );
}
