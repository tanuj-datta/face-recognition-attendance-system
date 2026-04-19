import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Search, Download, Filter, Calendar } from 'lucide-react';
import DownloadReportsButton from '../../components/DownloadReportsButton';

const prisma = new PrismaClient();

export default async function AttendanceReports({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const { course, start, end } = await searchParams;

  const where = {};
  if (course && course !== 'all') where.subject_name = course;
  if (start && end) {
    where.date = { gte: start, lte: end };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: { student: true },
    orderBy: { timestamp: 'desc' },
    take: 100
  });

  const courses = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/faculty/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Attendance Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analytical view of students check-ins across courses.</p>
        </div>
        <DownloadReportsButton attendances={attendances} />
      </div>

      <form className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            name="q"
            type="text" 
            placeholder="Filter by student roll..." 
            className="glass-panel" 
            style={{ width: '100%', padding: '12px 12px 12px 45px', color: 'white', background: 'var(--bg-dark)', border: 'none', outline: 'none' }} 
          />
        </div>
        <select name="course" className="glass-panel" style={{ padding: '12px 20px', color: 'white', background: 'var(--bg-dark)', border: 'none', outline: 'none' }}>
           <option value="all">All Subjects</option>
           {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="date" name="start" className="glass-panel" style={{ padding: '10px', color: 'white', background: 'var(--bg-dark)', border: 'none' }} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input type="date" name="end" className="glass-panel" style={{ padding: '10px', color: 'white', background: 'var(--bg-dark)', border: 'none' }} />
        </div>
        <button type="submit" className="glass-button" style={{ background: 'var(--primary)' }}>
           Apply Filters
        </button>
      </form>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Subject</th>
              <th>Slot</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: '600' }}>{r.student.name}</td>
                <td>{r.student.roll_no}</td>
                <td>{r.subject_name}</td>
                <td>Slot {r.slot_index}</td>
                <td>{r.date}</td>
                <td>
                  <span style={{ 
                    color: r.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

