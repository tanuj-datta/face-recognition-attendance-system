import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Calendar, FileText } from 'lucide-react';
import DownloadExcelButton from '../../components/DownloadExcelButton';

const prisma = new PrismaClient();

export default async function StudentReports({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/student/login');
  }

  const student = await prisma.student.findUnique({
    where: { roll_no: session.user.roll_no }
  });

  const { course, start, end } = await searchParams;

  const where = { student_id: student.id };
  if (course && course !== 'all') where.subject_name = course;
  if (start && end) {
    where.date = { gte: start, lte: end };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 50
  });

  const courses = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Personal Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Detailed history of your course check-ins.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <DownloadExcelButton studentName={student.name} attendances={attendances} />
        </div>
      </div>

      <form className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select name="course" className="glass-panel" style={{ padding: '12px 20px', color: 'white', background: 'var(--bg-dark)', border: 'none', outline: 'none', flex: 1 }}>
           <option value="all">All Subjects</option>
           {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="date" name="start" className="glass-panel" style={{ padding: '10px', color: 'white', background: 'var(--bg-dark)', border: 'none' }} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input type="date" name="end" className="glass-panel" style={{ padding: '10px', color: 'white', background: 'var(--bg-dark)', border: 'none' }} />
        </div>
        <button type="submit" className="glass-button" style={{ background: 'var(--primary)' }}>
           Filter
        </button>
      </form>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Slot</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: '600' }}>{r.subject_name}</td>
                <td>Slot {r.slot_index}</td>
                <td>{r.date}</td>
                <td>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
