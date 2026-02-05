const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Prisma 7 requires options or explicit configuration in some contexts
const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function main() {
    console.log('Start seeding...');

    try {
        // 1. Create Teacher (Admin)
        const teacherPassword = await bcrypt.hash('123456', 10);
        const teacher = await prisma.user.upsert({
            where: { email: 'teacher@flowmap.com' },
            update: {},
            create: {
                email: 'teacher@flowmap.com',
                name: 'Thầy Giáo FlowMAP',
                password: teacherPassword,
                role: 'ADMIN',
            },
        });
        console.log('Created Teacher:', teacher.email);

        // 2. Create Student
        const studentPassword = await bcrypt.hash('123456', 10);
        const student = await prisma.user.upsert({
            where: { email: 'student@flowmap.com' },
            update: {},
            create: {
                email: 'student@flowmap.com',
                name: 'Học Sinh Chăm Chỉ',
                password: studentPassword,
                role: 'STUDENT',
            },
        });
        console.log('Created Student:', student.email);

        console.log('Seeding finished successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
