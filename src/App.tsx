import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import testChart from './test.mmd?raw'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

function App() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = `chart-${crypto.randomUUID()}`
    mermaid.render(id, testChart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    })
  }, [])

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div ref={ref} />
    </main>
  )
}

export default App
