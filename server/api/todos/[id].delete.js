import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    // Validation to ensure the ID is a valid number
    if (!id || isNaN(id)) {
      return {
        statusCode: 400,
        message: "Invalid ID. Please provide a valid numeric ID.",
      };
    }

    // Convert ID to an integer
    const parsedId = parseInt(id);

    // Check if the todo exists before trying to delete
    const todo = await prisma.todo.findUnique({
      where: { id: parsedId },
    });

    if (!todo) {
      return {
        statusCode: 404,
        message: `Todo with ID ${id} not found.`,
      };
    }

    // Delete the todo
    const res = await prisma.todo.delete({
      where: {
        id: parsedId,
      },
    });

    return {
      statusCode: 200,
      message: "Todo deleted successfully",
      data: res,
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error(error);
    return {
      statusCode: 500,
      message: "An error occurred while deleting the todo.",
    };
  }
});
