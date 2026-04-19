const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const coursesData = [
    { name: 'B.Tech CSE', dept: 'CSE', sem: 4 },
    { name: 'B.Tech ECE', dept: 'ECE', sem: 4 },
    { name: 'B.Tech Mechanical', dept: 'ME', sem: 4 },
    { name: 'B.Tech Civil', dept: 'CE', sem: 4 }
  ];

  for (const c of coursesData) {
    await prisma.course.upsert({
      where: {
        // Since course_name is not unique in schema, we will search by name
        id: (await prisma.course.findFirst({ where: { course_name: c.name } }))?.id || 'new-id'
      },
      update: {},
      create: {
        course_name: c.name,
        department: c.dept,
        semester: c.sem
      }
    });
  }

  console.log('Courses added successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
