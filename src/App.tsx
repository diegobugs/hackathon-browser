import React, { useEffect, useRef, useState } from 'react'
import { Langchain } from './langchain'

const LOCATION = 'http://localhost:3000'

//const USER_PROMPT = 'Write Colima on the from field from the search form'

interface Prompt {
  type: string
  text: string
}

interface Sequence {
  prompt: Prompt
  selector?: string
  error: boolean
}

// Function to wait until promise resolve in a given time
const waitUntil = (timeout: number) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(true)
    }, timeout)
  })
}

function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>()
  const [sequence, setSequence] = useState<Sequence[]>([])
  const [documentSelector, setDocumentSelector] = useState<string>(
    '.layout-grid-routes'
  )
  const [running, setRunning] = useState<boolean>(false)
  const [runningSequence, setRunningSequence] = useState<number>()

  useEffect(() => {
    const iframe = iframeRef.current

    if (iframe) {
      iframe.addEventListener('load', async () => {
        iframe.style.border = '2px solid green'
      })
    }
  }, [])

  const handleOnAdd = (type: string) => () => {
    setCurrentPrompt({
      type,
      text: '',
    })
  }

  const handleOnChange = (event: any) => {
    const { value: text } = event.target
    setCurrentPrompt((state: any) => ({
      ...state,
      text,
    }))
  }

  const handleOnSave = () => {
    if (!currentPrompt) return

    setSequence((state: any) => [
      ...state,
      {
        prompt: currentPrompt,
        selector: '',
        error: false,
      },
    ])
    setCurrentPrompt(null)
  }

  const handlePlaySequence = async () => {
    if (running) return
    console.log('RUNNING')
    setRunning(true)
    const iframe = iframeRef.current
    // Add event to catch iframe loaded event
    const iDocument = iframe!.contentDocument

    // Change background color of iframe
    if (iDocument) {
      const content: any = iDocument.querySelector(documentSelector)
      const langchain = new Langchain()

      if (sequence && sequence.length > 0) {
        const sequencesRunning = sequence.map(async ({ prompt }, index) => {
          setRunningSequence(index)
          await waitUntil(1000)
          const element = await langchain.retrieveElement(
            content.innerHTML,
            prompt.text
          )

          if (element) {
            // Get element selector
            const selector = await langchain.retrieveElementSelector(element)

            if (selector) {
              // Get action from user input [click | type]
              const action = await langchain.retrieveAction(prompt.text)

              // Execute the action over the element
              if (action) {
                const value = await langchain.retrieveValue(action, prompt.text)
                console.log('value', value)
                console.log('selector', selector)
                console.log('action', action)

                if (action === 'click') {
                  const element = iDocument.querySelector(
                    `${documentSelector} ${selector}`
                  )
                  console.log('element', element)

                  if (element) {
                    element.dispatchEvent(new Event('click'))
                  }
                } else if (action === 'type') {
                  const element = iDocument.querySelector(
                    `${documentSelector} ${selector}`
                  )
                  console.log('element', element)
                  if (element) {
                    element.dispatchEvent(new Event('click'))
                    await waitUntil(1000)
                    element.value = value
                    element.dispatchEvent(new Event('input'))
                  }
                }
              }
            }
          }

          console.log('-----------')
        })
        await Promise.all(sequencesRunning)
        setRunning(false)
        setRunningSequence(undefined)
      }
    }
  }

  const handlePause = () => {
    console.log('paused')
  }

  const handleRefresh = () => {
    setRunning(false)
    setRunningSequence(undefined)
  }

  const handleChangeDocumentSelector = (event: any) => {
    const { value } = event.target
    setDocumentSelector(value)
  }

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="bg-gray-500 p-4 col-span-1">
        <div className="flex flex-row justify-end gap-2">
          <input
            type="text"
            value={documentSelector}
            onChange={handleChangeDocumentSelector}
          />
          <button className="bg-gray-200 p-2" onClick={handleRefresh}>
            Refresh
          </button>
          <button
            className="bg-gray-200 p-2"
            onClick={handlePlaySequence}
            disabled={!sequence}
          >
            {running ? 'Pause' : 'Play'}
          </button>
        </div>
        <div className="mt-10">
          {sequence &&
            sequence.map(({ prompt }, index) => (
              <div
                key={index}
                className={`flex flex-row justify-between items-center gap-2 bg-white mb-2 p-2 ${
                  runningSequence === index ? 'bg-green-300' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{prompt.type}</span>
                  <span className="text-sm">{prompt.text}</span>
                </div>
              </div>
            ))}

          {currentPrompt && (
            <textarea
              value={currentPrompt.text}
              rows={10}
              onChange={handleOnChange}
              placeholder="Type here..."
            />
          )}
          {!currentPrompt && (
            <div className="flex gap-2">
              <button
                className="bg-gray-200 p-2 flex-1"
                onClick={handleOnAdd('action')}
              >
                Add action
              </button>
              <button
                className="bg-gray-200 p-2 flex-1"
                onClick={handleOnAdd('assert')}
              >
                Add assertion
              </button>
            </div>
          )}
          {currentPrompt && (
            <button className="bg-green-300 p-2" onClick={handleOnSave}>
              Save
            </button>
          )}
        </div>
      </div>
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
