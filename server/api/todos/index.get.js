import { PrismaClient } from "@prisma/client";
import { serverSupabaseUser } from '#supabase/server'

// Singleton pattern to prevent re-instantiating PrismaClient
let prisma;

if (process.env.NODE_ENV === "production") {
  // In production, create a single instance of PrismaClient
  prisma = new PrismaClient();
} else {
  // In non-production environments, use global object to store PrismaClient instance
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default defineEventHandler(async (event) => {
  let user = serverSupabaseUser(event)
  if (!user) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
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
    console.error("Error fetching todos:", error);

    // Return a structured error response
    return {
      statusCode: 500,
      message: "Error fetching todos. Please try again later.",
    };
  }
});
