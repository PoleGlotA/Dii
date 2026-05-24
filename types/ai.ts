// types/ai.ts
// AI-система для платформи Дій — типи

export interface AIRecommendation {
  postId: string
  score: number          // 0–100, відсоток відповідності
  reason: string         // Чому рекомендовано (коротко)
  urgency: 'critical' | 'high' | 'normal'
  missingVolunteers?: number
}

export interface AIForecastDay {
  day: string            // 'Пн', 'Вт', ...
  date: string           // ISO date
  predictedRequests: number
  confidence: number     // 0–1
}

export interface AIDistrictForecast {
  district: string
  city: string
  shortage: 'critical' | 'moderate' | 'normal'
  shortageScore: number  // 0–100
  predictedDemand: number
}

export interface AIForecast {
  weeklyForecast: AIForecastDay[]
  districtShortages: AIDistrictForecast[]
  peakDay: string
  peakHour: string
  weeklyTotal: number
  trend: 'growing' | 'stable' | 'declining'
  generatedAt: string
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[]
  personalMessage: string   // Персональне повідомлення для волонтера
  generatedAt: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIChatResponse {
  reply: string
  suggestedActions?: string[]
}
