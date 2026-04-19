'use server';

import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteStudent(studentId) {
  try {
    await prisma.student.delete({
      where: { id: studentId }
    });
    
    revalidatePath('/faculty/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete student:", error);
    return { success: false, error: error.message };
  }
}
