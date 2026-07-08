import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

function App() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/charts/test.mmd')
      .then((res) => res.text())
      .then((testChart) => {
        const id = `chart-${crypto.randomUUID()}`
        return mermaid.render(id, testChart)
      })
      .then(({ svg }) => {
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
