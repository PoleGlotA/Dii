// app/api/ai/generate/route.ts
// Генерує контент для нової публікації на основі короткого опису від організатора.
 
import { NextRequest, NextResponse } from 'next/server'
 
interface GenerateRequest {
  type: 'ПОДІЯ' | 'ЗБІР' | 'НОВИНА'
  prompt: string          // короткий опис від користувача
  city: string
  language?: string
}
 
function buildSystemPrompt(type: GenerateRequest['type']): string {
  const typeLabel =
    type === 'ПОДІЯ' ? 'волонтерської події' :
    type === 'ЗБІР'  ? 'збору коштів' :
                       'новини'
 
  return `Ти — помічник організатора волонтерської платформи "Дій" (Україна).
Твоє завдання — генерувати якісний контент для публікації типу "${typeLabel}".
 
На основі короткого опису від організатора створи:
- title: чіткий, конкретний заголовок (до 80 символів)
- description: короткий опис для картки (1–2 речення, до 200 символів)
- content: повний текст публікації у Markdown (300–600 символів, з заголовками ## та списками -)
- tags: масив з 3–6 релевантних тегів (місто, напрямок, цільова аудиторія)
- suggestedDate: рекомендована дата у форматі YYYY-MM-DD (найближчі 7–30 днів)
${type === 'ПОДІЯ' ? '- suggestedParticipants: рекомендована кількість учасників (число)' : ''}
${type === 'ЗБІР'  ? '- suggestedAmount: рекомендована сума збору в гривнях (число)' : ''}
 
Правила:
- Пиши по-українськи, тепло і конкретно
- Уникай шаблонних фраз типу "долучайтесь до нас"
- Вказуй конкретні дії та користь
- Теги — окремі слова або короткі фрази без #
 
Відповідай ТІЛЬКИ валідним JSON без жодного зайвого тексту:
{
  "title": "string",
  "description": "string",
  "content": "string (Markdown)",
  "tags": ["string"],
  "suggestedDate": "YYYY-MM-DD"${type === 'ПОДІЯ' ? ',\n  "suggestedParticipants": number' : ''}${type === 'ЗБІР' ? ',\n  "suggestedAmount": number' : ''}
}`
}
 
export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { type, prompt, city } = body
 
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Потрібен опис події' }, { status: 400 })
    }
 
    if (prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Опис занадто короткий — мінімум 10 символів' },
        { status: 400 }
      )
    }
 
    const today = new Date().toISOString().split('T')[0]
 
    const userMessage = `
Тип публікації: ${type}
Місто: ${city || 'не вказано'}
Сьогоднішня дата: ${today}
 
Опис від організатора:
${prompt.trim()}
 
Згенеруй якісну публікацію на основі цього опису.
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
        system: buildSystemPrompt(type),
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
      console.error('JSON parse error, raw:', rawText)
      return NextResponse.json({ error: 'Помилка обробки відповіді AI' }, { status: 500 })
    }
 
    return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() })
 
  } catch (error) {
    console.error('Generate route error:', error)
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 })
  }
}
 