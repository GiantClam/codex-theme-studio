import { createStoredZip } from '@/lib/theme-package/zip'
import type { ThemeManifest, ThemeValidationReport } from '@/lib/theme-package/types'

export const PROMETHEUS_THEME: ThemeManifest = {
  schemaVersion: 1,
  id: 'prometheus-stolen-fire',
  name: 'Prometheus / Stolen Fire',
  hero: 'hero.webp',
  copy: {
    brand: 'PROMETHEUS FIREBRINGER',
    headline: 'Steal the fire. Shape the future.',
    tagline: 'A warm command deck for deliberate, human-led work.',
    brandStyle: { preset: 'mystic' },
  },
  colors: {
    accent: '#F36B2B',
    secondary: '#FFB84D',
    surface: '#191A1E',
    text: '#FFF3DF',
  },
}

export const PROMETHEUS_BRIEF = '普罗米修斯盗取神火主题：黑曜石工作台、神火橙色高亮、古典铭文与克制的命令行细节。'

function createPreviewWebp() {
  // A tiny real WebP keeps the generated test ZIP usable outside the preview.
  const encoded = 'UklGRiIAAABXRUJQVlA4IBAAAADQAgCdASoBAAEADsADAA=='
  const binary = atob(encoded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function createThemePackage(manifest: ThemeManifest = PROMETHEUS_THEME) {
  const files = {
    'theme.json': new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
    'hero.webp': createPreviewWebp(),
  }
  return createStoredZip(files)
}

export function themeMetadata(manifest: ThemeManifest) {
  return {
    title: manifest.name,
    slug: manifest.id,
    summary: manifest.copy?.tagline ?? '',
    version: '1.0.0',
    targets: ['codex', 'chatgpt'],
    categories: ['editorial', 'mystic'],
    palette: ['orange', 'mixed'],
    authorDisplayName: 'Theme Studio test bench',
    license: 'CC BY 4.0',
  }
}

export type UploadCheck = {
  report: ThemeValidationReport
  name: string
  bytes: number
}
