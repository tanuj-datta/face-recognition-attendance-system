'use server';

import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function saveMark(studentId, subject, score, courseId) {
  console.log(`Saving Mark: Student=${studentId}, Sub=${subject}, Score=${score}`);
  try {
    // Separate find and update/create for maximum resilience with SQLite
    const existing = await prisma.mark.findFirst({
      where: {
        student_id: studentId,
        label: subject
      }
    });

    let result;
    if (existing) {
      console.log(`Updating existing mark with ID: ${existing.id}`);
      result = await prisma.mark.update({
        where: { id: existing.id },
        data: { score: parseFloat(score) }
      });
    } else {
      console.log(`Creating new mark record`);
      result = await prisma.mark.create({
        data: {
          student_id: studentId,
          course_id: courseId,
          label: subject,
          score: parseFloat(score),
          total_marks: 100
        }
      });
    }

    console.log("Save successful:", result.id);
    revalidatePath('/faculty/marks');
    revalidatePath('/student/marks');
    return { success: true, mark: result };
  } catch (error) {
    console.error("Failed to save mark:", error);
    return { success: false, error: error.message };
  }
}
