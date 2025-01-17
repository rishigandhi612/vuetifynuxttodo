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
    let limit = Number(query.limit) || 10; // Default limit is 10
    
    // 3. Get total count for pagination
    const total = await prisma.todo.count({
      where: {
        uid: user.id,
      },
    });

    // 4. If limit is -1, fetch all todos, else handle pagination
    let skip = 0;
    if (limit === -1) {
      limit = total; // Fetch all todos
      skip = 0; // No skip required
    } else {
      skip = (page - 1) * limit; // Pagination logic
    }

    // 5. Fetch todos based on limit and pagination
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
      take: limit === -1 ? undefined : limit, // If limit is -1, don't apply the "take"
      skip: limit === -1 ? undefined : skip, // If limit is -1, don't apply the "skip"
    });

    // 6. Fetch completed todos count
    const completedTodos = await prisma.todo.count({
      where: {
        AND: [{ uid: user.id }, { status: true }],
      },
    });

    // 7. Return success response with pagination metadata
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
          totalPages: limit === -1 ? 1 : Math.ceil(total / limit), // If limit = -1, there's only 1 page
          hasMore: limit === -1 ? false : skip + todos.length < total, // No "hasMore" when all records are fetched
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
