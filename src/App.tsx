import React, { useEffect, useRef } from 'react'

const LOCATION = 'http://localhost:3000'

function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current

    if (iframe) {
      iframe.addEventListener('load', () => {
        iframe.style.border = '2px solid green'
        // Add event to catch iframe loaded event
        const iDocument = iframe.contentDocument

        // Change background color of iframe
        if (iDocument) {
          const body: any = iDocument.querySelector('body')
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
