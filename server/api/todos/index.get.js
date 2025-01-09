import { PrismaClient } from "@prisma/client";
import { serverSupabaseUser } from '#supabase/server'

// Singleton pattern to prevent re-instantiating PrismaClient
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. Authenticate user
  const user = await serverSupabaseUser(event);
  if (!user) {
    return {
      statusCode: 401,
      message: "Unauthorized - Please log in to view todos",
    };
  }

  try {
    // 2. Fetch only the todos belonging to the authenticated user
    const todos = await prisma.todo.findMany({
      where: {
        uid: user.id
      },
      orderBy: {
        createdAt: 'desc'  // Show newest todos first
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        // uid is excluded for security
      }
    });

    // 3. Return success response
    return {
      statusCode: 200,
      message: "Todos fetched successfully",
      data: todos,
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      statusCode: 500,
      message: "An error occurred while fetching todos",
    };
  }
});