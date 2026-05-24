// lib/aiHelpers.ts
// Утиліти для підготовки даних зі store перед відправкою до AI API.
 
import type { Post, User, Booking } from '@/types'
 
export type { Post, User }
 
// Application = Booking у вашому проєкті
export type Application = Booking
 
// ─── Агрегація статистики для прогнозу ──────────────────────────────────
 
export function buildForecastStats(posts: Post[], bookings: Booking[]) {
  const openEvents = posts.filter(
    p => p.type === 'ПОДІЯ' && p.status !== 'closed'
  )
 
  // Міста де бракує волонтерів (є відкриті місця)
  const citiesWithShortage = openEvents
    .filter(p => {
      const spotsLeft =
        p.maxParticipants !== undefined && p.currentParticipants !== undefined
          ? p.maxParticipants - p.currentParticipants
          : undefined
      return spotsLeft === undefined || spotsLeft > 0
    })
    .map(p => {
      const parts = p.location.split(',')
      const city = parts[0]?.trim() ?? p.location
      const district = parts[1]?.trim()
      const spotsLeft =
        p.maxParticipants !== undefined && p.currentParticipants !== undefined
          ? p.maxParticipants - p.currentParticipants
          : 5 // дефолт якщо не вказано
      return { city, district, openSpots: spotsLeft }
    })
    .sort((a, b) => b.openSpots - a.openSpots)
    .slice(0, 10)
 
  // Активність за останні 14 днів
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
 
  const recentBookings = bookings.filter(
    b => new Date(b.createdAt) >= twoWeeksAgo
  )
 
  const byDay: Record<string, number> = {}
  recentBookings.forEach(b => {
    const day = b.createdAt.split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + 1
  })
 
  const recentActivityByDay = Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
 
  // Топ теги
  const tagCount: Record<string, number> = {}
  openEvents.forEach(p => {
    p.tags.forEach(t => {
      tagCount[t] = (tagCount[t] ?? 0) + 1
    })
  })
 
  const topCategories = Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
 
  return {
    totalPosts: posts.length,
    totalApplications: bookings.length,
    openEvents: openEvents.length,
    citiesWithShortage,
    recentActivityByDay,
    topCategories,
  }
}
 
// ─── Підготовка профілю волонтера ────────────────────────────────────────
 
export function buildVolunteerProfile(
  user: User,
  bookings: Booking[],
  posts: Post[]
) {
  const acceptedPostIds = bookings
    .filter(b => b.userId === user.id && b.status === 'accepted')
    .map(b => b.postId)
 
  const skillsFromHistory = Array.from(
    new Set(
      posts
        .filter(p => acceptedPostIds.includes(p.id))
        .flatMap(p => p.tags)
    )
  )
 
  const city = user.location.split(',')[0]?.trim() ?? user.location
 
  return {
    id: user.id,
    name: user.name,
    city,
    role: user.role,
    bio: user.bio,
    skills: skillsFromHistory,
    applicationHistory: acceptedPostIds,
  }
}
 
// ─── Підготовка постів для AI (маппінг полів) ────────────────────────────
 
export function mapPostsForAI(posts: Post[]) {
  return posts.map(p => {
    const city = p.location.split(',')[0]?.trim() ?? p.location
    const district = p.location.split(',')[1]?.trim()
    const spotsLeft =
      p.maxParticipants !== undefined && p.currentParticipants !== undefined
        ? p.maxParticipants - p.currentParticipants
        : undefined
 
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      type: 'event' as const,
      city,
      district,
      tags: p.tags,
      date: p.date,
      status: p.status === 'closed' ? ('closed' as const) : ('open' as const),
      spotsLeft,
      applicants: p.bookings?.map(b => b.userId),
      createdAt: p.createdAt,
    }
  })
}
 
// ─── Клієнтські функції виклику API ─────────────────────────────────────
 
