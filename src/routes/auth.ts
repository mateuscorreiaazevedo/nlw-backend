import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', async req => {
    const bodySchema = z.object({
      code: z.string()
    })
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url()

    })

    const { code } = bodySchema.parse(req.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          code,
          client_id: process.env.GITHUB_ID,
          client_secret: process.env.GITHUB_SECRET
        },
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url
        }
      })
    }

    const token = app.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: '30 days',
    })

    return { token }
  })
}
