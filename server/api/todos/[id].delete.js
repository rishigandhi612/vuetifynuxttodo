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
    const id = getRouterParam(event, "id");

    // 2. Validate ID format
    if (!id || isNaN(id)) {
      return {
        statusCode: 400,
        message: "Invalid ID. Please provide a valid numeric ID.",
      };
    }

    const parsedId = parseInt(id);

    // 3. Find todo with both ID and user ID match
    const todo = await prisma.todo.findFirst({
      where: {
        AND: [
          { id: parsedId },
          { uid: user.id }  // Ensure the todo belongs to the requesting user
        ]
      }
    });

    // 4. Check if todo exists and belongs to user
    if (!todo) {
      return {
        statusCode: 404,
        message: "Todo not found or you don't have permission to delete it",
      };
    }

    // 5. Delete the todo only if all checks pass
    const deletedTodo = await prisma.todo.delete({
      where: {
        id: parsedId,
      }
    });

    return {
      statusCode: 200,
      message: "Todo deleted successfully",
      data: deletedTodo,
    };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      statusCode: 500,
      message: "An error occurred while deleting the todo.",
    };
  }
});