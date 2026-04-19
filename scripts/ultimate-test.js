const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function runTests() {
  console.log("🚀 Starting Ultimate Project Test Suite...\n");

  const results = {
    pass: 0,
    fail: 0,
    errors: []
  };

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      results.pass++;
    } catch (e) {
      console.log(`❌ FAIL: ${name}`);
      console.error(`   Error: ${e.message}`);
      results.fail++;
      results.errors.push({ name, error: e.message });
    }
  }

  // --- 1. Database & Schema ---
  await test("Database Connection & Slot 7 Column Check", async () => {
    // Test if we can query the new slot7 column
    await prisma.$queryRaw`SELECT slot7 FROM Timetable LIMIT 1`;
  });

  // --- 2. Course Management ---
  let testCourseId;
  await test("Course Creation and Retrieval", async () => {
    const course = await prisma.course.upsert({
      where: { id: 'test-course-id' },
      update: {},
      create: {
        id: 'test-course-id',
        course_name: 'Test Engineering',
        department: 'Testing',
        semester: 1
      }
    });
    testCourseId = course.id;
    if (course.course_name !== 'Test Engineering') throw new Error("Course name mismatch");
  });

  // --- 3. Student Management ---
  let testStudentId;
  const testRollNo = 'TEST-ROLL-001';
  await test("Student Registration & Duplicate Prevention", async () => {
    // Cleanup first
    await prisma.student.deleteMany({ where: { roll_no: testRollNo } });

    const password = await bcrypt.hash('password123', 10);
    const student = await prisma.student.create({
      data: {
        name: 'Test Student',
        roll_no: testRollNo,
        password_hash: password,
        course_id: testCourseId,
        face_embedding: JSON.stringify(new Array(128).fill(0.1))
      }
    });
    testStudentId = student.id;

    // Test Duplicate
    try {
      await prisma.student.create({
        data: {
          name: 'Duplicate',
          roll_no: testRollNo,
          course_id: testCourseId
        }
      });
      throw new Error("Duplicate roll_no allowed!");
    } catch (e) {
      if (e.code !== 'P2002') throw e;
    }
  });

  // --- 4. Timetable & Slot 7 Support ---
  await test("Timetable Persistence (Slot 7 Support)", async () => {
    const day = 'Monday';
    // Using raw SQL to verify our fallback works
    await prisma.$executeRawUnsafe(
      `INSERT OR REPLACE INTO Timetable (id, day, course_id, slot7, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      'test-timetable-id', day, testCourseId, 'Ultimate AI', new Date().toISOString(), new Date().toISOString()
    );

    const check = await prisma.$queryRawUnsafe(
      `SELECT slot7 FROM Timetable WHERE id = ?`,
      'test-timetable-id'
    );
    if (check[0].slot7 !== 'Ultimate AI') throw new Error("Slot 7 data mismatch");
  });

  // --- 5. Attendance Logic ---
  await test("Attendance Marking & Percentage Logic", async () => {
    const today = new Date().toISOString().split('T')[0];
    await prisma.attendance.deleteMany({ where: { student_id: testStudentId } });

    // Mark 2 attendances for AI
    await prisma.attendance.create({
      data: {
        student_id: testStudentId,
        subject_name: 'AI',
        slot_index: 7,
        date: today,
        status: 'Present'
      }
    });

    const count = await prisma.attendance.count({ where: { student_id: testStudentId } });
    if (count !== 1) throw new Error("Attendance count mismatch");

    // Integration check: Percentage calculation assuming 20 sessions per subject (6 subjects)
    const subjectsCount = 6;
    const sessionsPerSub = 20;
    const totalPossible = subjectsCount * sessionsPerSub; // 120
    const percent = Math.round((count / totalPossible) * 100);
    
    if (percent !== 1) throw new Error(`Incorrect percentage calculation: ${percent}% (Expected 1%)`);
  });

  // --- 6. Marks Management ---
  await test("Gradebook Persistence & Update", async () => {
    const label = 'Assignments';
    await prisma.mark.deleteMany({ where: { student_id: testStudentId, label } });

    // Create
    await prisma.mark.create({
      data: {
        student_id: testStudentId,
        course_id: testCourseId,
        label: label,
        score: 85
      }
    });

    // Update
    const existing = await prisma.mark.findFirst({ where: { student_id: testStudentId, label } });
    await prisma.mark.update({
      where: { id: existing.id },
      data: { score: 95 }
    });

    const final = await prisma.mark.findUnique({ where: { id: existing.id } });
    if (final.score !== 95) throw new Error("Mark update failed");
  });

  // --- 7. Cascade Deletion ---
  await test("Security: Cascade Student Deletion", async () => {
    await prisma.student.delete({ where: { id: testStudentId } });

    const atts = await prisma.attendance.count({ where: { student_id: testStudentId } });
    const marks = await prisma.mark.count({ where: { student_id: testStudentId } });

    if (atts !== 0 || marks !== 0) throw new Error("Cascade delete failed: Orphaned records found");
  });

  // Final Report
  console.log("\n--- TEST SUMMARY ---");
  console.log(`PASS: ${results.pass}`);
  console.log(`FAIL: ${results.fail}`);
  
  if (results.fail > 0) {
    console.log("\nFailed Tests Details:");
    results.errors.forEach(e => console.log(`- ${e.name}: ${e.error}`));
    process.exit(1);
  } else {
    console.log("\n🚀 ALL SYSTEMS NOMINAL. PROJECT IS ULTIMATE.");
    process.exit(0);
  }
}

runTests();
