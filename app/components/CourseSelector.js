'use client';

import { useRouter } from 'next/navigation';

export default function CourseSelector({ courses, currentId }) {
  const router = useRouter();

  return (
    <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <span style={{ fontSize: '0.9rem' }}>Editing for:</span>
      <select 
        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
        defaultValue={currentId}
        onChange={(e) => router.push(`?courseId=${e.target.value}`)}
      >
        {courses.map(c => (
          <option key={c.id} value={c.id} style={{ background: 'var(--bg-dark)' }}>
            {c.course_name}
          </option>
        ))}
      </select>
    </div>
  );
}
