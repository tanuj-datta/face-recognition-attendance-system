const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const corrupted = await prisma.course.findMany({
    where: { course_name: { contains: '-' } }
  });

  console.log(`Found ${corrupted.length} corrupted courses.`);

  for (const c of corrupted) {
    const real = await prisma.course.findUnique({
      where: { id: c.course_name }
    });

    if (real) {
      console.log(`Merging ${c.course_name} into ${real.course_name}`);
      
      // Update Students
      await prisma.student.updateMany({
        where: { course_id: c.id },
        data: { course_id: real.id }
      });

      // Update Marks
      await prisma.mark.updateMany({
        where: { course_id: c.id },
        data: { course_id: real.id }
      });

      // Delete the corrupted course
      await prisma.course.delete({
        where: { id: c.id }
      });
      
      console.log(`Successfully merged.`);
    } else {
       console.log(`No real course found for UUID ${c.course_name}. Renaming to placeholder.`);
       await prisma.course.update({
         where: { id: c.id },
         data: { course_name: 'Unknown Course (' + c.id.substring(0,5) + ')' }
       });
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
