/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
import { Langchain } from './langchain'
import Button from './components/Button'
import Spinner from './components/Spinner'

const LOCATION = 'http://localhost:3000'

// const USER_PROMPT = 'Write Colima on the from field from the search form'

interface Prompt {
  type: string
  text: string
}

interface Sequence {
  containerSelector: string
  prompt: Prompt
  selector?: string
  type?: string
  element?: string
  value?: string
  error: boolean
}

// Function to wait until promise resolve in a given time
const waitUntil = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })
}

function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>()
  const [sequence, setSequence] = useState<Sequence[] | undefined>()
  const [running, setRunning] = useState<boolean>(false)
  const [currentContainerSelector, setCurrentContainerSelector] =
    useState<string>('')
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

    const newSequence = {
      containerSelector: currentContainerSelector,
      prompt: currentPrompt,
      selector: '',
      error: false,
    }

    setSequence((state: any) =>
      state ? [...state, newSequence] : [newSequence]
    )
    setCurrentPrompt(null)
  }

  const handlePlaySequence = async () => {
    try {
      if (running) return
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
              try {
                const content: any = iDocument.querySelector(containerSelector)
                setRunningSequence(index)

                const element = await langchain.retrieveElement(
                  content.innerHTML,
                  prompt.text
                )

                if (element) {
                  // Get element selector
                  const selector = await langchain.retrieveElementSelectorChat(
                    element
                  )
                  setSequence((state) => {
                    const newState = [...state]
                    newState[index].element = element
                    return newState
                  })

                  if (selector) {
                    setSequence((state) => {
                      const newState = [...state]
                      newState[index].selector = selector
                      return newState
                    })
                    // Get action from user input [click | type]
                    const action = await langchain.retrieveAction(prompt.text)

                    // Execute the action over the element
                    if (action) {
                      setSequence((state) => {
                        const newState = [...state]
                        newState[index].type = action
                        return newState
                      })
                      const value = await langchain.retrieveValue(
                        action,
                        prompt.text
                      )

                      setSequence((state) => {
                        const newState = [...state]
                        newState[index].value = value
                        return newState
                      })

                      if (action === 'click') {
                        const selectedElement = iDocument.querySelector(
                          `${containerSelector} ${selector}`
                        )

                        if (selectedElement) {
                          selectedElement.dispatchEvent(new Event('click'))
                        }
                      } else if (action === 'type') {
                        const selectedElement = iDocument.querySelector(
                          `${containerSelector} ${selector}`
                        )

                        if (selectedElement) {
                          selectedElement.dispatchEvent(new Event('click'))
                          await waitUntil(1000)
                          selectedElement.value = value
                          selectedElement.dispatchEvent(new Event('input'))
                        }
                      }
                    }
                  }
                }
              } catch (error) {
                console.log(error)
                setSequence((state) => {
                  const newState = [...state]
                  newState[index].error = true
                  return newState
                })
                throw error
              }
            }
          )
          await Promise.all(sequencesRunning)
          setRunning(false)
          setRunningSequence(undefined)
        }
      }
    } catch (error) {
      setRunning(false)
      setRunningSequence(undefined)
    }
  }

  const handlePause = () => {
    setRunning(false)
  }

  const handlePlayPauseSequence = () => {
    if (running) {
      handlePause()
    } else {
      handlePlaySequence()
    }
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
    setCurrentContainerSelector(value)
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
          <Button onClick={handlePlayPauseSequence} disabled={!sequence}>
            {running ? 'Pause' : 'Play'}
          </Button>
        </div>
        <div className="mt-2 border-b border-gray-400" />
        <div className="mt-2">
          {sequence &&
            sequence.map(
              (
                {
                  prompt,
                  containerSelector,
                  selector,
                  type,
                  element,
                  value,
                  error,
                },
                index
              ) => (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center gap-2 bg-gray-800 text-white mb-2 p-2"
                >
                  <div className="w-full flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                      <div>
                        {Number(runningSequence) === Number(index) && (
                          <Spinner />
                        )}
                      </div>
                      <div className="flex flex-row justify-end">
                        <span
                          className={`text-sm  text-center px-4 ${
                            error ? 'bg-red-700' : 'bg-green-700'
                          }`}
                        >
                          {prompt.type}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm">Container </span>
                      <span className="text-sm text-gray-400">
                        {containerSelector}
                      </span>
                    </div>
                    <span className="text-sm">{prompt.text}</span>
                    {selector && (
                      <div className="p-2 bg-gray-900">
                        <span className="text-xs">{element}</span>
                        <span className="text-xs">{'> '}</span>
                        <span className="text-xs">{type} </span>
                        <span className="text-xs text-gray-400">
                          {selector}
                        </span>
                        {value && (
                          <span className="text-xs bg-gray-400 px-2">
                            {value}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

          {currentPrompt && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Set container..."
                value={currentContainerSelector}
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
