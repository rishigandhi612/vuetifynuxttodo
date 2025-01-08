import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {

  const body = await readBody(event)

  const todo = await prisma.todo.create({
    data: body
  
  })
  return {
    sucess: true,
    data:todo
  }
})
