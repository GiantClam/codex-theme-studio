export type SkinTarget = 'codex' | 'chatgpt'
export type SkinCategory = 'anime-2d' | 'cyber-ui' | 'editorial' | 'minimal' | 'cozy' | 'mystic'
export type SkinPalette = 'blue' | 'cyan' | 'green' | 'orange' | 'paper' | 'mixed'
export type SkinPackageKind = 'theme' | 'paired'

export interface SkinPetSummary {
  id: string
  displayName: string
  contractVersion: string
}

export interface SkinSummary {
  slug: string
  title: string
  summary: string
  version: string
  targets: SkinTarget[]
  categories: SkinCategory[]
  palette: SkinPalette[]
  downloads: number
  reviewedAt: string
  publishedAt: string
  authorDisplayName: string
  art: 'arcana' | 'oxide' | 'green' | 'miku' | 'paper'
  status: 'published'
  packageKind: SkinPackageKind
  hasPet: boolean
  pet: SkinPetSummary | null
  petPreviewUrl?: string | null
  heroUrl?: string | null
  sourceType?: 'manual' | 'github' | null
  sourceUrl?: string | null
  license?: string | null
  packageSha256?: string | null
}

export interface SkinPage {
  items: SkinSummary[]
  total: number
  hasMore: boolean
}

type SkinListInput = { q?: string; target?: string; category?: string; palette?: string; sort?: string; limit?: number; reviewedBefore?: string }

const publishedSkins: SkinSummary[] = [
  { slug: 'midnight-arcana', title: 'Midnight Arcana', summary: 'A low-light theme for long coding sessions, deep prompt work and desktop threads.', version: '1.2.0', targets: ['codex', 'chatgpt'], categories: ['cyber-ui', 'mystic'], palette: ['blue', 'cyan'], downloads: 1284, reviewedAt: '2026-07-18T00:00:00.000Z', publishedAt: '2026-07-18', authorDisplayName: 'Studio 17', art: 'arcana', status: 'published', packageKind: 'theme', hasPet: false, pet: null },
  { slug: 'oxide-field', title: 'Oxide Field', summary: 'Warm orange controls and a precise command-center rhythm for daily builds.', version: '2.0.1', targets: ['codex', 'chatgpt'], categories: ['cyber-ui', 'minimal'], palette: ['orange', 'paper'], downloads: 946, reviewedAt: '2026-07-17T00:00:00.000Z', publishedAt: '2026-07-17', authorDisplayName: 'Nori Lab', art: 'oxide', status: 'published', packageKind: 'theme', hasPet: false, pet: null },
  { slug: 'green-room', title: 'Green Room', summary: 'A calm green workspace for planning, writing and focused agent runs.', version: '0.9.4', targets: ['chatgpt'], categories: ['cozy', 'minimal'], palette: ['green'], downloads: 714, reviewedAt: '2026-07-16T00:00:00.000Z', publishedAt: '2026-07-16', authorDisplayName: 'Morrow', art: 'green', status: 'published', packageKind: 'theme', hasPet: false, pet: null },
  { slug: 'miku-signal', title: 'Miku Signal', summary: 'A bright 2D signal theme with cyan panels, playful labels and stage-light accents.', version: '1.0.3', targets: ['codex', 'chatgpt'], categories: ['anime-2d', 'cyber-ui'], palette: ['cyan', 'mixed'], downloads: 532, reviewedAt: '2026-07-15T00:00:00.000Z', publishedAt: '2026-07-15', authorDisplayName: 'Signal Works', art: 'miku', status: 'published', packageKind: 'theme', hasPet: false, pet: null },
  { slug: 'paper-protocol', title: 'Paper Protocol', summary: 'A white-first interface with blue ink details for a quieter desktop.', version: '1.4.2', targets: ['codex'], categories: ['editorial', 'minimal'], palette: ['paper', 'blue'], downloads: 401, reviewedAt: '2026-07-13T00:00:00.000Z', publishedAt: '2026-07-13', authorDisplayName: 'Plain Sight', art: 'paper', status: 'published', packageKind: 'theme', hasPet: false, pet: null },
]

function paginateSkins(skins: SkinSummary[], input: SkinListInput = {}): SkinPage {
  const limit = Math.min(Math.max(input.limit ?? 24, 1), 48)
  const eligible = input.reviewedBefore ? skins.filter((skin) => skin.reviewedAt < input.reviewedBefore!) : skins
  const items = eligible.slice(0, limit)
  return { items, total: skins.length, hasMore: items.length < eligible.length }
}

function filterSkinList(skins: SkinSummary[], input: SkinListInput = {}) {
  const query = input.q?.trim().toLowerCase()
  const result = skins.filter((skin) => {
    if (query && ![skin.title, skin.summary, skin.authorDisplayName, ...skin.categories].join(' ').toLowerCase().includes(query)) return false
    if (input.target === 'both' && !(skin.targets.includes('codex') && skin.targets.includes('chatgpt'))) return false
    if (input.target && input.target !== 'both' && !skin.targets.includes(input.target as SkinTarget)) return false
    if (input.category && !skin.categories.includes(input.category as SkinCategory)) return false
    if (input.palette && !skin.palette.includes(input.palette as SkinPalette)) return false
    return true
  })

  if (input.sort === 'downloads') result.sort((a, b) => b.downloads - a.downloads)
  else result.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))
  return result
}

