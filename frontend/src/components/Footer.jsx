import { Code2, Globe, ExternalLink } from 'lucide-react'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2>Shortly<span>.</span></h2>

        <p>
          Designed & Developed by &nbsp; 
          <strong>SYAMBABU AKUMARTHI || SIDDU</strong>
        </p>

        <div className="footer-links">
          <a
            href="https://www.linkedin.com/in/syam-siddu"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={18} />
            LinkedIn
          </a>

          <a
            href="https://github.com/syam-00"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 size={18} />
            GitHub
          </a>

          <a
            href="https://syam-portfolioo.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            <Globe size={18} />
            Portfolio
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} SYAMBABU AKUMARTHI
        All rights reserved.
      </div>
    </footer>
  )
}

export default Footer