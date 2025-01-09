import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get the ID from the route parameters
    const id = getRouterParam(event, "id");

    // Validate if the ID is valid
    if (!id || isNaN(id)) {
      return {
        statusCode: 400,
        message: "Invalid ID. Please provide a valid numeric ID.",
      };
    }

    // Read the body from the request
    const body = await readBody(event);

    // Validate if the body contains the necessary fields for update
    if (!body || typeof body.status === 'undefined') {
      return {
        statusCode: 400,
        message: "Invalid body. The request must contain  and  fields.",
      };
    }

    // Convert the ID to an integer
    const parsedId = parseInt(id);

    // Check if the todo with the given ID exists
    const todo = await prisma.todo.findUnique({
      where: { id: parsedId },
    });

    if (!todo) {
      return {
        statusCode: 404,
        message: `Todo with ID ${id} not found.`,
      };
    }

    // Perform the update operation
    const res = await prisma.todo.update({
      where: { id: parsedId },
      data: body,
    });

    return {
      statusCode: 200,
      message: "Todo updated successfully",
      data: res,
    };

  } catch (error) {
    // Catch unexpected errors
    console.error(error);
    return {
      statusCode: 500,
      message: "An error occurred while updating the todo.",
    };
  }
});
