'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Star, ThumbsUp, TrendingUp } from 'lucide-react'

interface ModelReputationCardProps {
  modelName: string
  modelProvider: string
  analysisAccurate?: boolean
  onRate?: (rating: number) => void
}

export function ModelReputationCard({ 
  modelName, 
  modelProvider, 
  analysisAccurate,
  onRate 
}: ModelReputationCardProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleRate = async (score: number) => {
    setRating(score)
    setSubmitting(true)
    
    try {
      // Store rating locally
      const ratings = JSON.parse(localStorage.getItem('model_ratings') || '{}')
      const modelKey = `${modelProvider}_${modelName}`
      
      if (!ratings[modelKey]) {
        ratings[modelKey] = { ratings: [], average: 0 }
      }
      
      ratings[modelKey].ratings.push({
        score,
        timestamp: new Date().toISOString(),
        accurate: analysisAccurate
      })
      
      // Calculate average
      const allRatings = ratings[modelKey].ratings.map((r: any) => r.score)
      ratings[modelKey].average = allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
      ratings[modelKey].totalRatings = allRatings.length
      
      localStorage.setItem('model_ratings', JSON.stringify(ratings))
      
      setHasRated(true)
      
      if (onRate) {
        onRate(score)
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Rate AI Model Accuracy
        </CardTitle>
        <CardDescription>
          Help improve the ecosystem by rating this analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">{modelName}</p>
            <p className="text-xs text-muted-foreground">{modelProvider}</p>
          </div>
          <Badge variant="secondary">
            <Star className="h-3 w-3 mr-1" />
            AI Model
          </Badge>
        </div>

        {!hasRated ? (
          <div className="space-y-3">
            <Label>How accurate was this analysis?</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={submitting}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              1 = Inaccurate, 5 = Very Accurate
            </p>
          </div>
        ) : (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <ThumbsUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-800">
              Thank you for your feedback!
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your rating helps improve AI model selection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
