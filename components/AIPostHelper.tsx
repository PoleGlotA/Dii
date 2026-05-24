'use client'
// components/AIPostHelper.tsx
// Вставте у app/post/new/page.tsx одразу після імпортів:
//   import { AIPostHelper } from '@/components/AIPostHelper'
//
// І у JSX перед <form>:
//   <AIPostHelper
//     type={type}
//     city={location}
//     onApply={({ title, description, content, tags,
//                 suggestedDate, suggestedParticipants, suggestedAmount }) => {
//       if (title)       setTitle(title)
//       if (description) setDescription(description)
//       if (content)     setContent(content)
//       if (tags)        setTagsRaw(tags.join(', '))
//       if (suggestedDate)         setDate(suggestedDate)
//       if (suggestedParticipants) setMaxParticipants(String(suggestedParticipants))
//       if (suggestedAmount)       setTargetAmount(String(suggestedAmount))
//     }}
//   />

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2, RotateCcw } from 'lucide-react'
import type { PostType } from '@/types'

interface GeneratedPost {
  title: string
  description: string
  content: string
  tags: string[]
  suggestedDate?: string
  suggestedParticipants?: number
  suggestedAmount?: number
}

interface AIPostHelperProps {
  type: PostType
  city: string
  onApply: (data: GeneratedPost) => void
}

export function AIPostHelper({ type, city, onApply }: AIPostHelperProps) {
  const [isOpen, setIsOpen]     = useState(false)
  const [prompt, setPrompt]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState<GeneratedPost | null>(null)
  const [applied, setApplied]   = useState(false)

  const typeLabel =
    type === 'ПОДІЯ' ? 'подію' :
    type === 'ЗБІР'  ? 'збір' : 'новину'

  const placeholders: Record<PostType, string> = {
    'ПОДІЯ':  'Наприклад: "Збираємо гуманітарку у Харкові, потрібно 15 людей у суботу вранці"',
    'ЗБІР':   'Наприклад: "Збираємо на дрони для 3-ї бригади, ціль 200 тисяч гривень"',
    'НОВИНА': 'Наприклад: "Наш центр відкрив новий пункт видачі у Львові"',
  }

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    setApplied(false)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt: prompt.trim(),
          city: city || 'Україна',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Помилка генерації')
        return
      }

      setResult(data)
    } catch {
      setError('Не вдалося з\'єднатися з AI')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!result) return
    onApply(result)
    setApplied(true)
  }

  function handleReset() {
    setResult(null)
    setApplied(false)
    setPrompt('')
    setError('')
  }

  return (
    <div className="mb-6 border border-purple-200 rounded-2xl overflow-hidden bg-purple-50/40">

      {/* Заголовок */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5
          hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-500" />
          <span className="text-sm font-semibold text-purple-800">
            AI-помічник
          </span>
          <span className="text-xs text-purple-500">
            Згенерує {typeLabel} за вашим описом
          </span>
        </div>
        {isOpen
          ? <ChevronUp   size={15} className="text-purple-400" />
          : <ChevronDown size={15} className="text-purple-400" />
        }
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-4">

          {/* Поле вводу */}
          {!result && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Опишіть коротко що ви організовуєте
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
                  }}
                  placeholder={placeholders[type]}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3
                    bg-white focus:outline-none focus:ring-2 focus:ring-purple-400
                    resize-none placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ctrl+Enter — згенерувати · Чим конкретніше, тим точніший результат
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100
                  rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm
                  font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Генерую...</>
                  : <><Wand2 size={15} /> Згенерувати</>
                }
              </button>
            </>
          )}

          {/* Результат */}
          {result && (
            <div className="space-y-3">

              {/* Заголовок */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Заголовок
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{result.title}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Короткий опис
                  </p>
                  <p className="text-sm text-gray-700">{result.description}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Повний текст
                  </p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans
                    bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {result.content}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {result.suggestedDate && (
                    <span className="bg-blue-50 border border-blue-100 text-blue-700
                      px-2.5 py-1 rounded-full">
                      📅 {new Date(result.suggestedDate).toLocaleDateString('uk-UA')}
                    </span>
                  )}
                  {result.suggestedParticipants && (
                    <span className="bg-green-50 border border-green-100 text-green-700
                      px-2.5 py-1 rounded-full">
                      👥 {result.suggestedParticipants} учасників
                    </span>
                  )}
                  {result.suggestedAmount && (
                    <span className="bg-amber-50 border border-amber-100 text-amber-700
                      px-2.5 py-1 rounded-full">
                      💰 {result.suggestedAmount.toLocaleString('uk-UA')} грн
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map(tag => (
                    <span key={tag}
                      className="text-xs bg-purple-100 text-purple-700
                        px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Кнопки дій */}
              <div className="flex gap-2">
                {!applied ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 flex items-center justify-center gap-2
                      bg-purple-600 hover:bg-purple-700 text-white text-sm
                      font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <Sparkles size={14} />
                    Підставити у форму
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2
                    bg-green-50 border border-green-200 text-green-700 text-sm
                    font-medium py-2.5 rounded-xl">
                    ✓ Підставлено у форму — перевірте та відредагуйте
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 border
                    border-gray-200 text-gray-600 hover:border-purple-300
                    hover:text-purple-600 text-sm rounded-xl transition-colors"
                >
                  <RotateCcw size={13} />
                  Заново
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
