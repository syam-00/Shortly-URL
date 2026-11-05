
import { useState, useEffect } from 'react'
import { Link, Pencil, X } from 'lucide-react'

function URLForm({
  onSubmit,
  initialData,
  isEditing,
  onCancel
}) {

  const [longUrl, setLongUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  // Populate form when editing an existing URL
  useEffect(() => {
    if (initialData) {
      setLongUrl(initialData.originalUrl || '')
      setCustomAlias(initialData.customAlias || '')

      setExpiryDate(
        initialData.expiryDate
          ? new Date(initialData.expiryDate)
              .toISOString()
              .slice(0, 16)
          : ''
      )
    } else {
      setLongUrl('')
      setCustomAlias('')
      setExpiryDate('')
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      longUrl,
      customAlias,
      expiryDate
    })

    // Clear form only when creating a new URL
    if (!isEditing) {
      setLongUrl('')
      setCustomAlias('')
      setExpiryDate('')
    }
  }

  return (
    <div className="url-form">

      <h1>
        {isEditing ? 'Edit Your URL' : 'Shorten your links'}
      </h1>

      <p>
        {isEditing
          ? 'Update your existing shortened URL.'
          : 'Convert long URLs into short and shareable links.'}
      </p>

      <form onSubmit={handleSubmit}>

        <label>Enter Long URL</label>

        <input
          type="url"
          placeholder="https://example.com/your-long-url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />

        <label>Custom Alias (Optional)</label>

        <input
          type="text"
          placeholder="my-custom-link"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
        />

        <label>Expiration Date (Optional)</label>

        <input
          type="datetime-local"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        <button type="submit">
          {isEditing ? (
            <>
              <Pencil size={18} />
              Update URL
            </>
          ) : (
            <>
              <Link size={18} />
              Shorten URL
            </>
          )}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
          >
            <X size={18} />
            Cancel Editing
          </button>
        )}

      </form>

    </div>
  )
}

export default URLForm
