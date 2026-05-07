'use client';

import { useState } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { saveMark } from '../../../lib/actions/marks';

export default function MarkTable({ initialStudents, subjects }) {
  const [students, setStudents] = useState(initialStudents);
  const [saving, setSaving] = useState({}); // { "studentId-subject": boolean }
  const [status, setStatus] = useState({}); // { "studentId-subject": "success" | "error" }

  const handleScoreChange = (studentId, subject, newScore) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedMarks = [...s.marks];
        const markIndex = updatedMarks.findIndex(m => m.label === subject);
        
        if (markIndex > -1) {
          updatedMarks[markIndex] = { ...updatedMarks[markIndex], score: parseFloat(newScore) || 0 };
        } else {
          updatedMarks.push({ label: subject, score: parseFloat(newScore) || 0 });
        }
        
        return { ...s, marks: updatedMarks };
      }
      return s;
    }));
    
    // Reset status when user starts typing again
    setStatus(prev => {
      const next = { ...prev };
      delete next[`${studentId}-${subject}`];
      return next;
    });
  };

  const handleSave = async (studentId, subject, courseId) => {
    const student = students.find(s => s.id === studentId);
    const mark = student.marks.find(m => m.label === subject);
    const score = mark?.score || 0;
    const key = `${studentId}-${subject}`;

    setSaving(prev => ({ ...prev, [key]: true }));
    
    const result = await saveMark(studentId, subject, score, courseId);
    
    setSaving(prev => ({ ...prev, [key]: false }));
    
    if (result.success) {
      setStatus(prev => ({ ...prev, [key]: 'success' }));
      setTimeout(() => {
        setStatus(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 3000);
    } else {
      setStatus(prev => ({ ...prev, [key]: 'error' }));
      alert(`Failed to save mark: ${result.error}`);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
      <table className="custom-table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <thead>
          <tr>
            <th style={{ width: '220px', textAlign: 'left', padding: '1rem' }}>Student Details</th>
            {subjects.map(s => <th key={s} style={{ textAlign: 'center' }}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id} className="table-row-hover">
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '700', color: 'white' }}>{student.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.roll_no}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '4px' }}>{student.course.course_name}</div>
              </td>
              {subjects.map(sub => {
                const mark = student.marks.find(m => m.label === sub);
                const key = `${student.id}-${sub}`;
                const isSaving = saving[key];
                const currentStatus = status[key];

                return (
                  <td key={sub} style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <input 
                        type="number" 
                        value={mark?.score || 0} 
                        onChange={(e) => handleScoreChange(student.id, sub, e.target.value)}
                        className="score-input"
                        style={{ 
                          width: '70px', 
                          padding: '8px', 
                          background: 'rgba(255,255,255,0.05)', 
                          color: 'white', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '8px',
                          textAlign: 'center',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <button 
                        onClick={() => handleSave(student.id, sub, student.course_id)}
                        disabled={isSaving}
                        title="Save Score"
                        style={{ 
                          position: 'absolute',
                          right: '-35px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: isSaving ? 'wait' : 'pointer',
                          color: currentStatus === 'success' ? 'var(--success)' : 
                                 currentStatus === 'error' ? 'var(--danger)' : 
                                 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {isSaving ? <div className="spinner-small"></div> : 
                         currentStatus === 'success' ? <CheckCircle size={16} /> :
                         currentStatus === 'error' ? <AlertCircle size={16} /> :
                         <Save size={16} />}
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table-row-hover {
          transition: background 0.3s ease;
        }
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .score-input:focus {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
