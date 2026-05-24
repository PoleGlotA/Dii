// app/api/ai/chat/route.ts
// Загальний AI-чат для волонтерів. Підтримує контекст розмови (multi-turn).

import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  volunteerCity?: string
  volunteerRole?: 'volunteer' | 'organizer'
  platformData?: Record<string, unknown>  // ← додати
}

const SYSTEM_PROMPT = `Ти — AI-асистент волонтерської платформи "Дій" (Україна).
Допомагаєш волонтерам та організаторам знаходити події, координувати зусилля
та ефективно допомагати людям.

Твоя спеціалізація:
- Рекомендації волонтерських подій та заявок
- Аналіз де бракує волонтерів
- Прогноз активності та навантаження
- Поради щодо координації та логістики
- Відповіді на питання про волонтерство в Україні

Стиль відповідей:
- Відповідай по-українськи, тепло та конкретно
- Будь стислим (3–5 речень якщо не просять деталей)
- Пропонуй конкретні дії, а не загальні поради
- Якщо питання не стосується волонтерства — м'яко поверни до теми`

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, volunteerCity, volunteerRole, platformData } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Потрібне поле: messages' }, { status: 400 })
    }

    // Персоналізуємо системний промпт
    let systemPrompt = SYSTEM_PROMPT
    if (volunteerCity) {
      systemPrompt += `\n\nПоточний користувач знаходиться у місті: ${volunteerCity}.`
    }
    if (volunteerRole === 'organizer') {
      systemPrompt += '\nКористувач є організатором — давай поради з точки зору управління командою та організації подій.'
    }
    if (platformData) {
  systemPrompt += `

АКТУАЛЬНІ ДАНІ ПЛАТФОРМИ "ДІЙ" (реальні, використовуй їх у відповідях):
- Всього публікацій: ${platformData.totalPosts}
- Відкритих подій: ${platformData.openEventsCount}
- Термінових публікацій: ${platformData.urgentCount}
- Активних зборів: ${platformData.fundraisersCount}
- Всього заявок: ${platformData.totalBookings}
- Міста на платформі: ${(platformData.cities as string[]).join(', ')}

Термінові події (потребують волонтерів найбільше):
${(platformData.urgentEvents as Array<{title:string,city:string,spotsLeft:number|null,tags:string[],date:string}>)
  .map(e => `• "${e.title}" | ${e.city} | місць: ${e.spotsLeft ?? 'необмежено'} | теги: ${e.tags.join(', ')}`)
  .join('\n')}

Де бракує волонтерів (відсортовано за терміновістю):
${(platformData.criticalShortage as Array<{title:string,city:string,spotsLeft:number|null,urgent:boolean}>)
  .map(e => `• "${e.title}" | ${e.city} | місць: ${e.spotsLeft ?? '?'}${e.urgent ? ' ⚠️ ТЕРМІНОВО' : ''}`)
  .join('\n')}

Всі відкриті події:
${(platformData.openEvents as Array<{title:string,city:string,date:string,spotsLeft:number|null}>)
  .map(e => `• "${e.title}" | ${e.city} | ${e.date ?? 'дата не вказана'} | місць: ${e.spotsLeft ?? 'необмежено'}`)
  .join('\n')}

Активні збори коштів:
${(platformData.activeFundraisers as Array<{title:string,city:string,target:number,collected:number,percent:number|null}>)
  .map(f => `• "${f.title}" | ${f.city} | ${f.collected}/${f.target} грн (${f.percent ?? '?'}%)`)
  .join('\n')}

Відповідай конкретно на основі цих даних. Ніколи не кажи що у тебе немає доступу до даних платформи.`
}

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
        system: systemPrompt,
        messages: messages.slice(-10), // Останні 10 повідомлень для контексту
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Помилка AI сервісу' }, { status: 502 })
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text ?? 'Вибачте, не вдалося отримати відповідь.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
