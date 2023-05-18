import React, { useEffect, useRef } from 'react'
import { Langchain } from './langchain'

const LOCATION = 'http://localhost:3000'

//const USER_PROMPT = 'Write Colima on the from field from the search form'
const USER_PROMPT =
  'Escribe Colima en el campo de origen del formulario de búsqueda'

function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current

    if (iframe) {
      iframe.addEventListener('load', async () => {
        iframe.style.border = '2px solid green'
        // Add event to catch iframe loaded event
        const iDocument = iframe.contentDocument

        // Change background color of iframe
        if (iDocument) {
          const content: any = iDocument.querySelector('.layout-grid-routes')
          const langchain = new Langchain()
          const element = await langchain.retrieveElement(
            content.innerHTML,
            USER_PROMPT
          )

          if (element) {
            // Get element selector
            const selector = await langchain.retrieveElementSelector(element)

            if (selector) {
              // Get action from user input [click | type]
              const action = await langchain.retrieveAction(USER_PROMPT)

              // Execute the action over the element
              if (action) {
                const value = await langchain.retrieveValue(action, USER_PROMPT)
                console.log('value', value)

                if (action === 'click') {
                  const element = iDocument.querySelector(selector)
                  console.log('element', element)

                  if (element) {
                    element.click()
                  }
                } else if (action === 'type') {
                  const element = iDocument.querySelector(selector)
                  console.log('element', element)
                  if (element) {
                    element.click()
                    element.value = value
                    element.dispatchEvent(new Event('input'))
                  }
                }
              }
            }
          }
        }
      })
    }
  }, [])

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="bg-gray-500 p-4 col-span-1" />
      <div className="bg-gray-200 p-4 col-span-3">
        <iframe
          ref={iframeRef}
          title="iFrame"
          id="iFrame"
          width="100%"
          height="100%"
          src={LOCATION}
        />
      </div>
    </div>
  )
}

export default App
