import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'

export async function memoriesRoutes (app: FastifyInstance) {
  app.addHook('preHandler', async req => await req.jwtVerify())

  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      where: {
        userId: req.user.sub
      }
    })

    return {
      data: memories.map(memory => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          excerpt: memory.content.substring(0, 115).concat('...'),
          createdAt: memory.createdAt
        }
      })
    }
  })
  app.get('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id
      }
    })

    if (!memory.isPublic && memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

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
        userId: req.user.sub
      }
    })

    return {
      data: memory
    }
  })
  app.put('/memories/:id', async (req, res) => {
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

    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id }
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    memory = await prisma.memory.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(coverUrl && { coverUrl }),
        ...(isPublic && { isPublic })
      }
    })

    return { data: memory }
  })
  app.delete('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(req.params)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id }
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    memory = await prisma.memory.delete({
      where: {
        id
      }
    })

    return { message: 'Memória deletada com sucesso!' }
  })
  app.delete('/memories', async () => {
    await prisma.memory.deleteMany()
  })
}
