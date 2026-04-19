'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteStudent } from '../../lib/actions/students';
import { useRouter } from 'next/navigation';

export default function DeleteStudentButton({ studentId, studentName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteStudent(studentId);
    if (result.success) {
      router.push('/faculty/dashboard');
      router.refresh();
    } else {
      alert("Error deleting student: " + result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="glass-panel" style={{ 
        padding: '1rem', 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid var(--danger)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '300px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 'bold', fontSize: '0.9rem' }}>
          <AlertTriangle size={18} /> Confirm Wipe
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Permanently delete <strong>{studentName}</strong> and all their history? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="glass-button"
            style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="glass-button"
            style={{ flex: 1, background: 'var(--danger)', border: 'none', color: 'white', fontSize: '0.75rem', padding: '6px', cursor: 'pointer' }}
          >
            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : "Yes, Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)}
      className="glass-button"
      style={{ 
        color: 'var(--danger)', 
        background: 'rgba(239, 68, 68, 0.05)', 
        border: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '0.6rem 1.2rem',
        fontSize: '0.85rem'
      }}
    >
      <Trash2 size={16} /> Delete Student record
    </button>
  );
}
