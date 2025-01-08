import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Fetch all todos from the database
    const todos = await prisma.todo.findMany();

    // Return the todos with a success status
    return {
      status: 200,
      data: todos,
    };
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching todos:', error);

    // Return a structured error response
    return {
      statusCode: 500,
      message: 'Error fetching todos. Please try again later.',
    };
  }
});
