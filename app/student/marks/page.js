import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Trophy, Target } from 'lucide-react';

const prisma = new PrismaClient();

export default async function StudentMarks() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/student/login');
  }

  const student = await prisma.student.findUnique({
    where: { roll_no: session.user.roll_no },
    include: {
      marks: true,
      course: true
    }
  });

  if (!student) return <div>Data not found</div>;

  const subjects = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
           <GraduationCap size={40} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Academic Performance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Progress report and current grades for {student.name}.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {subjects.map(sub => {
          const mark = student.marks.find(m => m.label === sub);
          const score = mark?.score || 0;
          const percent = Math.round((score / 100) * 100);

          return (
            <div key={sub} className="glass-panel stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="stat-label">{sub}</span>
                {score >= 80 ? <Trophy size={18} color="var(--warning)" /> : <Target size={18} color="var(--primary)" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <div className="stat-value">{score}</div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ 100</span>
              </div>
              <div className="progress-container" style={{ margin: '15px 0' }}>
                <div className="progress-bar" style={{ 
                  width: `${percent}%`,
                  background: score >= 40 ? 'linear-gradient(to right, var(--primary), var(--secondary))' : 'var(--danger)'
                }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: score >= 40 ? 'var(--success)' : 'var(--danger)' }}>
                {score >= 40 ? 'Passing' : 'Below Threshold'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
