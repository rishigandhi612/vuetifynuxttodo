import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    let todos = await prisma.todo.findMany();
    return {
      status: 200,
      data: todos,
    };
  } catch (error) {
    console.error('Error fetching todos:', error);
    return {
      status: 500,
      message: 'Error fetching todos',
    };
  }
});

