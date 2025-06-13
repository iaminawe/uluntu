// src/components/DataSourceIndicator.tsx
import React from 'react';

const DataSourceIndicator: React.FC = () => {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  const dataSource = useSupabase ? 'Supabase Data' : 'Mock Data';

  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    padding: '8px 12px',
    backgroundColor: useSupabase ? '#28a745' : '#ffc107', // Green for Supabase, Yellow for Mock
    color: useSupabase ? 'white' : 'black',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    zIndex: 1000, // Ensure it's on top
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <div style={style} role="status" aria-live="polite">
      Using: {dataSource}
    </div>
  );
};

export default DataSourceIndicator;
