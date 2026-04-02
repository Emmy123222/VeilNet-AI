'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Play,
  Pause,
  Settings,
  Filter
} from 'lucide-react'

interface BatchFile {
  id: string
  file: File
  type: 'document' | 'image' | 'video'
  status: 'pending' | 'analyzing' | 'complete' | 'error' | 'paused'
  result?: any
  error?: string
  progress?: number
  priority: 'low' | 'normal' | 'high'
}

interface EnhancedBatchUploadProps {
  maxFiles?: number
  onBatchComplete?: (results: any[]) => void
}

export function EnhancedBatchUpload({ 
  maxFiles = 50, 
  onBatchComplete 
}: EnhancedBatchUploadProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [processingMode, setProcessingMode] = useState<'parallel' | 'sequential'>('parallel')
  const [maxConcurrent, setMaxConcurrent] = useState(5)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const batchFiles: BatchFile[] = selectedFiles.map(file => {
      const type = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' : 'document'
      
      return {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        type,
        status: 'pending',
        priority: 'normal'
      }
    })
    
    setFiles(prev => [...prev, ...batchFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setSelectedFiles(prev => prev.filter(fId => fId !== id))
  }

  const removeSelected = () => {
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)))
    setSelectedFiles([])
  }

  const setPriority = (id: string, priority: 'low' | 'normal' | 'high') => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, priority } : f
    ))
  }

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    const filteredFiles = getFilteredFiles()
    const allSelected = filteredFiles.every(f => selectedFiles.includes(f.id))
    
    if (allSelected) {
      setSelectedFiles(prev => prev.filter(id => !filteredFiles.find(f => f.id === id)))
    } else {
      setSelectedFiles(prev => [...new Set([...prev, ...filteredFiles.map(f => f.id)])])
    }
  }

  const getFilteredFiles = () => {
    let filtered = files

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filterStatus)
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file.name.localeCompare(b.file.name)
        case 'size':
          return b.file.size - a.file.size
        case 'type':
          return a.type.localeCompare(b.type)
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }

  const analyzeBatch = async () => {
    if (files.length === 0) return
    
    setAnalyzing(true)
    setPaused(false)
    setProgress(0)
    
    const filesToProcess = files.filter(f => f.status === 'pending' || f.status === 'error')
    const results: any[] = []
    
    if (processingMode === 'parallel') {
      // Process files in parallel batches
      const batches = []
      for (let i = 0; i < filesToProcess.length; i += maxConcurrent) {
        batches.push(filesToProcess.slice(i, i + maxConcurrent))
      }
      
      for (const batch of batches) {
        if (paused) break
        
        const batchPromises = batch.map(async (file) => {
          if (paused) return
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'analyzing', progress: 0 } : f
          ))
          
          try {
            const result = await analyzeFile(file)
            
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'complete', result, progress: 100 } : f
            ))
            
            results.push(result)
          } catch (error: any) {
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'error', error: error.message } : f
            ))
          }
        })
        
        await Promise.all(batchPromises)
        setProgress(((results.length + batch.length) / filesToProcess.length) * 100)
      }
    } else {
      // Process files sequentially
      for (let i = 0; i < filesToProcess.length; i++) {
        if (paused) break
        
        const file = filesToProcess[i]
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'analyzing', progress: 0 } : f
        ))
        
        try {
          const result = await analyzeFile(file)
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'complete', result, progress: 100 } : f
          ))
          
          results.push(result)
        } catch (error: any) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error', error: error.message } : f
          ))
        }
        
        setProgress(((i + 1) / filesToProcess.length) * 100)
      }
    }
    
    setAnalyzing(false)
    
    if (onBatchComplete && results.length > 0) {
      onBatchComplete(results)
    }
  }

  const analyzeFile = async (batchFile: BatchFile): Promise<any> => {
    // Simulate file analysis with progress updates
    const steps = 10
    for (let step = 0; step < steps; step++) {
      if (paused) throw new Error('Analysis paused')
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setFiles(prev => prev.map(f => 
        f.id === batchFile.id ? { ...f, progress: ((step + 1) / steps) * 100 } : f
      ))
    }
    
    // Determine API endpoint based on file type
    let endpoint = '/api/analyze'
    if (batchFile.type === 'image') {
      endpoint = '/api/analyze-image'
    } else if (batchFile.type === 'video') {
      endpoint = '/api/analyze-video'
    }
    
    // Create appropriate request based on file type
    let response
    if (batchFile.type === 'video' || batchFile.type === 'image') {
      const formData = new FormData()
      formData.append(batchFile.type, batchFile.file)
      
      response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })
    } else {
      const text = await batchFile.file.text()
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          analysisType: 'document-risk',
          fileName: batchFile.file.name
        })
      })
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Analysis failed')
    }
    
    return data.analysis
  }

  const pauseResume = () => {
    setPaused(!paused)
    if (paused) {
      // Resume analysis
      analyzeBatch()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'analyzing': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCount = files.filter(f => f.status === 'complete').length
  const errorCount = files.filter(f => f.status === 'error').length
  const filteredFiles = getFilteredFiles()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Enhanced Batch Analysis
        </CardTitle>
        <CardDescription>
          Advanced batch processing with priority queues, filtering, and parallel execution (up to {maxFiles} files)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx,image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="enhanced-batch-upload"
            disabled={analyzing || files.length >= maxFiles}
          />
          <label htmlFor="enhanced-batch-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {files.length >= maxFiles ? `Maximum ${maxFiles} files reached` : 'Click to select files or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {files.length}/{maxFiles} files • Supports documents, images, and videos
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  onClick={selectAll}
                  variant="outline"
                >
                  {filteredFiles.every(f => selectedFiles.includes(f.id)) ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedFiles.length > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeSelected}
                  >
                    Remove Selected ({selectedFiles.length})
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="analyzing">Analyzing</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="size">Sort by Size</SelectItem>
                    <SelectItem value="type">Sort by Type</SelectItem>
                    <SelectItem value="priority">Sort by Priority</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Processing Settings */}
            <div className="flex gap-4 items-center p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Processing:</span>
              </div>
              
              <Select value={processingMode} onValueChange={(v) => setProcessingMode(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parallel">Parallel</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                </SelectContent>
              </Select>
              
              {processingMode === 'parallel' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Max Concurrent:</span>
                  <Select value={maxConcurrent.toString()} onValueChange={(v) => setMaxConcurrent(parseInt(v))}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* File List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => toggleFileSelection(file.id)}
                  />
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    {getStatusIcon(file.status)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{(file.file.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="capitalize">{file.type}</span>
                        {file.progress !== undefined && file.status === 'analyzing' && (
                          <>
                            <span>•</span>
                            <span>{Math.round(file.progress)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Badge className={getPriorityColor(file.priority)}>
                      {file.priority}
                    </Badge>
                    
                    {file.result && (
                      <Badge className={
                        file.result.riskLevel === 'Critical' ? 'bg-red-600 text-white' :
                        file.result.riskLevel === 'High' ? 'bg-orange-600 text-white' :
                        file.result.riskLevel === 'Medium' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      }>
                        {file.result.riskScore || file.result.overallAuthenticityScore || 'N/A'}/100
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Select value={file.priority} onValueChange={(v) => setPriority(file.id, v as any)}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    
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
                </div>
              ))}
            </div>

            {/* Progress */}
            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {paused ? 'Paused' : 'Processing batch...'} 
                    ({completedCount}/{files.filter(f => f.status !== 'pending').length})
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!analyzing ? (
                <Button 
                  onClick={analyzeBatch}
                  disabled={files.length === 0 || files.every(f => f.status === 'complete')}
                  className="flex-1"
                >
                  Analyze {files.filter(f => f.status === 'pending' || f.status === 'error').length} File(s)
                </Button>
              ) : (
                <Button 
                  onClick={pauseResume}
                  variant="outline"
                  className="flex-1"
                >
                  {paused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {paused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => {
                  setFiles([])
                  setSelectedFiles([])
                  setProgress(0)
                }}
              >
                Clear All
              </Button>
            </div>

            {/* Summary */}
            {(completedCount > 0 || errorCount > 0) && (
              <div className="flex gap-2 text-sm">
                {completedCount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {completedCount} completed
                  </Badge>
                )}
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