// app/api/ai/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server'
 
interface VolunteerProfile {
  id: string
  name: string
  city: string
  role: 'volunteer' | 'organizer'
  bio?: string
  skills?: string[]
  applicationHistory?: string[]
}
 
interface Post {
  id: string
  title: string
  description: string
  type: 'event' | 'fundraiser' | 'news'
  city: string
  district?: string
  tags: string[]
  date?: string
  status: 'open' | 'closed'
  spotsLeft?: number
  applicants?: string[]
}
 
interface FilterMeta {
  radiusKm: number
  volunteerCity: string
  volunteerCoordsFound: boolean
  totalEvents: number
  nearbyEvents: number
  usingFallback: boolean
}
 
interface RecommendRequest {
  volunteer: VolunteerProfile
  availablePosts: Post[]
  filterMeta?: FilterMeta
}
 
function buildSystemPrompt(meta?: FilterMeta): string {
  const radiusNote = meta
    ? meta.usingFallback
      ? `Увага: не вдалося знайти координати міста "${meta.volunteerCity}", тому показані всі ${meta.totalEvents} відкритих подій. Пріоритизуй події в місті волонтера.`
      : `Події вже відфільтровані географічно: показано ${meta.nearbyEvents} з ${meta.totalEvents} подій у радіусі ${meta.radiusKm} км від ${meta.volunteerCity}. Всі вони географічно доступні волонтеру.`
    : ''
 
  return `Ти — AI-асистент волонтерської платформи "Дій" (Україна).
Твоє завдання — аналізувати профіль волонтера та доступні заявки, і повертати
персоналізовані рекомендації у форматі JSON.
 
${radiusNote}
 
Правила:
- Всі передані події вже є географічно близькими — не фільтруй за містом додатково
- Враховуй навички та попередню активність волонтера
- Пріоритет — події де критично бракує людей (urgency)
- score від 0 до 100 (відповідність профілю + терміновість)
- reason — 1 речення чому рекомендовано, по-українськи, конкретно
- urgency: "critical" якщо spotsLeft <= 2, "high" якщо <= 5, інакше "normal"
- missingVolunteers — скільки ще потрібно людей (spotsLeft або розумна оцінка)
 
Відповідай ТІЛЬКИ валідним JSON без зайвого тексту:
{
  "recommendations": [
    {
      "postId": "string",
      "score": number,
      "reason": "string",
      "urgency": "critical" | "high" | "normal",
      "missingVolunteers": number
    }
  ],
  "personalMessage": "Персональне коротке повідомлення для волонтера (1–2 речення)"
}`
}
 
export async function POST(req: NextRequest) {
  try {
    const body: RecommendRequest = await req.json()
    const { volunteer, availablePosts, filterMeta } = body
 
    if (!volunteer || !availablePosts) {
      return NextResponse.json(
        { error: 'Потрібні поля: volunteer, availablePosts' },
        { status: 400 }
      )
    }
 
    // Якщо немає подій поряд — повертаємо порожній результат одразу
    if (availablePosts.length === 0) {
      return NextResponse.json({
        recommendations: [],
        personalMessage: `На жаль, у радіусі ${filterMeta?.radiusKm ?? 50} км від ${volunteer.city} зараз немає активних подій. Спробуй розширити пошук або перевір пізніше.`,
        generatedAt: new Date().toISOString(),
      })
    }
 
    const openPosts = availablePosts.filter(
      p => p.status === 'open' && p.type === 'event'
    )
 
    const userMessage = `
Профіль волонтера:
- Ім'я: ${volunteer.name}
- Місто: ${volunteer.city}
- Роль: ${volunteer.role}
- Навички/інтереси: ${volunteer.skills?.join(', ') || 'не вказано'}
- Біо: ${volunteer.bio || 'не вказано'}
- Попередні активності: ${volunteer.applicationHistory?.join(', ') || 'жодної'}
 
Доступні події (вже відфільтровані по геолокації, всі в межах ${filterMeta?.radiusKm ?? 50} км):
${openPosts.map(p => `
ID: ${p.id}
Назва: ${p.title}
Місто: ${p.city}${p.district ? ', ' + p.district : ''}
Теги: ${p.tags.join(', ')}
Місць залишилось: ${p.spotsLeft ?? 'необмежено'}
Опис: ${p.description.slice(0, 150)}...
`).join('\n---\n')}
 
Порекомендуй 3–5 найбільш релевантних подій для цього волонтера.
    `.trim()
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: buildSystemPrompt(filterMeta),
        messages: [{ role: 'user', content: userMessage }],
      }),
    })
 
    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'Помилка AI сервісу' }, { status: 502 })
    }
 
    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''
 
    let parsed
    try {
      const firstBrace = rawText.indexOf('{')
      const lastBrace = rawText.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON')
      parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1))
    } catch {
      console.error('JSON parse error:', rawText)
      return NextResponse.json(
        { error: 'Помилка парсингу відповіді AI' },
        { status: 500 }
      )
    }
 
    return NextResponse.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recommend route error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}