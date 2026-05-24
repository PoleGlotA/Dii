'use client'
// components/AIDashboard.tsx — ФІНАЛЬНА ВЕРСІЯ з геофільтрацією
 
import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, TrendingUp, MessageCircle, AlertTriangle,
  Users, MapPin, Clock, ChevronDown, ChevronUp,
  Send, Loader2, Star, BarChart2, Navigation,
} from 'lucide-react'
import type { Post, User, Booking } from '@/types'
import {
  fetchAIRecommendations,
  fetchAIForecast,
  sendAIChatMessage,
  buildVolunteerProfile,
} from '@/lib/aiHelpers'
import type { AIRecommendation, AIForecast } from '@/types/ai'
 
interface AIDashboardProps {
  user: User
  posts: Post[]
  bookings: Booking[]
}
 
interface GeoMeta {
  radiusKm: number
  volunteerCity: string
  nearbyEvents: number
  totalEvents: number
  usingFallback: boolean
}
 
function UrgencyBadge({ urgency }: { urgency: AIRecommendation['urgency'] }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border border-red-200',
    high:     'bg-amber-100 text-amber-700 border border-amber-200',
    normal:   'bg-blue-50 text-blue-700 border border-blue-200',
  }
  const labels: Record<string, string> = {
    critical: '🔴 Критично бракує',
    high:     '🟡 Потрібні люди',
    normal:   '🔵 Є місця',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[urgency]}`}>
      {labels[urgency]}
    </span>
  )
}
 
export default function AIDashboard({ user, posts, bookings }: AIDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reco' | 'forecast' | 'chat'>('reco')
  const [isOpen, setIsOpen] = useState(true)
 
  // Рекомендації
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [personalMessage, setPersonalMessage] = useState('')
  const [recoLoading, setRecoLoading] = useState(false)
  const [recoError, setRecoError] = useState('')
  const [radiusKm, setRadiusKm] = useState(50)
  const [geoMeta, setGeoMeta] = useState<GeoMeta | null>(null)
 
  // Прогноз
  const [forecast, setForecast] = useState<AIForecast | null>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastSummary, setForecastSummary] = useState('')
 
  // Чат
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
 
  // Перезавантажуємо при зміні радіусу або користувача
  useEffect(() => { loadRecommendations() }, [user.id, radiusKm]) // eslint-disable-line
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])
 
  async function loadRecommendations() {
    setRecoLoading(true)
    setRecoError('')
    setGeoMeta(null)
    try {
      const profile = buildVolunteerProfile(user, bookings, posts)
      const data = await fetchAIRecommendations(profile, posts, radiusKm)
      setRecommendations(data.recommendations ?? [])
      setPersonalMessage(data.personalMessage ?? '')
      if (data._geoMeta) setGeoMeta(data._geoMeta)
    } catch {
      setRecoError('Не вдалося завантажити рекомендації')
    } finally {
      setRecoLoading(false)
    }
  }
 
  async function loadForecast() {
    if (forecast) return
    setForecastLoading(true)
    try {
      const data = await fetchAIForecast(posts, bookings)
      setForecast(data)
      setForecastSummary(data.summary ?? '')
    } catch (e) {
      console.error('Forecast error:', e)
    } finally {
      setForecastLoading(false)
    }
  }
 
  async function handleSendChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user' as const, content: text }]
    setChatMessages(newMessages)
    setChatLoading(true)
    try {
      const city = user.location.split(',')[0]?.trim()
      const { reply } = await sendAIChatMessage(newMessages, city, user.role, posts, bookings)
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Вибачте, виникла помилка. Спробуйте ще раз.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }
 
  function getPost(id: string) {
    return posts.find(p => p.id === id)
  }
 
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6 overflow-hidden shadow-sm">
 
      {/* Заголовок */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">AI-асистент</span>
          {recommendations.length > 0 && (
            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {recommendations.length} рекомендацій
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
 
      {isOpen && (
        <>
          {/* Вкладки */}
          <div className="flex border-t border-b border-gray-100 dark:border-gray-800">
            {([
              { id: 'reco',     label: 'Рекомендації', icon: <Sparkles size={14} /> },
              { id: 'forecast', label: 'Прогноз',      icon: <TrendingUp size={14} /> },
              { id: 'chat',     label: 'AI-чат',        icon: <MessageCircle size={14} /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'forecast') loadForecast()
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
 
          <div className="p-5">
 
            {/* ── Рекомендації ──────────────────────────────────────── */}
            {activeTab === 'reco' && (
              <div>
                {/* Геопанель з вибором радіусу */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4
                  bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800
                  rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
                    <Navigation size={13} className="shrink-0" />
                    {geoMeta ? (
                      geoMeta.usingFallback ? (
                        <span>
                          Координати <strong>{geoMeta.volunteerCity}</strong> не знайдено —
                          показані всі <strong>{geoMeta.totalEvents}</strong> подій
                        </span>
                      ) : (
                        <span>
                          <strong>{geoMeta.nearbyEvents}</strong> з <strong>{geoMeta.totalEvents}</strong> подій
                          у радіусі <strong>{geoMeta.radiusKm} км</strong> від <strong>{geoMeta.volunteerCity}</strong>
                          {geoMeta.nearbyEvents === 0 && ' — показані всі (fallback)'}
                        </span>
                      )
                    ) : (
                      <span>Пошук в радіусі <strong>{radiusKm} км</strong> від {user.location.split(',')[0]}</span>
                    )}
                  </div>
 
                  {/* Кнопки вибору радіусу */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-blue-600 dark:text-blue-400 mr-1">Радіус:</span>
                    {[25, 50, 100, 200].map(r => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        disabled={recoLoading}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          radiusKm === r
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        {r} км
                      </button>
                    ))}
                  </div>
                </div>
 
                {personalMessage && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl px-4 py-3 mb-4 text-sm text-purple-800 dark:text-purple-300">
                    ✨ {personalMessage}
                  </div>
                )}
 
                {recoLoading && (
                  <div className="flex items-center gap-2 text-gray-500 py-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">
                      AI шукає події в радіусі {radiusKm} км...
                    </span>
                  </div>
                )}
 
                {recoError && (
                  <div className="text-sm text-red-600 flex items-center gap-2 py-2">
                    <AlertTriangle size={14} /> {recoError}
                    <button onClick={loadRecommendations} className="underline ml-1">
                      Спробувати знову
                    </button>
                  </div>
                )}
 
                {!recoLoading && !recoError && recommendations.length === 0 && (
                  <div className="text-center py-6 space-y-2">
                    <MapPin size={32} className="mx-auto text-gray-300" />
                    <p className="text-sm text-gray-500">
                      Немає активних подій у радіусі {radiusKm} км від {user.location.split(',')[0]}
                    </p>
                    <button
                      onClick={() => setRadiusKm(r => Math.min(r * 2, 500))}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Розширити до {Math.min(radiusKm * 2, 500)} км
                    </button>
                  </div>
                )}
 
                <div className="space-y-3">
                  {recommendations.map((reco, i) => {
                    const post = getPost(reco.postId)
                    if (!post) return null
                    const city = post.location.split(',')[0]?.trim() ?? post.location
                    const spotsLeft =
                      post.maxParticipants !== undefined && post.currentParticipants !== undefined
                        ? post.maxParticipants - post.currentParticipants
                        : undefined
 
                    return (
                      <div
                        key={reco.postId}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                              <UrgencyBadge urgency={reco.urgency} />
                              <span className="flex items-center gap-1 text-xs text-amber-600">
                                <Star size={11} fill="currentColor" />
                                {reco.score}% відповідність
                              </span>
                            </div>
 
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                              {post.title}
                            </h3>
 
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                              {reco.reason}
                            </p>
 
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />{city}
                              </span>
                              {spotsLeft !== undefined && spotsLeft > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users size={11} />Місць: {spotsLeft}
                                </span>
                              )}
                              {post.date && (
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />{new Date(post.date).toLocaleDateString('uk-UA')}
                                </span>
                              )}
                            </div>
                          </div>
 
                          <a
                            href={`/post/${post.id}`}
                            className="shrink-0 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Деталі
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
 
                {!recoLoading && recommendations.length > 0 && (
                  <button
                    onClick={loadRecommendations}
                    className="mt-4 text-xs text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1"
                  >
                    <Loader2 size={11} /> Оновити рекомендації
                  </button>
                )}
              </div>
            )}
 
            {/* ── Прогноз ───────────────────────────────────────────── */}
            {activeTab === 'forecast' && (
              <div>
                {forecastLoading && (
                  <div className="flex items-center gap-2 text-gray-500 py-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">AI будує прогноз активності...</span>
                  </div>
                )}
 
                {!forecastLoading && !forecast && (
                  <p className="text-sm text-gray-400 py-2">Не вдалося завантажити прогноз.</p>
                )}
 
                {forecast && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: 'Заявок за тиждень', value: forecast.weeklyTotal },
                        { label: 'Пік активності',    value: forecast.peakDay },
                        { label: 'Пікова година',     value: forecast.peakHour },
                        { label: 'Тренд', value: forecast.trend === 'growing' ? '↑ Зростання' : forecast.trend === 'declining' ? '↓ Спад' : '→ Стабільно' },
                      ].map(m => (
                        <div key={m.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">{m.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
 
                    {forecast.weeklyForecast?.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <BarChart2 size={13} /> Прогноз заявок по днях
                        </p>
                        <div className="flex items-end gap-2 h-24">
                          {forecast.weeklyForecast.map(d => {
                            const max = Math.max(...forecast.weeklyForecast.map((x: { predictedRequests: number }) => x.predictedRequests))
                            const pct = max > 0 ? (d.predictedRequests / max) * 100 : 0
                            const isPeak = d.day === forecast.peakDay
                            return (
                              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-gray-500">{d.predictedRequests}</span>
                                <div
                                  className={`w-full rounded-t-sm ${isPeak ? 'bg-red-400' : 'bg-blue-300 dark:bg-blue-600'}`}
                                  style={{ height: `${pct}%`, minHeight: 4 }}
                                />
                                <span className="text-[10px] text-gray-400">{d.day}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
 
                    {forecast.districtShortages?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <Users size={13} /> Брак волонтерів по районах
                        </p>
                        <div className="space-y-2">
                          {forecast.districtShortages.map((d: { city: string; district: string; shortage: string; shortageScore: number }) => {
                            const color = d.shortage === 'critical' ? 'bg-red-500' : d.shortage === 'moderate' ? 'bg-amber-400' : 'bg-green-500'
                            const badge = d.shortage === 'critical' ? 'bg-red-100 text-red-700' : d.shortage === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            return (
                              <div key={`${d.city}-${d.district}`} className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 dark:text-gray-300 w-32 shrink-0 truncate">
                                  {d.city}{d.district ? ` · ${d.district}` : ''}
                                </span>
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${color}`} style={{ width: `${d.shortageScore * 100}%` }} />
                                </div>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badge}`}>
                                  {d.shortage === 'critical' ? 'критично' : d.shortage === 'moderate' ? 'помірно' : 'норма'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
 
                    {forecastSummary && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
                        {forecastSummary}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
 
            {/* ── AI-чат ────────────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <div className="flex flex-col gap-3">
                {chatMessages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {[
                      'Де зараз найбільше бракує волонтерів?',
                      'Які події є у моєму місті цього тижня?',
                      'Як організувати волонтерський збір?',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
 
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                        ${m.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                        }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
 
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Запитайте про волонтерство..."
                    className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors"
                    aria-label="Надіслати"
                  >
                    {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            )}
 
          </div>
        </>
      )}
    </div>
  )
}