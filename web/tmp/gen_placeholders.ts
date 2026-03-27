
import fs from 'fs'
import path from 'path'

const pages = [
  'about/history',
  'about/vision',
  'about/leadership',
  'about/accreditations',
  'academics/departments',
  'academics/calendar',
  'academics/exams',
  'services/scholarships',
  'services/library',
  'campus/infrastructure',
  'campus/hostel',
  'support/help',
  'support/faq',
  'support/feedback'
]

const baseDir = 'd:/n1/p1/abc/web/src/app'

pages.forEach(p => {
  const dir = path.join(baseDir, p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  
  const title = p.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Coming Soon'
  
  const content = `
import PlaceholderPage from '@/components/public/PlaceholderPage'

export default function Page() {
  return <PlaceholderPage title="${title}" />
}
`
  fs.writeFileSync(path.join(dir, 'page.tsx'), content)
  console.log(`Created page: ${p}`)
})
