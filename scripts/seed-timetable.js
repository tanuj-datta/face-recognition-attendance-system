const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ensure course exists
  const course = await prisma.course.upsert({
    where: { id: 'btech-cse' },
    update: {},
    create: {
      id: 'btech-cse',
      course_name: 'B.Tech CSE',
      department: 'Computer Science',
      semester: 4,
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjectsMap = {
    'Monday': ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'],
    'Tuesday': ['CN', 'CD', 'OOP', 'AI', 'TOC', 'DSA'],
    'Wednesday': ['CD', 'OOP', 'AI', 'TOC', 'DSA', 'CN'],
    'Thursday': ['OOP', 'AI', 'TOC', 'DSA', 'CN', 'CD'],
    'Friday': ['AI', 'TOC', 'DSA', 'CN', 'CD', 'OOP']
  };

  for (const day of days) {
    const subs = subjectsMap[day];
    await prisma.timetable.upsert({
      where: {
        course_id_day: {
          course_id: 'btech-cse',
          day: day
        }
      },
      update: {
        slot1: subs[0],
        slot2: subs[1],
        slot3: subs[2],
        slot4: subs[3],
        slot5: subs[4],
        slot6: subs[5],
      },
      create: {
        course_id: 'btech-cse',
        day: day,
        slot1: subs[0],
        slot2: subs[1],
        slot3: subs[2],
        slot4: subs[3],
        slot5: subs[4],
        slot6: subs[5],
      }
    });
  }
  console.log('Timetable seeded!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
