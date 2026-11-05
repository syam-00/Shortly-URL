
import { useState, useEffect } from 'react'
import api from './services/api'

import Footer from './components/Footer'
import Header from './components/Header'
import URLForm from './components/URLForm'
import URLResult from './components/URLResult'
import URLHistory from './components/URLHistory'
import Analytics from './components/Analytics'
import ClickChart from './components/ClickChart'

import './App.css'

function App() {
  const [activePage, setActivePage] = useState('home')
  const [urlData, setUrlData] = useState(null)
  const [urls, setUrls] = useState([])
  const [editingUrl, setEditingUrl] = useState(null)
  const [toast, setToast] = useState(null)

  // Display professional toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Automatically remove toast after 2.5 seconds
  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      setToast(null)
    }, 2500)

    return () => clearTimeout(timer)
  }, [toast])

  // Navigation
  const handleNavigate = (page, section) => {
    setActivePage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    if (section) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({
          behavior: 'smooth'
        })
      }, 150)
    }
  }

  // Fetch URL history from MongoDB
  const fetchUrls = async () => {
    try {
      const response = await api.get('/urls')

      const formattedUrls = response.data.data.map((item) => ({
        id: item._id,
        originalUrl: item.originalUrl,
        shortUrl: `http://localhost:5000/${item.shortCode}`,
        customAlias: item.customCode,
        expiryDate: item.expiresAt,
        clicks: item.clicks
      }))

      setUrls(formattedUrls)

    } catch (error) {
      console.error('Failed to fetch URLs:', error)
    }
  }

  // Load history when application starts
  useEffect(() => {
    fetchUrls()
  }, [])

  // Create a new short URL
  const handleURLSubmit = async (data) => {
    try {
      const response = await api.post('/urls', {
        originalUrl: data.longUrl,
        customCode: data.customAlias || undefined,
        expiresAt: data.expiryDate
          ? new Date(data.expiryDate).toISOString()
          : undefined
      })

      const newUrl = {
        id: response.data.data.shortCode,
        originalUrl: response.data.data.originalUrl,
        shortUrl: response.data.data.shortUrl,
        customAlias: response.data.data.customCode,
        expiryDate: response.data.data.expiresAt
      }

      setUrlData(newUrl)

      await fetchUrls()

      showToast(
        'Your short URL has been created successfully!',
        'success'
      )

    } catch (error) {
      console.error('URL creation failed:', error)

      showToast(
        error.response?.data?.message || 'Failed to shorten URL.',
        'error'
      )
    }
  }

  // Delete URL permanently from MongoDB
  const handleDelete = async (id) => {
    try {
      await api.delete(`/urls/${id}`)

      await fetchUrls()

      if (urlData?.id === id) {
        setUrlData(null)
      }

      showToast('URL deleted successfully!', 'success')

    } catch (error) {
      console.error('URL deletion failed:', error)

      showToast(
        error.response?.data?.message || 'Failed to delete URL.',
        'error'
      )
    }
  }

  // Select URL for editing
  const handleEdit = (url) => {
    setEditingUrl(url)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Update existing URL in MongoDB
  const handleUpdate = async (data) => {
    try {
      await api.put(`/urls/${editingUrl.id}`, {
        originalUrl: data.longUrl,
        customCode: data.customAlias || undefined,
        expiresAt: data.expiryDate
          ? new Date(data.expiryDate).toISOString()
          : null
      })

      setEditingUrl(null)

      await fetchUrls()

      showToast('Your URL has been updated successfully!', 'success')

    } catch (error) {
      console.error('URL update failed:', error)

      showToast(
        error.response?.data?.message || 'Failed to update URL.',
        'error'
      )
    }
  }

  return (
    <div className="app-layout">

      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main id="home" className="app-main">

        {(activePage === 'home' || activePage === 'features') && (
          <>
            {activePage === 'home' && (
              <>
                <URLForm
                  onSubmit={editingUrl ? handleUpdate : handleURLSubmit}
                  initialData={editingUrl}
                  isEditing={Boolean(editingUrl)}
                  onCancel={() => setEditingUrl(null)}
                />

                {urlData && (
                  <URLResult
                    shortUrl={urlData.shortUrl}
                    originalUrl={urlData.originalUrl}
                    expiryDate={urlData.expiryDate}
                  />
                )}
              </>
            )}

            <div id="features">
              <Analytics urls={urls} />
              <ClickChart urls={urls} />
            </div>
          </>
        )}

        {activePage === 'history' && (
          <URLHistory
            urls={urls}
            onDelete={handleDelete}
            onEdit={(url) => {
              handleEdit(url)
              setActivePage('home')

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              })
            }}
          />
        )}

      </main>

      {/* Professional Toast Notification */}
      {toast && (
        <div
          className={`toast-notification ${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon">
            {toast.type === 'success' ? '✓' : '✕'}
          </div>

          <div className="toast-message">
            <strong>
              {toast.type === 'success' ? 'Success!' : 'Error!'}
            </strong>

            <p>{toast.message}</p>
          </div>

          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}

      <Footer />

    </div>
  )
}

export default App
