import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Euclidean distance helper
function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { face_embedding, subject_name } = body;

    if (!face_embedding) {
      return new Response(JSON.stringify({ error: "Missing face embedding" }), { status: 400 });
    }

    // Fetch all students (In true production you might partition this by registered class)
    const students = await prisma.student.findMany();

    let bestMatch = null;
    let minDistance = Infinity;
    const threshold = 0.6; // Typical threshold for face-api descriptors is 0.6

    for (const student of students) {
      if (!student.face_embedding) continue;
      
      const storedEmbedding = JSON.parse(student.face_embedding);
      const distance = euclideanDistance(face_embedding, storedEmbedding);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = student;
      }
    }

    if (bestMatch && minDistance <= threshold) {
      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          student_id: bestMatch.id,
          subject_name: subject_name || "General Course",
          status: "Present"
        }
      });

      return new Response(JSON.stringify({ 
        success: true, 
        student: bestMatch.name, 
        distance: minDistance 
      }), { status: 200 });

    } else {
      return new Response(JSON.stringify({ error: "Face not recognized" }), { status: 404 });
    }

  } catch (error) {
    console.error("Attendance endpoint error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
