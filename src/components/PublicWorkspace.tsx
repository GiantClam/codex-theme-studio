import Link from 'next/link'
import type { ReactNode } from 'react'

type PublicWorkspaceProps = {
  children: ReactNode
  current?: 'gallery' | 'index' | 'featured' | 'about' | 'github' | 'privacy' | 'studio'
}

export function PublicWorkspace({ children, current = 'gallery' }: PublicWorkspaceProps) {
  return (
    <main className="site-shell workbench-shell" data-theme="workbench">
      <aside className="rail">
        <Link className="mark" href="/" aria-label="Codex Theme Archive home">CS</Link>
        <div className="rail-rule" />
        <nav aria-label="Archive views">
          <Link className={`rail-link${current === 'gallery' ? ' is-active' : ''}`} href="/"><span>01</span><b>Browse</b></Link>
          <Link className={`rail-link${current === 'index' ? ' is-active' : ''}`} href="/skins"><span>02</span><b>Index</b></Link>
          <Link className={`rail-link${current === 'featured' ? ' is-active' : ''}`} href="/skins/midnight-arcana"><span>03</span><b>Featured</b></Link>
          <Link className={`rail-link${current === 'studio' ? ' is-active' : ''}`} href="/studio"><span>04</span><b>Studio</b></Link>
        </nav>
        <div className="rail-bottom"><span>THEME</span><span>v.01</span></div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <Link className="crumb" href="/"><span className="prompt-glyph">›</span> CODEX + CHATGPT / DESKTOP THEME ARCHIVE</Link>
          <div className="topbar-actions">
            <nav className="workbench-links" aria-label="Archive menu">
              <Link className={current === 'github' ? 'is-current' : ''} href="/github">Sources</Link>
              <Link className={current === 'about' ? 'is-current' : ''} href="/about">Rules</Link>
              <Link className={current === 'privacy' ? 'is-current' : ''} href="/privacy">Privacy</Link>
              <Link className={current === 'studio' ? 'is-current' : ''} href="/studio">Studio</Link>
            </nav>
            <span className="status-dot" /><span>PUBLIC LIBRARY</span>
          </div>
        </header>
        {children}
        <footer className="workbench-footer">
          <div className="workbench-footer__brand"><span className="workbench-footer__mark">CS</span><div><strong>CODEX THEME ARCHIVE</strong><small>BUILT FOR CODEX + CHATGPT DESKTOP</small></div></div>
          <nav className="workbench-footer__nav" aria-label="Footer menu"><Link href="/">Browse</Link><Link href="/skins">Index</Link><Link href="/studio">Theme Studio</Link><Link href="/github">GitHub sources</Link><Link href="/about">Archive rules</Link><Link href="/privacy">Privacy</Link></nav>
          <div className="workbench-footer__meta"><span>NO ACCOUNT REQUIRED</span><span>PACKAGES REVIEWED BEFORE PUBLISHING</span></div>
        </footer>
      </section>
    </main>
  )
}
