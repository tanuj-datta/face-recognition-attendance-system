'use client';

import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export default function DownloadReportsButton({ attendances }) {
  const downloadExcel = () => {
    if (!attendances || attendances.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Format data for Excel
    const data = attendances.map(att => ({
      'Student Name': att.student?.name || 'Unknown',
      'Roll Number': att.student?.roll_no || 'N/A',
      'Subject': att.subject_name,
      'Slot': `Slot ${att.slot_index}`,
      'Date': att.date,
      'Check-in Time': att.timestamp ? new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      'Status': att.status,
      'Method': att.method || 'Biometric'
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // Roll Number
      { wch: 10 }, // Subject
      { wch: 10 }, // Slot
      { wch: 12 }, // Date
      { wch: 15 }, // Time
      { wch: 10 }, // Status
      { wch: 12 }  // Method
    ];

    // Server-side download (The most reliable method)
    const params = new URLSearchParams();
    // Add logic to extract current filters if possible, or just download all
    window.location.href = `/api/reports/download?${params.toString()}`;
  };

  return (
    <button 
      onClick={downloadExcel}
      className="glass-button" 
      style={{ background: 'var(--success)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <Download size={18} /> Export Excel
    </button>
  );
}
