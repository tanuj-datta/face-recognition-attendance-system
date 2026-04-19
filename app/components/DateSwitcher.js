'use client';

import { useRouter } from 'next/navigation';

export default function DateSwitcher({ defaultValue }) {
  const router = useRouter();

  const handleChange = (e) => {
    const newDate = e.target.value;
    router.push(`?date=${newDate}`);
  };

  return (
    <form style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date:</span>
      <input 
        type="date" 
        name="date" 
        defaultValue={defaultValue}
        onChange={handleChange}
        className="glass-panel"
        style={{ padding: '8px 12px', color: 'white', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', outline: 'none' }}
      />
    </form>
  );
}
