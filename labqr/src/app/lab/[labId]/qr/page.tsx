'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function QRPage() {
  const { labId } = useParams<{ labId: string }>()
  const router    = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl]     = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const labUrl = `${window.location.origin}/lab/${labId}`
    setUrl(labUrl)
    import('qrcode').then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, labUrl, {
          width: 280, margin: 2,
          color: { dark: '#1d4ed8', light: '#ffffff' },
        })
      }
    })
  }, [labId])

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `lab-${labId}-qr.png`
    a.href = canvas.toDataURL()
    a.click()
  }

  return (
    <div className="max-w-lg mx-auto p-6 text-center pt-10">
      <button onClick={() => router.push(`/lab/${labId}`)} className="text-blue-600 text-sm font-medium mb-6 block">← Back to Lab</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Lab QR Code</h1>
      <p className="text-gray-400 text-sm mb-8">Print and display at your lab. Patients scan to book tests.</p>

      <div className="card inline-block p-6 mb-6">
        <canvas ref={canvasRef} className="rounded-xl" />
      </div>

      <div className="card p-4 mb-6 flex items-center gap-3">
        <p className="flex-1 text-sm text-gray-600 text-left truncate font-mono text-xs">{url}</p>
        <button onClick={copy} className="shrink-0 text-sm font-semibold text-blue-600 hover:underline">
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={download} className="btn-primary flex-1">⬇ Download PNG</button>
        <a href={`/lab/${labId}`} target="_blank" rel="noreferrer" className="btn-outline flex-1 flex items-center justify-center">Open Page →</a>
      </div>
    </div>
  )
}
