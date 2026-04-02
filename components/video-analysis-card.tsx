'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Upload, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react'

interface VideoAnalysisResult {
  overallAuthenticityScore: number
  frameAnalysis: Array<{
    timestamp: number
    authenticityScore: number
    manipulationIndicators: string[]
  }>
  audioAnalysis: {
    voiceAuthenticityScore: number
    lipSyncScore: number
    manipulationDetected: boolean
  }
  summary: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface VideoAnalysisCardProps {
  onAnalysisComplete?: (result: VideoAnalysisResult) => void
}

export function VideoAnalysisCard({ onAnalysisComplete }: VideoAnalysisCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<VideoAnalysisResult | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setResult(null)
      setProgress(0)
    }
  }

  const analyzeVideo = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setProgress(0)

    try {
      // Simulate video analysis progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 1000)

      // Create FormData for video upload
      const formData = new FormData()
      formData.append('video', selectedFile)

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      clearInterval(progressInterval)
      setProgress(100)

      if (data.success) {
        const analysisResult: VideoAnalysisResult = data.analysis
        setResult(analysisResult)
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult)
        }
      } else {
        throw new Error(data.error || 'Video analysis failed')
      }
    } catch (error) {
      console.error('Video analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const getAuthenticityAtTime = (time: number) => {
    if (!result) return 100
    
    const frame = result.frameAnalysis.find(f => 
      Math.abs(f.timestamp - time) < 1
    )
    return frame?.authenticityScore || 100
  }

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Video Deepfake Analysis
        </CardTitle>
        <CardDescription>
          Advanced frame-by-frame and audio analysis for video authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Upload Video File</p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports MP4, MOV, AVI (max 100MB)
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select Video
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-64 object-contain"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  {result && (
                    <div className="flex-1 ml-4">
                      <div className="text-xs text-white mb-1">
                        Authenticity: {getAuthenticityAtTime(currentTime).toFixed(1)}%
                      </div>
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        {result.frameAnalysis.map((frame, index) => (
                          <div
                            key={index}
                            className={`h-full inline-block ${
                              frame.authenticityScore >= 90 ? 'bg-green-500' :
                              frame.authenticityScore >= 70 ? 'bg-yellow-500' :
                              frame.authenticityScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${100 / result.frameAnalysis.length}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Controls */}
            <div className="flex gap-2">
              <Button 
                onClick={analyzeVideo} 
                disabled={analyzing}
                className="flex-1"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Video'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedFile(null)
                  setResult(null)
                }}
              >
                Clear
              </Button>
            </div>

            {/* Analysis Progress */}
            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing video frames...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Analysis Results */}
            {result && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getRiskColor(result.overallAuthenticityScore)}`}>
                      {result.overallAuthenticityScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Authenticity</div>
                  </div>
                  <div className="text-center">
                    <Badge className={getRiskBadgeColor(result.riskLevel)}>
                      {result.riskLevel} Risk
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
                  </div>
                </div>

                {/* Audio Analysis */}
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Voice Authenticity:</span>
                      <span className={`ml-2 font-medium ${getRiskColor(result.audioAnalysis.voiceAuthenticityScore)}`}>
                        {result.audioAnalysis.voiceAuthenticityScore}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lip Sync:</span>
                      <span className={`ml-2 font-medium ${getRiskColor(result.audioAnalysis.lipSyncScore)}`}>
                        {result.audioAnalysis.lipSyncScore}%
                      </span>
                    </div>
                  </div>
                  {result.audioAnalysis.manipulationDetected && (
                    <div className="mt-2 flex items-center text-orange-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Audio manipulation detected</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-2">Analysis Summary</h4>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>

                {/* Frame Timeline */}
                <div>
                  <h4 className="font-medium mb-2">Frame Analysis Timeline</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.frameAnalysis.slice(0, 5).map((frame, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {Math.floor(frame.timestamp / 60)}:{(frame.timestamp % 60).toFixed(1).padStart(4, '0')}
                        </span>
                        <span className={`font-medium ${getRiskColor(frame.authenticityScore)}`}>
                          {frame.authenticityScore}%
                        </span>
                        {frame.manipulationIndicators.length > 0 && (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}