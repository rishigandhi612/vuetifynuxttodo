import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // 1. Check if user is authenticated
  const user = await serverSupabaseUser(event);
  if (!user) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  try {
    // 2. Get and validate the ID
    const id = getRouterParam(event, "id");
    if (!id || isNaN(id)) {
      return {
        statusCode: 400,
        message: "Invalid ID. Please provide a valid numeric ID.",
      };
    }

    // 3. Get and validate the request body
    const body = await readBody(event);
    if (!body || typeof body.status === 'undefined') {
      return {
        statusCode: 400,
        message: "Invalid body. The request must contain a status field.",
      };
    }

    const parsedId = parseInt(id);

    // 4. Find todo with both ID and user ID match
    const todo = await prisma.todo.findFirst({
      where: {
        AND: [
          { id: parsedId },
          { uid: user.id }  // Ensure the todo belongs to the requesting user
        ]
      }
    });

    // 5. Check if todo exists and belongs to user
    if (!todo) {
      return {
        statusCode: 404,
        message: "Todo not found or you don't have permission to update it",
      };
    }

    // 6. Perform the update only if all checks pass
    const updatedTodo = await prisma.todo.update({
      where: { id: parsedId },
      data: {
        status: body.status,
        // Only allow updating the status field for security
        // Add other fields here if needed
      }
    });

    return {
      statusCode: 200,
      message: "Todo updated successfully",
      data: updatedTodo,
    };

  } catch (error) {
    console.error("Error updating todo:", error);
    return {
      statusCode: 500,
      message: "An error occurred while updating the todo.",
    };
  }
});