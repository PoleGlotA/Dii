// app/api/ai/forecast/route.ts
// Прогнозує активність волонтерів: навантаження по днях та брак по районах.
// На основі агрегованих даних зі store (без персональних даних).

import { NextRequest, NextResponse } from 'next/server'

// ─── Типи ────────────────────────────────────────────────────────────────

interface AggregatedStats {
  totalPosts: number
  totalApplications: number
  openEvents: number
  citiesWithShortage: { city: string; district?: string; openSpots: number }[]
  recentActivityByDay: { date: string; count: number }[]  // останні 14 днів
  topCategories: { tag: string; count: number }[]
}

// ─── Системний промпт ────────────────────────────────────────────────────

function buildForecastSystemPrompt(): string {
  return `Ти — аналітична AI-система волонтерської платформи "Дій" (Україна).
Аналізуй агреговану статистику та повертай прогноз у форматі JSON.

Враховуй:
- Українські реалії: понеділок і вівторок — пік активності, неділя — мінімум
- Вечірні години (17–19) — найбільше заявок
- Суботи — пік волонтерських подій
- Сезонність та загальний тренд з даних

Відповідай ТІЛЬКИ валідним JSON без зайвого тексту, у форматі:
{
  "weeklyForecast": [
    { "day": "Пн", "date": "ISO-дата", "predictedRequests": number, "confidence": number }
  ],
  "districtShortages": [
    {
      "district": "string",
      "city": "string",
      "shortage": "critical" | "moderate" | "normal",
      "shortageScore": number,
      "predictedDemand": number
    }
  ],
  "peakDay": "string",
  "peakHour": "string (наприклад 18:00)",
  "weeklyTotal": number,
  "trend": "growing" | "stable" | "declining",
  "summary": "1 коротке речення висновку по-українськи (максимум 100 символів)"
}`
}

// ─── Генерація дат для тижня ─────────────────────────────────────────────

function getWeekDates(): { day: string; date: string }[] {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
  const today = new Date()
  // Знаходимо найближчий понеділок
  const monday = new Date(today)
  const dayOfWeek = today.getDay() || 7
  monday.setDate(today.getDate() - dayOfWeek + 1)

  return days.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { day, date: d.toISOString().split('T')[0] }
  })
}

// ─── Обробник ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const stats: AggregatedStats = await req.json()

    const weekDates = getWeekDates()

    const userMessage = `
Статистика платформи на сьогодні:
- Всього публікацій: ${stats.totalPosts}
- Всього заявок: ${stats.totalApplications}
- Відкритих подій: ${stats.openEvents}

Міста/райони де бракує волонтерів (відкриті місця):
${stats.citiesWithShortage.map(c =>
  `- ${c.city}${c.district ? ' / ' + c.district : ''}: ${c.openSpots} відкритих місць`
).join('\n')}

Активність за останні 14 днів (кількість заявок на дату):
${stats.recentActivityByDay.map(d => `${d.date}: ${d.count}`).join(', ')}

Топ-категорії подій:
${stats.topCategories.map(t => `${t.tag}: ${t.count}`).join(', ')}

Дати наступного тижня для прогнозу:
${weekDates.map(d => `${d.day} = ${d.date}`).join(', ')}

Побудуй прогноз на наступний тиждень. districtShortages заповни на основі даних про міста вище.
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
        max_tokens: 2048,
        system: buildForecastSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Помилка AI сервісу' }, { status: 502 })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''

  let parsed
try {
  const clean = rawText.replace(/```json|```/g, '').trim()
  console.log('Raw AI response:', clean) // ← додай це
  parsed = JSON.parse(clean)
} catch {
  console.error('Parse failed, raw text was:', rawText) // ← і це
  return NextResponse.json({ error: 'Помилка парсингу прогнозу' }, { status: 500 })
}

    return NextResponse.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Forecast route error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}

// GET — повертає кешований/статичний прогноз якщо немає даних
export async function GET() {
  return NextResponse.json({
    message: 'Використовуйте POST з агрегованими даними',
    requiredFields: [
      'totalPosts', 'totalApplications', 'openEvents',
      'citiesWithShortage', 'recentActivityByDay', 'topCategories'
    ]
  })
}
