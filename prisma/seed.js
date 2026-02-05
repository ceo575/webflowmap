const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting plain JS seed...');

    try {
        const teacherPassword = await bcrypt.hash('123456', 10);
        const studentPassword = await bcrypt.hash('123456', 10);

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
        console.log('Teacher created:', teacher.email);

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
        console.log('Student created:', student.email);

        console.log('Seed successful.');
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
