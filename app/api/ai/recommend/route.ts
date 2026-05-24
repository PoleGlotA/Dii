// app/api/ai/recommend/route.ts
// Повертає персоналізовані рекомендації волонтеру на основі його профілю та
// попередньої активності. Викликається з компонента AIDashboard.

import { NextRequest, NextResponse } from 'next/server'

// ─── Типи (дублюємо щоб не залежати від імпорту у API route) ───────────────

interface VolunteerProfile {
  id: string
  name: string
  city: string
  role: 'volunteer' | 'organizer'
  bio?: string
  skills?: string[]
  applicationHistory?: string[]   // postId заявок, у яких брав участь
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

interface RecommendRequest {
  volunteer: VolunteerProfile
  availablePosts: Post[]
}

// ─── Хелпер: формуємо системний промпт ────────────────────────────────────

function buildSystemPrompt(): string {
  return `Ти — AI-асистент волонтерської платформи "Дій" (Україна).
Твоє завдання — аналізувати профіль волонтера та доступні заявки, і повертати
персоналізовані рекомендації у форматі JSON.

Правила:
- Враховуй місто та район волонтера
- Враховуй попередню активність (які типи подій відвідував)
- Пріоритет — події де критично бракує людей
- score від 0 до 100 (відповідність профілю + терміновість)
- reason — 1 речення чому рекомендовано, по-українськи
- urgency: "critical" якщо spotsLeft <= 2, "high" якщо <= 5, інакше "normal"

Відповідай ТІЛЬКИ валідним JSON без зайвого тексту, у форматі:
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

// ─── Основний обробник ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: RecommendRequest = await req.json()
    const { volunteer, availablePosts } = body

    if (!volunteer || !availablePosts) {
      return NextResponse.json(
        { error: 'Потрібні поля: volunteer, availablePosts' },
        { status: 400 }
      )
    }

    // Фільтруємо тільки відкриті події (не новини, не закриті)
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
- Попередні активності (postId): ${volunteer.applicationHistory?.join(', ') || 'жодної'}

Доступні події для рекомендації (тільки відкриті):
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
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json(
        { error: 'Помилка AI сервісу' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''

    // Парсимо JSON з відповіді
    let parsed
    try {
      // Видаляємо можливі markdown-огорожі ```json ... ```
      const clean = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
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
