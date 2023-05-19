import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: 'org-scTtDRuncpaYiFm4kWWdLvUt',
  apiKey: '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',
})

export class Langchain {
  model: OpenAIApi
  memory: any

  constructor() {
    this.model = new OpenAIApi(configuration)
    this.memory = null
  }

  /* async readBuffer(buffer) {
    await this.chain.call({ input: buffer })
  } */

  async agent() {}

  prepareString(input: string) {
    return input.split('\n')
  }

  // Haz clic en el botón de buscar
  // Traducido: CLick on the search button

  async retrieveElement(input: any, prompt: string) {
    const response = await this.model.createChatCompletion({
      temperature: 0,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `
          Retrieve only the HTML element that better matches to the user prompt.
      Answer only a valid HTML element that is in the given HTML.
      
      The actual HTML is:
      ${input}
      
      ${prompt}`,
        },
      ],
    })

    if (response && response.data.choices) {
      const { message } = response.data.choices[0]

      return message?.content.trim()
    }
  }

  async retrieveElementSelector(element: string) {
    const response = await this.model.createCompletion({
      temperature: 0,
      //model: 'gpt-3.5-turbo',
      model: 'text-davinci-001',
      prompt: `
      Retrieve only the selector that matches the current element.
      Output only a valid selector for the given element. Be the most precise as possible.

      The current element is:
      ${element}

      `,
    })

    if (response && response.data.choices) {
      const { text } = response.data.choices[0]

      return text?.trim()
    }
  }

  async retrieveElementSelectorChat(element: string) {
    const response = await this.model.createChatCompletion({
      temperature: 0,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `
          Retrieve only the selector that matches the current element.
      Output only a valid selector for the given element. Be the most precise as possible.

      The current element is:
      ${element}          
          `,
        },
      ],
    })

    if (response && response.data.choices) {
      const { message } = response.data.choices[0]

      return message?.content.trim()
    }
  }

  async retrieveAction(prompt: string) {
    const actions = ['click', 'type']
    const content = `
    Retrieve just the supported actions keyword that matches with the user input if it is specified, if not return empty string:
    user input: ${prompt}
    limitations: ${actions.join(',')}
    `
    const response = await this.model.createChatCompletion({
      temperature: 0,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })
    if (response && response.data.choices) {
      const { message } = response.data.choices[0]

      const content = message?.content.trim()
      if (content) return actions.find((el) => content.includes(el))
    }
  }

  async retrieveValue(action: string, prompt: string) {
    let content = `
    Retrieve only the value to ${action} specified in the user input,
    limitations: just give the value, don't add anymore.
    user input: ${prompt}
    `

    const response = await this.model.createChatCompletion({
      temperature: 0,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })
    if (response && response.data.choices) {
      const { message } = response.data.choices[0]
      return message?.content
    }
  }

  async createTest(action: string, selector: string) {}
}

function groupArrayElements(array: any[], groupSize: number) {
  const groupedArray = []
  for (let i = 0; i < array.length; i += groupSize) {
    const group = array.slice(i, i + groupSize)
    groupedArray.push(group.join('\n'))
  }
  return groupedArray
}