export function listPublishedSkins(input: SkinListInput = {}) {
  return paginateSkins(filterSkinList(publishedSkins, input), input).items
}

export function getPublishedSkin(slug: string) {
  return publishedSkins.find((skin) => skin.status === 'published' && skin.slug === slug) ?? null
}

type PayloadSkinLike = {
  slug?: string
  title?: string
  summary?: string
  version?: string
  targets?: string[]
  categories?: string[] | null
  palette?: string[] | null
  downloads?: number | null
  reviewedAt?: string | null
  publishedAt?: string | null
  authorDisplayName?: string | null
  art?: string | null
  status?: string
  packageKind?: 'theme' | 'paired' | null
  petId?: string | null
  petDisplayName?: string | null
  petContractVersion?: string | null
  hero?: { url?: string | null } | number | null
  sourceType?: 'manual' | 'github' | null
  sourceUrl?: string | null
  license?: string | null
  package?: { sha256?: string | null } | number | null
}

const artValues = new Set<SkinSummary['art']>(['arcana', 'oxide', 'green', 'miku', 'paper'])

export function mapPayloadSkin(doc: PayloadSkinLike): SkinSummary | null {
  if (!doc.slug || !doc.title || !doc.summary || !doc.version) return null
  const targets = (doc.targets ?? []).filter((target): target is SkinTarget => target === 'codex' || target === 'chatgpt')
  if (targets.length === 0) return null
  const categories = (doc.categories ?? []).filter((category): category is SkinCategory => ['anime-2d', 'cyber-ui', 'editorial', 'minimal', 'cozy', 'mystic'].includes(category))
  const palette = (doc.palette ?? []).filter((color): color is SkinPalette => ['blue', 'cyan', 'green', 'orange', 'paper', 'mixed'].includes(color))
  const art = artValues.has(doc.art as SkinSummary['art']) ? doc.art as SkinSummary['art'] : 'paper'
  const heroUrl = typeof doc.hero === 'object' && doc.hero ? doc.hero.url ?? null : null
  const packageSha256 = typeof doc.package === 'object' && doc.package ? doc.package.sha256 ?? null : null
  const packageKind = doc.packageKind === 'paired' ? 'paired' : 'theme'
  const pet = packageKind === 'paired' && doc.petId && doc.petDisplayName && doc.petContractVersion ? {
    id: doc.petId,
    displayName: doc.petDisplayName,
    contractVersion: doc.petContractVersion,
  } : null
  const petPreviewUrl = packageKind === 'paired' && pet ? `/api/skins/${encodeURIComponent(doc.slug)}/pet-preview` : null
  return {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    version: doc.version,
    targets,
    categories,
    palette,
    downloads: doc.downloads ?? 0,
    reviewedAt: doc.reviewedAt ?? doc.publishedAt ?? '',
    publishedAt: doc.publishedAt ?? '',
    authorDisplayName: doc.authorDisplayName ?? 'Community contributor',
    art,
    status: 'published',
    packageKind,
    hasPet: Boolean(pet),
    pet,
    petPreviewUrl,
    heroUrl,
    sourceType: doc.sourceType,
    sourceUrl: doc.sourceUrl,
    license: doc.license,
    packageSha256,
  }
}

export async function listPublicSkinsPage(input: SkinListInput = {}): Promise<SkinPage> {
  try {
    const { getPayloadClient } = await import('@/lib/server')
    const payload = await getPayloadClient()
    const recentOnly = !input.q && !input.target && !input.category && !input.palette && (!input.sort || input.sort === 'recent')
    const limit = Math.min(Math.max(input.limit ?? 24, 1), 48)
    if (recentOnly) {
      const result = await payload.find({
        collection: 'skins',
        where: {
          and: [
            { status: { equals: 'published' } },
            ...(input.reviewedBefore ? [{ reviewedAt: { less_than: input.reviewedBefore } }] : []),
          ],
        },
        depth: 2,
        limit,
        page: 1,
        sort: '-reviewedAt',
        overrideAccess: true,
      })
      const docs = result.docs.map((doc) => mapPayloadSkin(doc as PayloadSkinLike)).filter((doc): doc is SkinSummary => Boolean(doc))
      return { items: docs, total: result.totalDocs ?? docs.length, hasMore: Boolean(result.hasNextPage) }
    }
    const result = await payload.find({
      collection: 'skins',
      where: { status: { equals: 'published' } },
      depth: 2,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    })
    const docs = result.docs.map((doc) => mapPayloadSkin(doc as PayloadSkinLike)).filter((doc): doc is SkinSummary => Boolean(doc))
    if (docs.length > 0) return paginateSkins(filterSkinList(docs, input), input)
  } catch {
    // The fixture catalog keeps the local preview usable before the first D1 seed.
  }
  return paginateSkins(filterSkinList(publishedSkins, input), input)
}

export async function listPublicSkins(input: SkinListInput = {}) {
  return (await listPublicSkinsPage(input)).items
}

export async function getPublicSkin(slug: string) {
  const skins = await listPublicSkins({ limit: 48 })
  // Keep bundled themes addressable while a remote catalog is partially seeded.
  return skins.find((skin) => skin.slug === slug) ?? getPublishedSkin(slug)
}
