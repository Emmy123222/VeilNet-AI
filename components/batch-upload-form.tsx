'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

interface BatchFile {
  id: string
  file: File
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  result?: any
  error?: string
}

interface BatchUploadFormProps {
  onBatchComplete?: (results: any[]) => void
}

export function BatchUploadForm({ onBatchComplete }: BatchUploadFormProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const batchFiles: BatchFile[] = selectedFiles.map(file => ({
      id: `${Date.now()}_${Math.random()}`,
      file,
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...batchFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const analyzeBatch = async () => {
    if (files.length === 0) return
    
    setAnalyzing(true)
    setProgress(0)
    
    const results: any[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Update status to analyzing
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'analyzing' } : f
      ))
      
      try {
        // Read file content
        const text = await file.file.text()
        
        // Analyze (using cloud AI for batch - faster)
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, analysisType: 'document-risk' })
        })
        
        const data = await response.json()
        
        if (data.success) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'complete', result: data.analysis } : f
          ))
          results.push(data.analysis)
        } else {
          throw new Error(data.error)
        }
      } catch (error: any) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error', error: error.message } : f
        ))
      }
      
      setProgress(((i + 1) / files.length) * 100)
    }
    
    setAnalyzing(false)
    
    if (onBatchComplete) {
      onBatchComplete(results)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'analyzing': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const completedCount = files.filter(f => f.status === 'complete').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Batch Document Analysis
        </CardTitle>
        <CardDescription>
          Upload multiple documents for simultaneous analysis (up to 10 files)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="batch-upload"
            disabled={analyzing || files.length >= 10}
          />
          <label htmlFor="batch-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {files.length >= 10 ? 'Maximum 10 files reached' : 'Click to select files'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {files.length}/10 files selected
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {file.result && (
                      <Badge className={
                        file.result.riskLevel === 'Critical' ? 'bg-red-600' :
                        file.result.riskLevel === 'High' ? 'bg-orange-600' :
                        file.result.riskLevel === 'Medium' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }>
                        {file.result.riskScore}/100
                      </Badge>
                    )}
                  </div>
                  {!analyzing && file.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing batch...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {!analyzing && (
              <div className="flex gap-2">
                <Button 
                  onClick={analyzeBatch}
                  disabled={files.length === 0}
                  className="flex-1"
                >
                  Analyze {files.length} Document{files.length !== 1 ? 's' : ''}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              </div>
            )}

            {completedCount > 0 && (
              <div className="flex gap-2 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {completedCount} completed
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} failed
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
