import { enforceRateLimit, getCloudflareBindings } from '@/lib/server'
import { saveThemeSubmission } from '@/lib/theme-package/ingest'
import { parseThemePackage } from '@/lib/theme-package/zip'
import type { ThemeCategory, ThemePalette, ThemeTarget } from '@/lib/theme-package/types'

export const dynamic = 'force-dynamic'

const TEST_THEME_ID = 'prometheus-stolen-fire'
const allowedTargets = new Set(['codex', 'chatgpt'])
const allowedCategories = new Set(['anime-2d', 'cyber-ui', 'editorial', 'minimal', 'cozy', 'mystic'])
const allowedPalettes = new Set(['blue', 'cyan', 'green', 'orange', 'paper', 'mixed'])

function metadataList(value: unknown, allowed: Set<string>) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter((item) => allowed.has(item)).filter((item, index, values) => values.indexOf(item) === index)
    : []
}

export async function POST(request: Request) {
  const env = await getCloudflareBindings() as CloudflareEnv & { STUDIO_TEST_UPLOAD_ENABLED?: string }
  if (env.STUDIO_TEST_UPLOAD_ENABLED !== 'true') return Response.json({ error: 'Studio test upload is disabled.' }, { status: 404 })
  if (request.headers.get('x-codex-studio-test') !== TEST_THEME_ID) return Response.json({ error: 'This endpoint only accepts the Prometheus test fixture.' }, { status: 403 })
  const limited = await enforceRateLimit(env, 'SUBMIT_RATE_LIMITER', request, 'studio-test-upload')
  if (limited) return limited

  const form = await request.formData()
  const upload = form.get('package')
  if (!(upload instanceof File) || upload.size === 0) return Response.json({ error: 'A theme ZIP package is required.' }, { status: 400 })

  let metadataInput: Record<string, unknown> = {}
  const metadataRaw = form.get('metadata')
  if (typeof metadataRaw === 'string' && metadataRaw.trim()) {
    try {
      const parsed = JSON.parse(metadataRaw) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('metadata must be an object')
      metadataInput = parsed as Record<string, unknown>
    } catch {
      return Response.json({ error: 'Theme metadata is invalid JSON.' }, { status: 400 })
    }
  }

  try {
    const bytes = new Uint8Array(await upload.arrayBuffer())
    const parsed = await parseThemePackage(bytes)
    if (!parsed.report.valid || !parsed.manifest) return Response.json({ error: 'The package failed validation.', report: parsed.report }, { status: 422 })
    if (parsed.kind !== 'theme' || parsed.manifest.id !== TEST_THEME_ID) return Response.json({ error: 'Only the Prometheus test theme can use this endpoint.' }, { status: 422 })

    const title = typeof metadataInput.title === 'string' && metadataInput.title.trim() ? metadataInput.title.trim() : parsed.manifest.name
    const summary = typeof metadataInput.summary === 'string' && metadataInput.summary.trim() ? metadataInput.summary.trim() : parsed.manifest.copy?.tagline ?? 'Prometheus test theme.'
    const targets = metadataList(metadataInput.targets, allowedTargets) as ThemeTarget[]
    const categories = metadataList(metadataInput.categories, allowedCategories) as ThemeCategory[]
    const palette = metadataList(metadataInput.palette, allowedPalettes) as ThemePalette[]
    const result = await saveThemeSubmission(parsed, {
      title,
      slug: TEST_THEME_ID,
      summary,
      version: typeof metadataInput.version === 'string' ? metadataInput.version.trim() || '1.0.0' : '1.0.0',
      targets: targets.length > 0 ? targets : ['codex', 'chatgpt'],
      categories: categories.length > 0 ? categories : ['editorial', 'mystic'],
      palette: palette.length > 0 ? palette : ['orange', 'mixed'],
      authorDisplayName: typeof metadataInput.authorDisplayName === 'string' && metadataInput.authorDisplayName.trim() ? metadataInput.authorDisplayName.trim() : 'Theme Studio test bench',
      sourceType: 'manual',
      license: typeof metadataInput.license === 'string' ? metadataInput.license.trim() || undefined : undefined,
    }, upload.name || `${TEST_THEME_ID}.zip`)
    return Response.json({ ok: true, status: 'pending_review', packageId: result.packageDoc.id, skinId: result.skin.id, slug: TEST_THEME_ID, report: parsed.report }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The test package could not be saved.'
    const status = /already been submitted|already exists/i.test(message) ? 409 : 422
    return Response.json({ error: message }, { status })
  }
}
