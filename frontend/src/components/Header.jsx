
function Header({ activePage, onNavigate }) {
  return (
    <header className="header">

      <div className="logo">
        <img
          src="/shortly-logo-transparent.png"
          alt="Shortly Logo"
          className="logo-image"
        />

        <h2>Shortly</h2>
      </div>

      <nav>
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>

        <button
          className={activePage === 'features' ? 'active' : ''}
          onClick={() => onNavigate('features', 'features')}
        >
          Features
        </button>

        <button
          className={activePage === 'history' ? 'active' : ''}
          onClick={() => onNavigate('history')}
        >
          History
        </button>
      </nav>

    </header>
  )
}

export default Header
