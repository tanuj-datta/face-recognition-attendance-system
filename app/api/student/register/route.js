import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, roll_no, course_id, face_embedding, password } = body;

    if (!name || !roll_no || !face_embedding || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Explicit check for existing student with same roll_no
    const existingStudent = await prisma.student.findUnique({
      where: { roll_no }
    });

    if (existingStudent) {
      return new Response(JSON.stringify({ error: "This Roll Number is already registered." }), { status: 409 });
    }

    // Since we are using SQLite, we stringify the embedding array
    const embeddingString = JSON.stringify(face_embedding);

    let finalCourseId = course_id;

    // Validate course_id or handle 'default'
    if (course_id === 'default' || !course_id) {
       let defaultCourse = await prisma.course.findFirst({
         where: { course_name: 'General Subject' }
       });
       
       if (!defaultCourse) {
         defaultCourse = await prisma.course.create({
           data: {
             course_name: 'General Subject',
             department: "General",
             semester: 1
           }
         });
       }
       finalCourseId = defaultCourse.id;
    } else {
      // Verify the course exists
      const exists = await prisma.course.findUnique({ where: { id: course_id } });
      if (!exists) {
        return new Response(JSON.stringify({ error: "Invalid Course selection." }), { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the student in Database
    const student = await prisma.student.create({
      data: {
        name,
        roll_no,
        password_hash: hashedPassword,
        course_id: finalCourseId,
        face_embedding: embeddingString,
      }
    });

    return new Response(JSON.stringify({ success: true, student }), { status: 201 });
    } catch (error) {
    console.error("Registration endpoint error:", error);
    // If it's a unique constraint error on roll_no
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ error: "Roll number already registered" }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error: " + (error.message || String(error)) }), { status: 500 });
  }
}
