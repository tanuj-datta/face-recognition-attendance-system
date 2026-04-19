const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function merge() {
  console.log("Starting Course Merge...");
  
  const courses = await prisma.course.findMany();
  const groups = {};

  // Group by name (lowercase, trimmed)
  courses.forEach(c => {
    const name = c.course_name.toLowerCase().trim();
    if (!groups[name]) groups[name] = [];
    groups[name].push(c);
  });

  for (const name in groups) {
    const group = groups[name];
    if (group.length <= 1) continue;

    // Pick the "best" record (ID that looks like a slug or the first one)
    const master = group.find(c => !c.id.includes('-')) || group[0];
    const duplicates = group.filter(c => c.id !== master.id);

    console.log(`Merging duplicates for "${name}" into master ID: ${master.id}`);

    for (const dup of duplicates) {
      // Update Students
      await prisma.student.updateMany({
        where: { course_id: dup.id },
        data: { course_id: master.id }
      });

      // Update Timetables
      // Note: This might conflict if both have timetables. We'll just shift them.
      // But usually only one was being edited.
      try {
        await prisma.timetable.updateMany({
          where: { course_id: dup.id },
          data: { course_id: master.id }
        });
      } catch (e) {
        console.log(`  Timetable merge conflict for ${dup.id}, skipping timetable update.`);
      }

      // Delete Duplicate
      await prisma.course.delete({ where: { id: dup.id } });
      console.log(`  Deleted duplicate: ${dup.id}`);
    }
  }

  console.log("Merge Complete.");
}

merge().catch(console.error).finally(() => prisma.$disconnect());
