import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { TIME_SLOTS } from "../../../../lib/timeSlots";

const prisma = new PrismaClient();

// Euclidean distance calculation
function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;
  return Math.sqrt(arr1.reduce((sum, val, i) => sum + Math.pow(val - arr2[i], 2), 0));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { face_embedding, slot_index } = await req.json();

    // 1. Fetch Student & Course Info
    const student = await prisma.student.findUnique({
      where: { roll_no: session.user.roll_no },
      include: { course: true }
    });

    if (!student || !student.face_embedding) {
      return NextResponse.json({ error: "Student data not found." }, { status: 404 });
    }

    // 2. TIMING ENFORCEMENT & SUBJECT FETCH
    const isSlot7 = parseInt(slot_index) === 7;
    const slot = TIME_SLOTS.find(s => s.index === parseInt(slot_index));
    if (!slot) return NextResponse.json({ error: "Invalid slot index" }, { status: 400 });

    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    let subject, startTimeStr, endTimeStr;

    if (isSlot7) {
      const rawTimetable = await prisma.$queryRawUnsafe(
        `SELECT slot7, slot7_start, slot7_end FROM Timetable WHERE course_id = ? AND day = ?`,
        student.course_id, todayName
      );
      const tt = rawTimetable?.[0];
      subject = tt?.slot7;
      startTimeStr = tt?.slot7_start;
      endTimeStr = tt?.slot7_end;
    } else {
      const timetable = await prisma.timetable.findUnique({
        where: { course_id_day: { course_id: student.course_id, day: todayName } }
      });
      subject = timetable?.[`slot${slot_index}`];
      startTimeStr = slot.start;
      endTimeStr = slot.end;
    }

    if (!subject || !startTimeStr || !endTimeStr) {
      return NextResponse.json({ error: "No class scheduled or timing missing for this slot." }, { status: 400 });
    }

    // 3. Dynamic Time Check
    const now = new Date();
    const [sH, sM] = startTimeStr.split(':').map(Number);
    const [eH, eM] = endTimeStr.split(':').map(Number);
    
    const start = new Date(now); start.setHours(sH, sM, 0, 0);
    const end = new Date(now); end.setHours(eH, eM, 0, 0);

    if (now < start) return NextResponse.json({ error: `Too early! Check-in starts at ${startTimeStr}.` }, { status: 403 });
    if (now > end) return NextResponse.json({ error: "Check-in window closed for this session." }, { status: 403 });

    // 4. Biometric Identity Verification
    const savedEmbedding = JSON.parse(student.face_embedding);
    const distance = euclideanDistance(savedEmbedding, face_embedding);

    if (distance > 0.5) { // Threshold for face-api.js
      return NextResponse.json({ error: "Identity not verified. Face does not match." }, { status: 403 });
    }

    // 5. Check if already marked
    const todayDate = new Date().toISOString().split('T')[0];
    const existing = await prisma.attendance.findFirst({
      where: {
        student_id: student.id,
        slot_index: parseInt(slot_index),
        date: todayDate
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Attendance already marked for this slot." }, { status: 400 });
    }

    // 6. Create attendance record
    await prisma.attendance.create({
      data: {
        student_id: student.id,
        subject_name: subject,
        slot_index: parseInt(slot_index),
        date: todayDate,
        status: 'Present',
        method: 'Face'
      }
    });

    return NextResponse.json({ message: "Attendance marked successfully!" });

  } catch (error) {
    console.error("Attendance API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
