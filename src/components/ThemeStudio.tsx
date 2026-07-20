'use client'

import { useMemo, useRef, useState } from 'react'

import { parseThemePackage } from '@/lib/theme-package/zip'
import { createThemePackage, PROMETHEUS_BRIEF, PROMETHEUS_THEME, themeMetadata, type UploadCheck } from '@/lib/theme-studio/test-theme'

type StudioPhase = 'generated' | 'applied' | 'uploaded'

const themeCss = {
  '--studio-accent': PROMETHEUS_THEME.colors.accent,
  '--studio-secondary': PROMETHEUS_THEME.colors.secondary,
  '--studio-surface': PROMETHEUS_THEME.colors.surface,
  '--studio-text': PROMETHEUS_THEME.colors.text,
} as React.CSSProperties

function Step({ number, label, status, active, onClick }: { number: string; label: string; status: string; active: boolean; onClick?: () => void }) {
  return <button type="button" className={`studio-step${active ? ' is-active' : ''}${status === 'done' ? ' is-done' : ''}`} onClick={onClick}>
    <span className="studio-step__number">{number}</span>
    <span><strong>{label}</strong><small>{status}</small></span>
  </button>
}

function FireMark() {
  return <div className="fire-mark" aria-hidden="true"><span /><span /><span /></div>
}

function ThemePreview({ applied }: { applied: boolean }) {
  return <div className={`theme-preview${applied ? ' is-applied' : ''}`} style={themeCss}>
    <div className="theme-preview__chrome">
      <span className="theme-preview__brand"><FireMark /> PROMETHEUS / FIREBRINGER</span>
      <span className="theme-preview__signal"><i /> LIVE PREVIEW / 01</span>
    </div>
    <div className="theme-preview__body">
      <aside className="theme-preview__rail"><span>01</span><span className="is-active">02</span><span>03</span><b>CODEX</b></aside>
      <section className="theme-preview__thread">
        <div className="theme-preview__thread-head"><div><small>THREAD / THE FORGE</small><strong>Build the thing that outlasts you.</strong></div><span>●</span></div>
        <div className="theme-preview__message theme-preview__message--human"><span className="message-label">YOU / 09:41</span><p>Turn this rough idea into a small, useful tool.</p></div>
        <div className="theme-preview__message theme-preview__message--codex"><span className="message-label">CODEX / RESPONSE</span><p>First, we name the constraint. Then we carry the fire carefully.</p><div className="code-line"><em>const</em> intent = <mark>"make it useful"</mark></div></div>
        <div className="theme-preview__input"><span>›</span><span className="input-placeholder">Ask Codex anything…</span><span className="input-key">⌘ ↵</span></div>
      </section>
      <aside className="theme-preview__inspector"><small>THE FORGE / STATUS</small><div className="inspector-flame"><FireMark /><strong>FIRE<br />HELD</strong></div><dl><div><dt>MODE</dt><dd>DELIBERATE</dd></div><div><dt>HEAT</dt><dd>72%</dd></div><div><dt>TRACE</dt><dd>READY</dd></div></dl></aside>
    </div>
    <div className="theme-preview__footer"><span>STOLEN FROM THE GODS / PUT TO WORK BY HUMANS</span><span>THEME APPLIED: {applied ? 'YES' : 'NO'}</span></div>
  </div>
}

