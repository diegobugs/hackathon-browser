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
    const response = await this.model.createCompletion({
      temperature: 0,
      model: 'text-davinci-001',
      prompt: `
          Retrieve only the HTML element that better matches to the user prompt.
      Answer only a valid HTML element that is in the given HTML.
      
      The actual HTML is:
      ${input}
      
      ${prompt}`,
    })

    if (response && response.data.choices) {
      const { text } = response.data.choices[0]

      return text?.trim()
    }
  }

  async retrieveElementSelector(element: string) {
    const response = await this.model.createCompletion({
      temperature: 0,
      model: 'text-davinci-001',
      prompt: `
      Retrieve only the html selector that matches the current element.
      Output only a valid html selector for the given element. Be the most precise as possible.    

      Element: ${element}
      `,
    })

    if (response && response.data.choices) {
      const { text } = response.data.choices[0]

      return text?.trim()
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

  async retrieveAssert(prompt: string) {
    const asserts = ['contains', 'isVisible']
    let content = `
    Retrieve just the supported assert keyword that matches with the user input if it is specified, if not return empty string:
    user input: ${prompt}
    limitations: ${asserts.join(',')}
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

  async retrieveAssertContainsValue(prompt: string) {
    let content = `
    Retrieve only the value that should be contained specified in the user input,
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

  async retrieveAssertContainsElement(element: string, containedValue: string) {
    let content = `
    Response yes if the contained value is in the element.
    contained value: ${containedValue}
    element: ${element}
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
}
