'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  FileText, 
  Image, 
  Video, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalAnalyses: number
  averageRiskScore: number
  documentTypes: { [key: string]: number }
  riskTrends: Array<{ date: string; avgRisk: number; count: number }>
  manipulationIndicators: { [key: string]: number }
  monthlyVolume: Array<{ month: string; count: number }>
  authenticityDistribution: { [key: string]: number }
}

interface AnalyticsDashboardProps {
  walletAddress?: string
}

export function AnalyticsDashboard({ walletAddress }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('risk')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, walletAddress])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock analytics data
      const mockData: AnalyticsData = {
        totalAnalyses: 1247,
        averageRiskScore: 23,
        documentTypes: {
          'Legal Contract': 342,
          'Medical Record': 198,
          'Financial Statement': 156,
          'Image Analysis': 287,
          'Video Analysis': 89,
          'Resume/CV': 175
        },
        riskTrends: generateRiskTrends(),
        manipulationIndicators: {
          'Facial Inconsistency': 45,
          'Temporal Artifacts': 32,
          'Metadata Anomalies': 28,
          'Compression Artifacts': 67,
          'Lighting Inconsistency': 23,
          'Edge Artifacts': 19
        },
        monthlyVolume: [
          { month: 'Jan', count: 89 },
          { month: 'Feb', count: 124 },
          { month: 'Mar', count: 156 },
          { month: 'Apr', count: 198 },
          { month: 'May', count: 234 },
          { month: 'Jun', count: 287 },
          { month: 'Jul', count: 342 }
        ],
        authenticityDistribution: {
          'High (90-100%)': 756,
          'Medium (70-89%)': 312,
          'Low (50-69%)': 134,
          'Critical (<50%)': 45
        }
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRiskTrends = () => {
    const trends = []
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      trends.push({
        date: date.toISOString().split('T')[0],
        avgRisk: Math.round(15 + Math.random() * 20), // 15-35% average risk
        count: Math.round(5 + Math.random() * 15) // 5-20 analyses per day
      })
    }
    
    return trends
  }

  const exportData = (format: 'csv' | 'pdf') => {
    if (!data) return
    
    if (format === 'csv') {
      // Generate CSV data
      const csvData = [
        ['Metric', 'Value'],
        ['Total Analyses', data.totalAnalyses.toString()],
        ['Average Risk Score', data.averageRiskScore.toString()],
        ...Object.entries(data.documentTypes).map(([type, count]) => [type, count.toString()])
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `veilnet-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      
      URL.revokeObjectURL(url)
    } else {
      // For PDF, we'd use a library like jsPDF
      alert('PDF export coming soon!')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis insights and trends
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
                <p className="text-2xl font-bold">{data.totalAnalyses.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold text-green-600">{data.averageRiskScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{data.monthlyVolume[data.monthlyVolume.length - 1]?.count || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Authenticity</p>
                <p className="text-2xl font-bold">{Math.round((data.authenticityDistribution['High (90-100%)'] / data.totalAnalyses) * 100)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Document Types
            </CardTitle>
            <CardDescription>Distribution of analyzed content types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.documentTypes).map(([type, count]) => {
                const percentage = Math.round((count / data.totalAnalyses) * 100)
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type.includes('Image') ? <Image className="h-4 w-4" /> :
                       type.includes('Video') ? <Video className="h-4 w-4" /> :
                       <FileText className="h-4 w-4" />}
                      <span className="text-sm">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Risk Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Risk Score Trends
            </CardTitle>
            <CardDescription>Average risk scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.riskTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(trend.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          trend.avgRisk < 20 ? 'bg-green-500' :
                          trend.avgRisk < 35 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(trend.avgRisk / 50) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{trend.avgRisk}%</span>
                    <span className="text-muted-foreground w-8 text-right">({trend.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manipulation Indicators & Authenticity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manipulation Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Manipulation Indicators</CardTitle>
            <CardDescription>Most common manipulation types detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.manipulationIndicators)
                .sort(([,a], [,b]) => b - a)
                .map(([indicator, count]) => (
                <div key={indicator} className="flex items-center justify-between">
                  <span className="text-sm">{indicator}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Authenticity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Authenticity Distribution</CardTitle>
            <CardDescription>Content authenticity score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.authenticityDistribution).map(([range, count]) => {
                const percentage = Math.round((count / data.totalAnalyses) * 100)
                const color = range.includes('High') ? 'bg-green-500' :
                             range.includes('Medium') ? 'bg-yellow-500' :
                             range.includes('Low') ? 'bg-orange-500' : 'bg-red-500'
                
                return (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm">{range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Analysis Volume</CardTitle>
          <CardDescription>Number of analyses performed each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {data.monthlyVolume.map((month, index) => {
              const maxCount = Math.max(...data.monthlyVolume.map(m => m.count))
              const height = (month.count / maxCount) * 100
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs font-medium mb-1">{month.count}</div>
                  <div 
                    className="bg-primary rounded-t w-full min-h-[4px]"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">{month.month}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}