import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  let res = await prisma.todo.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { 
    id: id, 
    res: res, 
  };
});
