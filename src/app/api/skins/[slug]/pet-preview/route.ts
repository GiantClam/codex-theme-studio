import { getCloudflareBindings, getPayloadClient } from '@/lib/server'
import { getPublicSkin } from '@/lib/skins/catalog'
import { parseThemePackage } from '@/lib/theme-package/zip'

export const dynamic = 'force-dynamic'

function isSkinSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  if (!isSkinSlug(slug)) return new Response('Not found', { status: 404 })

  const skin = await getPublicSkin(slug)
  if (!skin || !skin.hasPet || !skin.pet) return new Response('Not found', { status: 404 })

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'skins',
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const doc = result.docs[0]
    const packageValue = doc?.package
    const packageId = typeof packageValue === 'number' || typeof packageValue === 'string' ? packageValue : null
    const packageDoc = typeof packageValue === 'object' && packageValue
      ? packageValue
      : packageId
        ? await payload.findByID({ collection: 'theme-packages', id: packageId, overrideAccess: true })
        : null
    const objectKey = packageDoc && typeof packageDoc === 'object' && typeof packageDoc.r2ObjectKey === 'string' ? packageDoc.r2ObjectKey : null
    if (!objectKey) return new Response('Pet preview unavailable', { status: 503 })

    const env = await getCloudflareBindings()
    const object = await env.R2.get(objectKey)
    if (!object) return new Response('Pet preview unavailable', { status: 503 })

    const parsed = await parseThemePackage(new Uint8Array(await object.arrayBuffer()))
    const spritesheetPath = parsed.kind === 'paired' && parsed.petManifest ? `pet/${parsed.petManifest.spritesheetPath}` : null
    const spritesheet = spritesheetPath ? parsed.files.get(spritesheetPath) : null
    if (!spritesheet) return new Response('Pet preview unavailable', { status: 503 })

    const extension = parsed.petManifest?.spritesheetPath.endsWith('.png') ? 'png' : 'webp'
    const body = spritesheet.buffer.slice(spritesheet.byteOffset, spritesheet.byteOffset + spritesheet.byteLength) as ArrayBuffer
    return new Response(body, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Length': String(spritesheet.byteLength),
        'Content-Type': extension === 'png' ? 'image/png' : 'image/webp',
        ETag: `"${skin.packageSha256 ?? slug}-pet"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Pet preview unavailable', { status: 503 })
  }
}
