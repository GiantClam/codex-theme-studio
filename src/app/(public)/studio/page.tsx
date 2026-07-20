import { PublicWorkspace } from '@/components/PublicWorkspace'
import { ThemeStudio } from '@/components/ThemeStudio'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <PublicWorkspace current="studio"><ThemeStudio /></PublicWorkspace>
}
