import { OpenAI } from 'langchain/llms/openai'
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'

export class Langchain {
  constructor() {
    this.model = new OpenAI({})
    this.memory = new BufferMemory()
    this.chain = new ConversationChain({ llm: model, memory: memory })
  }

  async readBuffer(buffer) {
    await this.chain.call({ input: buffer })
  }

  async agent() {}
}
