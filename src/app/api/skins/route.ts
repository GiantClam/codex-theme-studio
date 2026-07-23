import { listPublicSkinsPage } from '@/lib/skins/catalog'

export const dynamic = 'force-dynamic'

const allowedTargets = new Set(['codex', 'chatgpt', 'both'])
const allowedSorts = new Set(['recent', 'downloads'])

function bounded(value: string | null, fallback: number, max: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback
}

function reviewCursor(value: string | null) {
  if (!value || value.length > 64) return undefined
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = url.searchParams.get('target') ?? undefined
  const sort = url.searchParams.get('sort') ?? undefined
  if (target && !allowedTargets.has(target)) return Response.json({ error: 'Unsupported target.' }, { status: 400 })
  if (sort && !allowedSorts.has(sort)) return Response.json({ error: 'Unsupported sort.' }, { status: 400 })

  const page = await listPublicSkinsPage({
    q: url.searchParams.get('q')?.slice(0, 120),
    target,
    category: url.searchParams.get('category') ?? undefined,
    palette: url.searchParams.get('palette') ?? undefined,
    sort,
    limit: bounded(url.searchParams.get('limit'), 30, 48),
    reviewedBefore: reviewCursor(url.searchParams.get('reviewedBefore')),
  })
  return Response.json({
    items: page.items.map((skin) => ({ ...skin, installable: Boolean(skin.packageSha256), downloadRequiresGrant: true })),
    count: page.items.length,
    total: page.total,
    hasMore: page.hasMore,
  }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } })
}
