'use client';

import * as XLSX from 'xlsx';

export default function DownloadExcelButton({ studentName, attendances }) {
  const downloadExcel = () => {
    if (!attendances || attendances.length === 0) {
      alert("No attendance data available to download.");
      return;
    }

    // Sort attendances by timestamp
    const sortedAttendances = [...attendances].sort((a, b) => new Date(a.date) - new Date(b.date) || a.slot_index - b.slot_index);

    const data = sortedAttendances.map(att => ({
      'Name': studentName,
      'Date': att.date,
      'Slot': `Slot ${att.slot_index}`,
      'Subject': att.subject_name,
      'Status': att.status,
      'Recorded At': att.timestamp ? new Date(att.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      'Source': att.method || 'Manual'
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 20 }, // Name
      { wch: 15 }, // Date
      { wch: 15 }, // Timestamp
      { wch: 15 }  // Source
    ];
    worksheet['!cols'] = wscols;

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Server-side download (The most reliable method)
    window.location.href = `/api/reports/download?studentId=${attendances[0]?.student_id || ''}`;
  };

  return (
    <button 
      onClick={downloadExcel}
      className="btn btn-primary"
      style={{ 
        padding: '0.8rem 2rem', 
        background: '#10b981', 
        border: 'none', 
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '1rem',
        borderRadius: '8px',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
      onMouseOut={(e) => e.target.style.filter = 'brightness(1.0)'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download Attendance (Excel)
    </button>
  );
}
