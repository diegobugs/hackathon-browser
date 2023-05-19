import React, { useEffect, useRef, useState } from 'react'
import { Langchain } from './langchain'
import Button from './components/Button'
import Spinner from './components/Spinner'

const LOCATION = 'http://localhost:3000'

//const USER_PROMPT = 'Write Colima on the from field from the search form'

interface Prompt {
  type: string
  text: string
}

interface Sequence {
  containerSelector: string
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
  const [running, setRunning] = useState<boolean>(false)
  const [containerSelector, setContainerSelector] = useState<string>('')
  const [runningSequence, setRunningSequence] = useState<number>()
  const [location, setLocation] = useState<string>(LOCATION)

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

  const handleOnCancel = () => {
    setCurrentPrompt(null)
  }

  const handleOnSave = () => {
    if (!currentPrompt) return

    setSequence((state: any) => [
      ...state,
      {
        containerSelector: containerSelector,
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
      const langchain = new Langchain()

      if (sequence && sequence.length > 0) {
        const sequencesRunning = sequence.map(
          async ({ prompt, containerSelector }, index) => {
            console.log('containerSelector', containerSelector)
            const content: any = iDocument.querySelector(containerSelector)
            setRunningSequence(index)

            const element = await langchain.retrieveElement(
              content.innerHTML,
              prompt.text
            )

            if (element) {
              console.log('element', element)

              // Get element selector
              const selector = await langchain.retrieveElementSelector(element)

              if (selector) {
                // Get action from user input [click | type]
                const action = await langchain.retrieveAction(prompt.text)

                // Execute the action over the element
                if (action) {
                  const value = await langchain.retrieveValue(
                    action,
                    prompt.text
                  )

                  console.log('value', value)
                  console.log('action', action)
                  console.log('selector', selector)
                  console.log('containerSelector', containerSelector)

                  if (action === 'click') {
                    const element = iDocument.querySelector(
                      `${containerSelector} ${selector}`
                    )
                    console.log('element', element)

                    if (element) {
                      element.dispatchEvent(new Event('click'))
                    }
                  } else if (action === 'type') {
                    const element = iDocument.querySelector(
                      `${containerSelector} ${selector}`
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
          }
        )
        await Promise.all(sequencesRunning)
        setRunning(false)
        setRunningSequence(undefined)
      }
    }
  }

  const handlePause = () => {
    setRunning(false)
  }

  const handleRefresh = () => {
    setRunning(false)
    setRunningSequence(undefined)

    // Refesh the iframe
    const iframe = iframeRef.current
    if (iframe) {
      iframe.src = location
    }
  }

  const handleChangeDocumentSelector = (event: any) => {
    const { value } = event.target
    setContainerSelector(value)
  }

  const handleChangeLocation = (event: any) => {
    const { value } = event.target
    setLocation(value)
  }

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="bg-gray-500 p-4 col-span-1">
        <div className="flex flex-row justify-end gap-2">
          <input
            className="flex w-full"
            value={location}
            onChange={handleChangeLocation}
          />
          <Button onClick={handleRefresh}>Refresh</Button>
          <Button onClick={handlePlaySequence} disabled={!sequence}>
            {running ? 'Pause' : 'Play'}
          </Button>
        </div>
        <div className="mt-2 border-b border-gray-400" />
        <div className="mt-2">
          {sequence &&
            sequence.map(({ prompt, selector, containerSelector }, index) => (
              <div
                key={index}
                className={`flex flex-row justify-between items-center gap-2 bg-gray-800 text-white mb-2 p-2 ${
                  runningSequence === index ? 'bg-green-300' : ''
                }`}
              >
                <div className="w-full flex flex-col">
                  <div className="flex flex-row items-center justify-between">
                    <div>{runningSequence === index && <Spinner />}</div>
                    <div className="flex flex-row justify-end">
                      <span className="text-sm bg-green-700 text-center px-4">
                        {prompt.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm">Selector </span>
                    <span className="text-sm text-gray-400">
                      {containerSelector}
                    </span>
                  </div>
                  <span className="text-sm">{prompt.text}</span>
                </div>
              </div>
            ))}

          {currentPrompt && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Set container..."
                value={containerSelector}
                onChange={handleChangeDocumentSelector}
              />
              <textarea
                value={currentPrompt.text}
                rows={3}
                onChange={handleOnChange}
                placeholder="Type here..."
              />
            </div>
          )}
          {!currentPrompt && (
            <div className="flex gap-2">
              <Button onClick={handleOnAdd('action')}>Add action</Button>
              <Button onClick={handleOnAdd('assert')}>Add assertion</Button>
            </div>
          )}
          {currentPrompt && (
            <div className="flex flex-row justify-end mt-4 gap-2">
              <Button onClick={handleOnCancel}>Cancel</Button>
              <Button onClick={handleOnSave}>Save</Button>
            </div>
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
          src={location}
        />
      </div>
    </div>
  )
}

export default App
