import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: 'org-scTtDRuncpaYiFm4kWWdLvUt',
  apiKey: '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',
})

export class Langchain {
  model: OpenAIApi

  constructor() {
    this.model = new OpenAIApi(configuration)
  }

  async retrieveElement(input: string, prompt: string) {
    try {
      const content = `
      Find the HTML element that better matches to the user prompt from the given HTML.
      Output only the HTML element.            
      
      The actual HTML is:
      ${input}
      
      User prompt: ${prompt}
      
      Limitations: Full element found in the actual HTML.
      Scope: html
      Tone: computer
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

        const text = message?.content.trim()
        return text
      }
      return false
    } catch (error) {
      return false
    }
  }

  async retrieveElementSelector(element: string) {
    try {
      const content = `
      Retrieve the HTML element selector for the current element. Provide the most precise HTML element selector for the given element. 
              
      HTML element: ${element}

      Format: HTML element selector.
      Limitations: only the HTML element selector, don't add anymore.
      Tone: computer
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
        const { text } = response.data.choices[0]

        return text?.trim()
      }
      return false
    } catch (error) {
      return false
    }
  }

  async retrieveElementSelectorChat(element: string) {
    try {
      const content = `
      Retrieve the HTML element selector for the current element. Provide the most precise HTML element selector for the given element. 
              
      HTML element: ${element}

      Format: HTML element selector.
      Limitations: only the HTML element selector, don't add anymore.
      Tone: computer
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
        const text = message?.content.trim()

        return text?.trim()
      }
      return false
    } catch (error) {
      return false
    }
  }

  async retrieveAction(prompt: string) {
    try {
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

        const text = message?.content.trim()
        if (text) return actions.find((el) => text.includes(el))
      }
      return false
    } catch (error) {
      return false
    }
  }

  async retrieveValue(action: string, prompt: string) {
    try {
      const content = `
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
      return false
    } catch (error) {
      return false
    }
  }

  async retrieveAssert(prompt: string) {
    const asserts = ['contains', 'isVisible']
    const content = `
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
    return false
  }

  async retrieveAssertContainsValue(prompt: string) {
    const content = `
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
    return false
  }

  async retrieveAssertContainsElement(element: string, containedValue: string) {
    const content = `
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
    return false
  }
}
