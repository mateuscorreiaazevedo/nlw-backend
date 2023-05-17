import { FastifyInstance } from 'fastify'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    return {
      data: memories.map(memory => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          excerpt: memory.content.substring(0, 115).concat('...')
        }
      })
    }
  })
  app.get('/memories/:id', async req => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id
      }
    })

    return { data: memory }
  })
  app.post('/memories', async req => {
    const bodySchema = z.object({
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      content: z.string()
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: 'd84304e4-b6fc-490c-b0ac-7ad1be9b2d81'
      }
    })

    return {
      data: memory
    }
  })
  app.put('/memories/:id', async req => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })
    const bodySchema = z.object({
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      content: z.string()
    })

    const { id } = paramsSchema.parse(req.params)
    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    const memory = await prisma.memory.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(coverUrl && { coverUrl }),
        ...(isPublic && { isPublic })
      }
    })

    return { data: memory }
  })
  app.delete('/memories/:id', async req => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(req.params)

    await prisma.memory.delete({
      where: {
        id
      }
    })

    return { message: 'Memória deletada com sucesso!' }
  })
}
