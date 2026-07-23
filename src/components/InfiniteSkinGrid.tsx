'use client'

import { useEffect, useRef, useState } from 'react'

import { SkinCard } from '@/components/SkinCard'
import type { SkinSummary } from '@/lib/skins/catalog'

const PAGE_SIZE = 30

type SkinPageResponse = {
  items?: SkinSummary[]
  total?: number
  hasMore?: boolean
}

export function InfiniteSkinGrid({ initialSkins, initialTotal }: { initialSkins: SkinSummary[]; initialTotal: number }) {
  const [skins, setSkins] = useState(initialSkins)
  const [hasMore, setHasMore] = useState(initialSkins.length < initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const skinsRef = useRef(initialSkins)
  const loadingRef = useRef(false)

  useEffect(() => {
    skinsRef.current = skins
  }, [skins])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore()
    }, { rootMargin: '640px 0px' })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  async function loadMore() {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setIsLoading(true)

    try {
      const lastReviewedSkin = [...skinsRef.current].reverse().find((skin) => skin.reviewedAt)
      const reviewedBefore = lastReviewedSkin?.reviewedAt
      if (!reviewedBefore) {
        setHasMore(false)
        return
      }
      const response = await fetch(`/api/skins?limit=${PAGE_SIZE}&reviewedBefore=${encodeURIComponent(reviewedBefore)}&sort=recent`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Skin request failed with ${response.status}`)
      const page = await response.json() as SkinPageResponse
      const nextItems = Array.isArray(page.items) ? page.items : []

      setSkins((current) => [...current, ...nextItems])
      skinsRef.current = [...skinsRef.current, ...nextItems]
      setHasMore(Boolean(page.hasMore) && nextItems.length > 0)
    } catch {
      // Keep the already-rendered themes usable if a later page temporarily fails.
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="masonry-grid theme-grid">
        {skins.map((skin) => <SkinCard key={skin.slug} skin={skin} />)}
      </div>
      {hasMore && <div className="skin-grid-loader" ref={sentinelRef} role="status" aria-live="polite">{isLoading ? 'Loading more themes…' : 'Scroll for more themes'}</div>}
    </>
  )
}
