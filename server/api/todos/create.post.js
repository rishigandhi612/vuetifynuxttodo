import { PrismaClient } from "@prisma/client";
import { serverSupabaseUser } from '#supabase/server';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. Authenticate user
  const user = await serverSupabaseUser(event);
  if (!user) {
    return {
      statusCode: 401,
      message: "Unauthorized - Please log in to create todos",
    };
  }

  try {
    const body = await readBody(event);

    // 2. Validate request body
    if (!body?.title?.trim()) {
      return {
        statusCode: 400,
        message: "Invalid request: Title is required",
      };
    }

    // 3. Check if user already has a todo with this title
    const existingTodo = await prisma.todo.findFirst({
      where: {
        AND: [
          { title: body.title.trim() },
          { uid: user.id }
        ]
      }
    });

    if (existingTodo) {
      return {
        statusCode: 409, // Conflict
        message: "You already have a todo with this title",
      };
    }

    // 4. Create new todo
    const todo = await prisma.todo.create({
      data: {
        title: body.title.trim(),
        status: body.status ?? false,
        uid: user.id
      },
    });

    return {
      statusCode: 201, // Created
      message: "Todo created successfully",
      data: todo,
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return {
        statusCode: 409,
        message: "You already have a todo with this title",
      };
    }

    return {
      statusCode: 500,
      message: "An error occurred while creating the todo",
    };
  }
});