export function ThemeStudio() {
  const [brief, setBrief] = useState(PROMETHEUS_BRIEF)
  const [phase, setPhase] = useState<StudioPhase>('generated')
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingToServer, setUploadingToServer] = useState(false)
  const [uploadCheck, setUploadCheck] = useState<UploadCheck | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [message, setMessage] = useState('TEST THEME READY / EDIT THE BRIEF OR APPLY THE PREVIEW')
  const fileInput = useRef<HTMLInputElement>(null)
  const packageBytes = useMemo(() => createThemePackage(), [])

  async function generateTheme() {
    setGenerating(true)
    setMessage('GENERATING / READING THE BRIEF…')
    await new Promise((resolve) => window.setTimeout(resolve, 550))
    setPhase('generated')
    setUploadCheck(null)
    setUploadFile(null)
    setMessage('GENERATED / PROMETHEUS TEST THEME IS READY')
    setGenerating(false)
  }

  function applyTheme() {
    window.localStorage.setItem('codex-theme-studio:active-theme', PROMETHEUS_THEME.id)
    setPhase('applied')
    setMessage('APPLIED / LOCAL WORKSPACE PREVIEW IS NOW USING STOLEN FIRE')
  }

  function downloadPackage() {
    const blob = new Blob([packageBytes], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${PROMETHEUS_THEME.id}.zip`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('PACKAGE EXPORTED / READY TO RE-IMPORT OR SEND THROUGH THE SIGNED SKILL UPLOAD')
  }

  async function inspectPackage(file: File) {
    setUploading(true)
    setMessage(`CHECKING / ${file.name.toUpperCase()}`)
    try {
      const parsed = await parseThemePackage(new Uint8Array(await file.arrayBuffer()))
      if (!parsed.report.valid) throw new Error(parsed.report.errors.join(' / '))
      setUploadCheck({ report: parsed.report, name: file.name, bytes: file.size })
      setUploadFile(file)
      setMessage('VALIDATED / PACKAGE CAN ENTER THE LOCAL TEST REVIEW QUEUE')
    } catch (error) {
      setUploadCheck(null)
      setUploadFile(null)
      setMessage(`REJECTED / ${error instanceof Error ? error.message : 'PACKAGE COULD NOT BE READ'}`)
    } finally {
      setUploading(false)
    }
  }

  async function queueGeneratedPackage() {
    const file = new File([packageBytes], `${PROMETHEUS_THEME.id}.zip`, { type: 'application/zip' })
    await inspectPackage(file)
  }

  async function completeUpload() {
    if (!uploadCheck || !uploadFile) return
    setUploadingToServer(true)
    setMessage('UPLOADING / SENDING THE VALIDATED PACKAGE TO PRODUCTION…')
    try {
      const form = new FormData()
      form.append('package', uploadFile)
      form.append('metadata', JSON.stringify(themeMetadata(PROMETHEUS_THEME)))
      const response = await fetch('/api/studio/test-upload', { method: 'POST', headers: { 'x-codex-studio-test': PROMETHEUS_THEME.id }, body: form })
      const result = await response.json().catch(() => null) as { error?: string; packageId?: number; skinId?: number; status?: string } | null
      if (!response.ok || !result?.skinId) throw new Error(result?.error || 'The production upload failed.')
      const record = { ...uploadCheck, packageId: result.packageId, skinId: result.skinId, uploadedAt: new Date().toISOString(), status: result.status, metadata: themeMetadata(PROMETHEUS_THEME) }
      window.localStorage.setItem('codex-theme-studio:last-upload', JSON.stringify(record))
      setPhase('uploaded')
      setMessage(`UPLOADED / PRODUCTION REVIEW QUEUE · SKIN ${result.skinId} / PENDING_REVIEW`)
    } catch (error) {
      setMessage(`UPLOAD FAILED / ${error instanceof Error ? error.message : 'PRODUCTION REQUEST FAILED'}`)
    } finally {
      setUploadingToServer(false)
    }
  }

  return <section className="studio-screen workbench-screen is-visible" style={themeCss}>
    <div className="studio-head">
      <div><span className="kicker">THEME STUDIO / TEST BENCH</span><h1>Carry the<br /><em>fire forward.</em></h1><p>Generate a complete theme package, apply it to a working preview, then validate the ZIP before it enters review.</p></div>
      <div className="studio-head__artifact"><FireMark /><span>TEST SUBJECT</span><strong>普罗米修斯<br />盗取神火</strong><small>PROMETHEUS / STOLEN FIRE</small></div>
    </div>
    <div className="studio-steps" aria-label="Theme workflow">
      <Step number="01" label="Generate" status="done" active={phase === 'generated'} onClick={() => setMessage('GENERATE / THE TEST BRIEF IS READY')} />
      <span className="studio-steps__line" /><Step number="02" label="Apply" status={phase === 'applied' || phase === 'uploaded' ? 'done' : 'ready'} active={phase === 'applied'} onClick={applyTheme} />
      <span className="studio-steps__line" /><Step number="03" label="Upload" status={phase === 'uploaded' ? 'done' : uploadCheck ? 'validated' : 'ready'} active={phase === 'uploaded'} onClick={() => fileInput.current?.click()} />
    </div>
    <div className="studio-layout">
      <section className="studio-controls" aria-label="Theme controls">
        <div className="studio-panel studio-panel--brief"><div className="studio-panel__title"><span>01 / GENERATE</span><span className="panel-status">{phase === 'generated' ? 'READY' : 'COMPLETE'}</span></div><label htmlFor="theme-brief">Generation brief</label><textarea id="theme-brief" value={brief} onChange={(event) => setBrief(event.target.value)} /><div className="studio-panel__footer"><span>{brief.length} / 240</span><button className="studio-button studio-button--accent" type="button" onClick={generateTheme} disabled={generating}>{generating ? 'Generating…' : 'Generate theme ↗'}</button></div></div>
        <div className="studio-panel"><div className="studio-panel__title"><span>02 / APPLY</span><span className={`panel-status${phase === 'applied' || phase === 'uploaded' ? ' is-ok' : ''}`}>{phase === 'applied' || phase === 'uploaded' ? 'APPLIED' : 'PREVIEW'}</span></div><div className="manifest-name"><span className="manifest-name__symbol">#</span><div><strong>{PROMETHEUS_THEME.name}</strong><small>{PROMETHEUS_THEME.id} · v1.0.0</small></div></div><div className="swatch-row">{Object.values(PROMETHEUS_THEME.colors).map((color) => <span key={color} style={{ background: color }} title={color} />)}</div><div className="studio-panel__footer"><span>CODEX + CHATGPT</span><button className="studio-button studio-button--outline" type="button" onClick={applyTheme}>{phase === 'applied' || phase === 'uploaded' ? 'Applied ✓' : 'Apply to preview'}</button></div></div>
        <div className="studio-panel studio-panel--upload"><div className="studio-panel__title"><span>03 / UPLOAD</span><span className={`panel-status${uploadCheck ? ' is-ok' : ''}`}>{uploadCheck ? 'VALID' : 'ZIP REQUIRED'}</span></div><p className="studio-panel__copy">Validate a generated or local ZIP against the archive contract, then send the fixed Prometheus fixture to the production review queue.</p><input ref={fileInput} className="studio-file-input" type="file" accept=".zip,application/zip" onChange={(event) => { const file = event.target.files?.[0]; if (file) void inspectPackage(file) }} /><div className="upload-actions"><button className="studio-button studio-button--outline" type="button" onClick={() => void queueGeneratedPackage()} disabled={uploading || uploadingToServer}>{uploading ? 'Checking…' : 'Validate generated ZIP'}</button><button className="studio-button studio-button--ghost" type="button" onClick={() => fileInput.current?.click()}>Choose ZIP</button></div>{uploadCheck && <div className="upload-report"><strong>✓ {uploadCheck.name}</strong><span>{uploadCheck.bytes.toLocaleString()} bytes · {uploadCheck.report.entryCount} entries · {uploadCheck.report.validatorVersion}</span><button className="studio-button studio-button--accent studio-button--full" type="button" onClick={() => void completeUpload()} disabled={phase === 'uploaded' || uploadingToServer}>{uploadingToServer ? 'Uploading…' : phase === 'uploaded' ? 'Sent to review ✓' : 'Upload to production review ↗'}</button></div>}</div>
        <div className="studio-status" role="status"><i />{message}</div>
      </section>
      <section className="studio-preview-wrap"><div className="studio-preview-label"><span>LIVE CANVAS / DESKTOP PREVIEW</span><span>{phase === 'applied' || phase === 'uploaded' ? 'THEME APPLIED' : 'BASE WORKSPACE'}</span></div><ThemePreview applied={phase === 'applied' || phase === 'uploaded'} /><div className="studio-preview-note"><span>THEME.JSON</span><code>{PROMETHEUS_THEME.colors.surface} / {PROMETHEUS_THEME.colors.accent} / {PROMETHEUS_THEME.colors.secondary}</code><button className="studio-button studio-button--text" type="button" onClick={downloadPackage}>Download package ↓</button></div></section>
    </div>
  </section>
}
