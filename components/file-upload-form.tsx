'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  File, 
  Image, 
  AlertCircle, 
  CheckCircle,
  Hash,
  HardDrive,
  Shield,
  Lock
} from 'lucide-react'

interface FileUploadFormProps {
  selectedFile: File | null
  analysisType: string
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAnalysisTypeChange: (value: string) => void
  onAnalyze: () => void
  analyzing: boolean
  connected: boolean
}

const analysisTypes = [
  { value: 'document-risk', label: 'Document Risk Assessment', description: 'Comprehensive risk analysis for legal and business documents' },
  { value: 'deepfake-detection', label: 'Deepfake Detection', description: 'AI-powered detection of manipulated images and videos' },
  { value: 'medical-summary', label: 'Medical Document Summary', description: 'HIPAA-compliant medical document analysis' },
  { value: 'resume-analysis', label: 'Resume Analysis', description: 'Skills assessment and qualification verification' },
  { value: 'financial-fraud', label: 'Financial Fraud Detection', description: 'Transaction analysis and fraud pattern detection' },
  { value: 'content-moderation', label: 'Content Moderation', description: 'Policy violation and harmful content detection' }
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF Document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'Word Document' },
  'application/msword': { icon: FileText, label: 'Word Document' },
  'text/plain': { icon: File, label: 'Text File' },
  'image/jpeg': { icon: Image, label: 'JPEG Image' },
  'image/jpg': { icon: Image, label: 'JPG Image' },
  'image/png': { icon: Image, label: 'PNG Image' }
}

export function FileUploadForm({
  selectedFile,
  analysisType,
  onFileSelect,
  onAnalysisTypeChange,
  onAnalyze,
  analyzing,
  connected
}: FileUploadFormProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileHash, setFileHash] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
    }
    
    if (!Object.keys(SUPPORTED_TYPES).includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please upload PDF, DOCX, TXT, or image files.`
    }
    
    return null
  }

  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    
    // Generate file hash for integrity verification
    try {
      const hash = await generateFileHash(file)
      setFileHash(hash)
    } catch (error) {
      console.error('Failed to generate file hash:', error)
    }

    onFileSelect(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const error = validateFile(file)
      if (error) {
        setValidationError(error)
        return
      }
      
      // Create a synthetic event for the file input
      const input = document.getElementById('file-upload') as HTMLInputElement
      if (input) {
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        
        const event = new Event('change', { bubbles: true })
        Object.defineProperty(event, 'target', { value: input })
        handleFileSelect(event as any)
      }
    }
  }

  const getFileIcon = (file: File) => {
    const typeInfo = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    const IconComponent = typeInfo?.icon || File
    return <IconComponent className="h-8 w-8 text-primary" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const selectedAnalysisType = analysisTypes.find(type => type.value === analysisType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload & Analyze
        </CardTitle>
        <CardDescription>
          🔒 TRUE PRIVACY: Files are analyzed entirely in your browser - never uploaded to any server. 
          Only cryptographic proofs are submitted to the blockchain for verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : validationError 
                ? 'border-red-300 bg-red-50' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    {getFileIcon(selectedFile)}
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {SUPPORTED_TYPES[selectedFile.type as keyof typeof SUPPORTED_TYPES]?.label}
                      </p>
                    </div>
                  </div>
                  
                  {fileHash && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="text-xs font-medium">File Hash (SHA-256)</span>
                      </div>
                      <code className="text-xs font-mono break-all">{fileHash}</code>
                    </div>
                  )}
                  
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Lock className="h-3 w-3 mr-1" />
                    Client-Side Only - Never Uploaded
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, TXT, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {/* File Size Indicator */}
          {selectedFile && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>File Size</span>
                <span>{formatFileSize(selectedFile.size)} / 10MB</span>
              </div>
              <Progress value={(selectedFile.size / MAX_FILE_SIZE) * 100} className="h-1" />
            </div>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Analysis Type</label>
          <Select value={analysisType} onValueChange={onAnalysisTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              {analysisTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedAnalysisType && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedAnalysisType.description}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={onAnalyze}
          disabled={!selectedFile || !analysisType || !connected || analyzing || !!validationError}
          className="w-full"
          size="lg"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Locally...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Analyze Privately & Generate Proof
            </>
          )}
        </Button>

        {/* Privacy Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Privacy Guarantee:</strong> Your file is processed entirely in your browser. 
            No data is sent to our servers. Only cryptographic hashes are submitted to the blockchain for verification.
          </AlertDescription>
        </Alert>

        {/* Supported File Types */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Supported File Types:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SUPPORTED_TYPES).map(([type, info]) => (
              <div key={type} className="flex items-center gap-2">
                <info.icon className="h-3 w-3" />
                <span>{info.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}