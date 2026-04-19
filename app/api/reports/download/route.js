import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const course = searchParams.get('course');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const where = {};
  if (studentId) where.student_id = studentId;
  if (course && course !== 'all') where.subject_name = course;
  if (start && end) {
    where.date = { gte: start, lte: end };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: { student: true },
    orderBy: { timestamp: 'desc' }
  });

  // Prepare Excel data
  const data = attendances.map(att => ({
    'Student': att.student?.name || 'Unknown',
    'Roll No': att.student?.roll_no || 'N/A',
    'Subject': att.subject_name,
    'Slot': `Slot ${att.slot_index}`,
    'Date': att.date,
    'Time': att.timestamp ? new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    'Status': att.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Attendance_Report.xlsx"`
    }
  });
}
