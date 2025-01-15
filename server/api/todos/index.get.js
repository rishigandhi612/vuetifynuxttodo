import { PrismaClient } from "@prisma/client";
import { serverSupabaseUser } from "#supabase/server";

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
    // 2. Get pagination parameters from query
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // 3. Get total count for pagination
    const total = await prisma.todo.count({
      where: {
        uid: user.id,
      },
    });

    // 4. Fetch paginated todos belonging to the authenticated user
    const todos = await prisma.todo.findMany({
      where: {
        uid: user.id,
      },
      orderBy: {
        createdAt: "desc", // Show newest todos first
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        // uid is excluded for security
      },
      take: limit,
      skip: skip,
    });
    const completedTodos = await prisma.todo.count({
      where: {
        AND: [{ uid: user.id }, { status: true }],
      },
    });

    // 5. Return success response with pagination metadata
    return {
      statusCode: 200,
      message: "Todos fetched successfully",
      data: {
        todos,
        completedTodos,
        pendingTodos: total - completedTodos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + todos.length < total,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      statusCode: 500,
      message: "An error occurred while fetching todos",
    };
  }
});
