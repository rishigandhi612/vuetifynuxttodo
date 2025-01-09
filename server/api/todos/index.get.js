import { PrismaClient } from "@prisma/client";
import { serverSupabaseUser } from '#supabase/server'

// Singleton pattern to prevent re-instantiating PrismaClient
let prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  let user = await serverSupabaseUser(event)
  console.log('user', user);
  if (!user) {
    return {
      // status: 401,
      message: "Unauthorized",
    };
  }
  try {
    // Fetch all todos from the database
    const todos = await prisma.todo.findMany({
      where: {
        uid: user.id
      }
    });

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
