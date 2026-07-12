import { useEffect, useState } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const [backendMessage, setBackendMessage] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data.status)
        setBackendMessage(data.message)
      })
      .catch(err => {
        setBackendStatus('error')
        setBackendMessage(err.toString())
      })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1220] text-white font-sans">
      <h1 className="text-4xl font-bold mb-4">Bank Churn Analytics</h1>
      <div className="bg-[#161F2E] p-6 rounded-lg border border-white/10 shadow-lg text-center">
        <h2 className="text-xl mb-2 text-[#C9A24B]">System Status</h2>
        <p className="mb-1">
          Frontend: <span className="text-[#2FBF71]">ok</span>
        </p>
        <p>
          Backend: <span className={backendStatus === 'ok' ? 'text-[#2FBF71]' : 'text-[#D64545]'}>{backendStatus}</span>
        </p>
        {backendMessage && (
          <p className="mt-4 text-sm text-gray-400 max-w-md">{backendMessage}</p>
        )}
      </div>
    </div>
  )
}

export default App
