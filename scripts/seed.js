const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  // Clear existing data (optional but good for clean start)
  await prisma.justification.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.course.deleteMany({});

  // Create Courses
  const c1 = await prisma.course.create({
    data: {
      course_name: 'CS-101: Computer Science Fundamentals',
      department: 'CSE',
      semester: 1,
    }
  });

  const c2 = await prisma.course.create({
    data: {
      course_name: 'MA-202: Advanced Mathematics',
      department: 'Math',
      semester: 4,
    }
  });

  // Create Student
  const studentPass = await bcrypt.hash('student1', 10);
  const s1 = await prisma.student.create({
    data: {
      name: 'Tanuj Datta',
      roll_no: '2023001',
      password_hash: studentPass,
      course_id: c1.id,
    }
  });

  // Create Sessions for C1
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const start = new Date(today);
    start.setDate(today.getDate() - i);
    start.setHours(10, 0, 0);
    
    const end = new Date(start);
    end.setHours(11, 0, 0);

    const session = await prisma.session.create({
      data: {
        course_id: c1.id,
        start_time: start,
        end_time: end,
        qr_code: `QR-SESSION-${c1.id}-${i}`,
      }
    });

    // Mark attendance for some
    if (i < 3) {
      await prisma.attendance.create({
        data: {
          student_id: s1.id,
          session_id: session.id,
          subject_name: c1.course_name,
          timestamp: start,
          status: 'Present',
          method: 'QR'
        }
      });
    } else {
      await prisma.attendance.create({
        data: {
          student_id: s1.id,
          session_id: session.id,
          subject_name: c1.course_name,
          timestamp: start,
          status: 'Absent',
          method: 'None'
        }
      });
    }
  }

  // Create Marks
  await prisma.mark.create({
    data: {
      student_id: s1.id,
      course_id: c1.id,
      label: 'Assignment 1',
      score: 85,
    }
  });

  await prisma.mark.create({
    data: {
      student_id: s1.id,
      course_id: c1.id,
      label: 'Midterm Exam',
      score: 72,
    }
  });

  console.log('Seeding complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
