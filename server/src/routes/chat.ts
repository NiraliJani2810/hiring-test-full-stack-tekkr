import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { getLlmProvider } from '../services/llm/getLlmProvider'

const chatRoute: FastifyPluginAsync = async (fastify) => {
  const MessageSchema = z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })

  const BodySchema = z.object({
    model: z.string().optional(),
    messages: z.array(MessageSchema).min(1),
  })

  fastify.post('/api/chat/complete', async (request, reply) => {
    const parsed = BodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body' })
    }

    try {
      const llm = getLlmProvider()
      const content = await llm.generate(parsed.data)
      return { content }
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ error: 'LLM request failed' })
    }
  })
}

export default chatRoute
