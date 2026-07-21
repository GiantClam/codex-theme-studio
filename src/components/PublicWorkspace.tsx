import Link from 'next/link'
import type { ReactNode } from 'react'

import { CODEX_THEME_STUDIO_SKILL_URL } from '@/lib/skill'

type PublicWorkspaceProps = {
  children: ReactNode
  current?: 'gallery' | 'index' | 'about' | 'privacy'
}

export function PublicWorkspace({ children, current = 'gallery' }: PublicWorkspaceProps) {
  return (
    <main className="site-shell workbench-shell" data-theme="workbench">
      <section className="workspace">
        <header className="topbar">
          <Link className="crumb" href="/"><span className="prompt-glyph">›</span> CODEX + CHATGPT / DESKTOP THEME ARCHIVE</Link>
          <div className="topbar-actions">
            <nav className="workbench-links" aria-label="Archive menu">
              <Link className={current === 'gallery' ? 'is-current' : ''} href="/">Browse</Link>
              <Link className={current === 'index' ? 'is-current' : ''} href="/search">Search</Link>
              <a href={CODEX_THEME_STUDIO_SKILL_URL} target="_blank" rel="noreferrer noopener">Install Skill ↗</a>
              <Link className={current === 'about' ? 'is-current' : ''} href="/about">Rules</Link>
              <Link className={current === 'privacy' ? 'is-current' : ''} href="/privacy">Privacy</Link>
            </nav>
            <span className="status-dot" /><span>PUBLIC LIBRARY</span>
          </div>
        </header>
        {children}
        <footer className="workbench-footer">
          <div className="workbench-footer__brand"><span className="workbench-footer__mark">CS</span><div><strong>CODEX THEME ARCHIVE</strong><small>BUILT FOR CODEX + CHATGPT DESKTOP</small></div></div>
          <nav className="workbench-footer__nav" aria-label="Footer menu"><Link href="/">Browse</Link><Link href="/search">Search</Link><a href={CODEX_THEME_STUDIO_SKILL_URL} target="_blank" rel="noreferrer noopener">Install Skill</a><Link href="/about">Archive rules</Link><Link href="/privacy">Privacy</Link></nav>
          <div className="workbench-footer__meta"><span>NO ACCOUNT REQUIRED</span><span>PACKAGES REVIEWED BEFORE PUBLISHING</span></div>
        </footer>
      </section>
    </main>
  )
}
