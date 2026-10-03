import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function isValidUrl(value) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [links, setLinks] = useState([])
  const [copied, setCopied] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmed = url.trim()
    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({originalUrl: trimmed }),
      })
      console.log
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)

      setLinks((prev) => [{ original: trimmed, short: data.data.shortUrl }, ...prev])
      setUrl('')
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Could not reach the server. Is the backend running?'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      setTimeout(() => setCopied(''), 1500)
    } catch {
      setError('Copy failed. Please copy the link manually.')
    }
  }

  return (
    <main className="container">
      <h1>URL Shortener</h1>
      <p className="subtitle">Paste a long link and get a short one.</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="https://example.com/some/very/long/link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Long URL"
          autoFocus
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {links.length > 0 && (
        <ul className="links">
          {links.map((link) => (
            <li key={link.short}>
              <div className="link-text">
                <a href={link.short} target="_blank" rel="noreferrer">
                  {link.short}
                </a>
                <span className="original" title={link.original}>
                  {link.original}
                </span>
              </div>
              <button className="copy" onClick={() => copy(link.short)}>
                {copied === link.short ? 'Copied!' : 'Copy'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
