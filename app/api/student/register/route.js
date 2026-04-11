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

    // Since we are using SQLite, we stringify the embedding array
    const embeddingString = JSON.stringify(face_embedding);

    const courseName = course_id === 'default' ? 'General Subject' : course_id;
    
    // Check if course exists in DB, or create it dynamically to fulfill the Foreign Key Constraint
    let course = await prisma.course.findFirst({
      where: { course_name: courseName }
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          course_name: courseName,
          department: "School of Engineering",
          semester: 1
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the student in Database
    const student = await prisma.student.create({
      data: {
        name,
        roll_no,
        password_hash: hashedPassword,
        course_id: course.id,
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
