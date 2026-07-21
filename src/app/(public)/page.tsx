import Link from 'next/link'

import { PublicWorkspace } from '@/components/PublicWorkspace'
import { SkinCard } from '@/components/SkinCard'
import { listPublicSkins } from '@/lib/skins/catalog'
import { CODEX_THEME_STUDIO_SKILL_URL } from '@/lib/skill'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const skins = await listPublicSkins({ limit: 5 })
  return (
    <PublicWorkspace current="gallery">
      <section className="screen workbench-screen screen-gallery is-visible">
        <div className="gallery-intro">
          <div className="kicker">CODEX + CHATGPT DESKTOP / THEME LIBRARY</div>
          <h1>Make the<br /><em>thinking space</em> yours.</h1>
          <p className="intro-copy">Curated visual themes for coding sessions, prompt work and long desktop threads. Download a complete ZIP package, then use the official Skill to validate and apply it locally. <a className="skill-prompt" href={CODEX_THEME_STUDIO_SKILL_URL} target="_blank" rel="noreferrer noopener">Install the Skill ↗</a></p>
          <div className="intro-meta"><span>CODEX DESKTOP</span><span>CHATGPT DESKTOP</span><span>ZIP / THEME.JSON</span></div>
          <div className="stamp">WORKSPACE<br />READY</div>
        </div>
        <div className="section-heading"><div><span className="section-index">01</span><h2>Fresh workbench themes</h2></div><Link className="text-action" href="/search">View all themes <span>↗</span></Link></div>
        <div className="masonry-grid theme-grid">{skins.map((skin) => <SkinCard key={skin.slug} skin={skin} />)}</div>
      </section>
    </PublicWorkspace>
  )
}
