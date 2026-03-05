import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany();
  console.log('Employees:', JSON.stringify(employees, null, 2));
  console.log('Total:', employees.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
