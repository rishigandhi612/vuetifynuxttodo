import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { serverSupabaseUser } from '#supabase/server'

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
    // Read the body from the request
    const body = await readBody(event);

    // Validate if the body contains the necessary fields for creating a todo
    if (!body || !body.title || typeof body.status === 'undefined') {
      return {
        statusCode: 400,
        message: "Invalid body. The request must contain 'title' and 'status' fields.",
      };
    }
    

    // Create a new todo using Prisma
    const todo = await prisma.todo.create({
      data: {
        title: body.title,
        status: body.status,
        uid: user.id
      },
    });

    // Return success response
    return {
      success: true,
      data: todo,
    };
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Return error response in case of failure
    return {
      statusCode: 500,
      message: "An error occurred while creating the todo.",
    };
  }
});
