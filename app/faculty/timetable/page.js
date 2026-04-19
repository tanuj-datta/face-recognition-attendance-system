export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Calendar, Trash2, Plus, Save, Clock, ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import CourseSelector from '../../components/CourseSelector';
import TimetableSlot from '../../components/TimetableSlot';
import { TIME_SLOTS } from '../../../lib/timeSlots';

const prisma = new PrismaClient();

export default async function ManageTimetable({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const courses = await prisma.course.findMany({
    orderBy: { course_name: 'asc' }
  });

  const { courseId: qId } = await searchParams;
  const courseId = qId || (courses[0]?.id || 'default');
  const timetable = await prisma.timetable.findMany({
    where: { course_id: courseId }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const subjects = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC', 'None'];

  async function updateTimetable(formData) {
    'use server';
    const course_id = formData.get('courseId');
    const day = formData.get('day');
    const slotIdx = formData.get('slotIndex');
    const subject = formData.get('subject');
    const slot7_start = formData.get('slot7_start');
    const slot7_end = formData.get('slot7_end');

    // Check if record exists
    const existing = await prisma.timetable.findFirst({
      where: { course_id, day }
    });

    const isSlot7 = slotIdx === '7' || slotIdx === 7;
    const value = subject === 'None' ? null : subject;

    try {
      if (existing) {
        if (isSlot7) {
           // Direct SQL update to bypass stale Prisma Client model
           await prisma.$executeRawUnsafe(
             `UPDATE Timetable SET slot7 = ?, slot7_start = ?, slot7_end = ? WHERE id = ?`,
             value, slot7_start, slot7_end, existing.id
           );
        } else {
          await prisma.timetable.update({
            where: { id: existing.id },
            data: { [`slot${slotIdx}`]: value }
          });
        }
      } else {
        if (isSlot7) {
           // Direct SQL insert
           const id = crypto.randomUUID();
           await prisma.$executeRawUnsafe(
             `INSERT INTO Timetable (id, day, course_id, slot7, slot7_start, slot7_end, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
             id, day, course_id, value, slot7_start, slot7_end, new Date().toISOString(), new Date().toISOString()
           );
        } else {
          await prisma.timetable.create({
            data: {
              course_id,
              day,
              [`slot${slotIdx}`]: value
            }
          });
        }
      }
    } catch (e) {
      console.error("Timetable update failed:", e);
      throw new Error("Failed to update schedule.");
    }
    
    revalidatePath('/faculty/timetable');
    revalidatePath('/student/dashboard');
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <Link href="/faculty/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Slot Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure daily course schedules and session triggers.</p>
        </div>
        
        <CourseSelector courses={courses} currentId={courseId} />
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {days.map(day => {
          const daySchedule = timetable.find(t => t.day === day);
          
          return (
            <div key={day} className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="var(--primary)" /> {day} Schedule
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                {TIME_SLOTS.map(slot => (
                  <TimetableSlot 
                    key={slot.index}
                    slot={slot}
                    daySchedule={daySchedule}
                    courseId={courseId}
                    day={day}
                    subjects={subjects}
                    updateAction={updateTimetable}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
