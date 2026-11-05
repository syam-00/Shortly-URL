import { Copy, Trash2, Pencil } from 'lucide-react'

function URLHistory({ urls, onDelete, onEdit }) {
    <button onClick={() => onEdit(url)}>
  <Pencil size={17} />
</button>

  const copyURL = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    alert('URL copied successfully!')
  }


  if (urls.length === 0) {
    return (
      <div className="url-history">
        <h2>Your URL History</h2>
        <p>No URLs created yet.</p>
      </div>
    )
  }

  return (
    <div className="url-history">

      <h2>Your URL History</h2>

      {urls.map((url) => (

        <div className="history-card" key={url.id}>

          <div className="history-header">
            <h3>{url.customAlias || 'Random URL'}</h3>
            <span>Active</span>
          </div>

          <div className="history-short-url">
            {url.shortUrl}
          </div>

          <p>Original: {url.originalUrl}</p>

          <p className="click-count">
          <span>Clicks:</span> {url.clicks ?? 0}
            </p>

          <div className="history-footer">

            <p>
              {url.expiryDate
                ? `Expires: ${url.expiryDate}`
                : 'No expiration'}
            </p>

           <div className="history-actions">

                <button onClick={() => copyURL(url.shortUrl)}>
                    <Copy size={17} />
                </button>

                <button onClick={() => onEdit(url)}>
                    <Pencil size={17} />
                </button>

                <button onClick={() => onDelete(url.id)}>
                    <Trash2 size={17} />
                </button>

            </div>

          </div>

        </div>

      ))}

    </div>
  )
}

export default URLHistory