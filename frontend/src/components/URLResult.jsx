import { Copy, CheckCircle, Clock } from 'lucide-react'

function URLResult({ shortUrl, originalUrl, expiryDate }) {

  const copyURL = () => {
    navigator.clipboard.writeText(shortUrl)
    alert('URL copied successfully!')
  }

  return (
    <div className="url-result">

      <h2>
        <CheckCircle size={20} color="green" />
        Your URL is ready!
      </h2>

      <label>Shortened URL</label>

      <div className="short-url-box">
        <a href={shortUrl} target="_blank" rel="noreferrer">
          {shortUrl}
        </a>

        <button onClick={copyURL}>
          <Copy size={18} />
        </button>
      </div>

      <p>Original URL: {originalUrl}</p>

      {expiryDate && (
        <p>
          <Clock size={16} />
          Expires: {expiryDate}
        </p>
      )}

    </div>
  )
}

export default URLResult