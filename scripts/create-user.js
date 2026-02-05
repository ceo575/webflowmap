const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: node scripts/create-user.js <email> <name> <password> [role]');
        console.log('Example: node scripts/create-user.js student2@example.com "Học Sinh 2" 123456 STUDENT');
        process.exit(1);
    }

    const [email, name, password, role = 'STUDENT'] = args;

    try {
        console.log(`Creating user: ${email} (${role})...`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                password: hashedPassword,
                role: role.toUpperCase()
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role: role.toUpperCase()
            }
        });

        console.log('User created/updated successfully:', user.email);
    } catch (error) {
        console.error('Failed to create user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
