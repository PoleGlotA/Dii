'use client'
// components/AIRecommendationBanner.tsx
// Маленький банер-рекомендація для вставки прямо у стрічку постів.
// Показується між 3-м і 4-м постом (або де завгодно).
//
// Використання в app/page.tsx:
//   import AIRecommendationBanner from '@/components/AIRecommendationBanner'
//   // у JSX після третього поста:
//   <AIRecommendationBanner user={user} posts={posts} applications={applications} />

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react'
import { fetchAIRecommendations, buildVolunteerProfile, type Post, type User, type Application } from '@/lib/aiHelpers'
import type { AIRecommendation } from '@/types/ai'

interface Props {
  user: User
  posts: Post[]
  applications: Application[]
}

export default function AIRecommendationBanner({ user, posts, applications }: Props) {
  const [topReco, setTopReco] = useState<(AIRecommendation & { postTitle?: string; postCity?: string }) | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const profile = buildVolunteerProfile(user, applications, posts)
        const openPosts = posts.filter(p => p.status !== 'closed' && p.type === 'event')
        const data = await fetchAIRecommendations(profile, openPosts)

        if (!cancelled && data.recommendations?.length > 0) {
          const top = data.recommendations[0] as AIRecommendation
          const post = posts.find(p => p.id === top.postId)
          setTopReco({ ...top, postTitle: post?.title, postCity: post?.city })
          setMessage(data.personalMessage ?? '')
        }
      } catch {
        // тихо — банер просто не покажеться
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  if (dismissed || (!loading && !topReco)) return null

  return (
    <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-4 mb-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Закрити"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-purple-100 dark:bg-purple-900 rounded-xl p-2 shrink-0">
          <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={13} className="animate-spin" />
              AI підбирає рекомендації для вас...
            </div>
          ) : (
            <>
              {message && (
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1.5">
                  {message}
                </p>
              )}
              {topReco && (
                <a
                  href={`/post/${topReco.postId}`}
                  className="group flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {topReco.postTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {topReco.postCity} · {topReco.score}% відповідність
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-purple-500 group-hover:translate-x-1 transition-transform"
                  />
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
