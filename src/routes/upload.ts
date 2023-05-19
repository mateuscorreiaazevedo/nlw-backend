import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export const uploadRoutes = async (app: FastifyInstance) => {
  app.post('/upload', async (req, res) => {
    const upload = await req.file({
      limits: {
        fileSize: 5_000_000 // 5mb
      }
    })

    if (!upload) {
      return res.status(400).send()
    }

    const mimeTypeRegex = /^image\/|^video\//
    const isValideFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValideFileFormat) {
      return res.status(400).send()
    }

    const fileId = randomUUID()
    const extension = extname(upload.filename)
    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(resolve(__dirname, '../../uploads/', fileName))
    await pump(upload.file, writeStream)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  })
}
