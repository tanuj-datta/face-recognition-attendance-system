import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarkTable from './MarkTable';

const prisma = new PrismaClient();

export default async function FacultyMarks() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const students = await prisma.student.findMany({
    include: {
      marks: true,
      course: true
    }
  });

  const subjects = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <Link href="/faculty/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Command Center
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Academic Gradebook
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Assign and modify student scores. Changes are reflected in real-time on student portals.
          </p>
        </div>
      </div>

      <MarkTable initialStudents={students} subjects={subjects} />
    </div>
  );
}
