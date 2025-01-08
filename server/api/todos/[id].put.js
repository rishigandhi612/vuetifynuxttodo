import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

let res = await prisma.todo.update({
  where:{
    id: parseInt(id),
  },
  data: body,});

  return { 
    id: id, 
    res: res, 
  };
});