export async function fetchAIRecommendations(
  volunteer: ReturnType<typeof buildVolunteerProfile>,
  posts: Post[]
) {
  const mappedPosts = mapPostsForAI(
    posts.filter(p => p.type === 'ПОДІЯ' && p.status !== 'closed')
  )
  const res = await fetch('/api/ai/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volunteer, availablePosts: mappedPosts }),
  })
  if (!res.ok) throw new Error('Не вдалося отримати рекомендації')
  return res.json()
}
 
// export async function fetchAIForecast(posts: Post[], bookings: Booking[]) {
//   const stats = buildForecastStats(posts, bookings)
//   const res = await fetch('/api/ai/forecast', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(stats),
//   })
//   if (!res.ok) throw new Error('Не вдалося отримати прогноз')
//   return res.json()
// }
export async function fetchAIForecast(posts: Post[], bookings: Booking[]) {
  const stats = buildForecastStats(posts, bookings)
  
  console.log('Forecast stats being sent:', JSON.stringify(stats, null, 2)) // ← тимчасово
  
  const res = await fetch('/api/ai/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  })
  
  if (!res.ok) {
    const errText = await res.text()
    console.error('Forecast API error:', res.status, errText) // ← тимчасово
    throw new Error(`Forecast failed: ${res.status} ${errText}`)
  }
  
  return res.json()
}
 
export async function sendAIChatMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  volunteerCity?: string,
  volunteerRole?: 'volunteer' | 'organizer',
  posts?: Post[],
  bookings?: Booking[]
) {
  const platformData = posts ? buildPlatformSnapshot(posts, bookings ?? []) : undefined

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, volunteerCity, volunteerRole, platformData }),
  })
  if (!res.ok) throw new Error('Не вдалося отримати відповідь')
  return res.json() as Promise<{ reply: string }>
}

export function buildPlatformSnapshot(posts: Post[], bookings: Booking[]) {
  const openEvents = posts.filter(p => p.type === 'ПОДІЯ' && p.status !== 'closed')
  const urgentPosts = posts.filter(p => p.status === 'urgent')
  const fundraisers = posts.filter(p => p.type === 'ЗБІР' && p.status !== 'closed')

  const shortageByCity = openEvents
    .map(p => {
      const city = p.location.split(',')[0]?.trim() ?? p.location
      const spotsLeft =
        p.maxParticipants !== undefined && p.currentParticipants !== undefined
          ? p.maxParticipants - p.currentParticipants
          : null
      return { city, title: p.title, spotsLeft, urgent: p.status === 'urgent' }
    })
    .filter(e => e.spotsLeft === null || e.spotsLeft > 0)
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return (a.spotsLeft ?? 99) - (b.spotsLeft ?? 99)
    })

  return {
    totalPosts: posts.length,
    openEventsCount: openEvents.length,
    urgentCount: urgentPosts.length,
    fundraisersCount: fundraisers.length,
    totalBookings: bookings.length,
    urgentEvents: urgentPosts.slice(0, 6).map(p => ({
      title: p.title,
      city: p.location.split(',')[0]?.trim(),
      spotsLeft:
        p.maxParticipants !== undefined && p.currentParticipants !== undefined
          ? p.maxParticipants - p.currentParticipants : null,
      tags: p.tags.slice(0, 4),
      date: p.date,
    })),
    criticalShortage: shortageByCity.slice(0, 8),
    openEvents: openEvents.slice(0, 12).map(p => ({
      title: p.title,
      city: p.location.split(',')[0]?.trim(),
      date: p.date,
      spotsLeft:
        p.maxParticipants !== undefined && p.currentParticipants !== undefined
          ? p.maxParticipants - p.currentParticipants : null,
      tags: p.tags.slice(0, 3),
    })),
    activeFundraisers: fundraisers.slice(0, 5).map(p => ({
      title: p.title,
      city: p.location.split(',')[0]?.trim(),
      target: p.targetAmount,
      collected: p.currentAmount ?? 0,
      percent: p.targetAmount
        ? Math.round(((p.currentAmount ?? 0) / p.targetAmount) * 100) : null,
    })),
    cities: [...new Set(posts.map(p => p.location.split(',')[0]?.trim()))].slice(0, 10),
  }
}