import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from '../../student/register/page.module.css';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function FacultyDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const students = await prisma.student.findMany({
    include: { attendances: true }
  });

  // (Internal Attendance Tracking - UI display removed as requested)

  // Server Actions for Faculty Control Functions
  async function deleteStudent(formData) {
    'use server';
    const id = formData.get('studentId');
    // Delete associated attendances first to prevent constraint errors
    await prisma.attendance.deleteMany({ where: { student_id: id } });
    await prisma.student.delete({ where: { id } });
    revalidatePath('/faculty/dashboard');
  }

  async function toggleStatus(formData) {
    'use server';
    const id = formData.get('attendanceId');
    const currentStatus = formData.get('currentStatus');
    await prisma.attendance.update({
      where: { id },
      data: { status: currentStatus === 'Present' ? 'Absent' : 'Present' }
    });
    revalidatePath('/faculty/dashboard');
    revalidatePath('/student/dashboard'); // So student's calendar updates remotely
  }

  // Assume 30 working days standard for UI or calculate it from today
  const workingDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div className={styles.container} style={{ flexDirection: 'column', padding: '4rem' }}>
      <h1 className={styles.title} style={{ marginBottom: '2rem' }}>Faculty Control Center</h1>
      
      {/* Student Roster Area */}
      <div className={styles.registrationCard} style={{ maxWidth: '1000px', width: '100%', border: '1px solid #f43f5e' }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Overall Student Roster</h2>
        
        <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <th style={{ padding: '1rem' }}>Roll No</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Days Present</th>
              <th style={{ padding: '1rem' }}>Working Days Config</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '1rem', color: '#94a3b8'}}>No students registered yet.</td></tr>
            ) : null}
            {students.map(student => {
              const presentDays = new Set(
                student.attendances
                  .filter(a => a.status === 'Present')
                  .map(a => {
                    const date = new Date(a.timestamp);
                    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                  })
              );
              const presentCount = presentDays.size;
              return (
              <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{student.roll_no}</td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/faculty/dashboard/student/${student.id}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold' }}>
                    {student.name}
                  </Link>
                </td>
                <td style={{ padding: '1rem', color: 'var(--success)' }}><b>{presentCount}</b></td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{workingDays} Days</td>
                <td style={{ padding: '1rem' }}>
                  <form action={deleteStudent}>
                    <input type="hidden" name="studentId" value={student.id} />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', background: '#ef4444', border: 'none', fontSize: '0.9rem' }}>
                      Delete Student
                    </button>
                  </form>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>



    </div>
  );
}
