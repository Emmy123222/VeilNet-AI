'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText } from 'lucide-react'

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
  { value: 'document-risk', label: 'Document Risk Assessment' },
  { value: 'deepfake-detection', label: 'Deepfake Detection' },
  { value: 'medical-summary', label: 'Medical Document Summary' },
  { value: 'resume-analysis', label: 'Resume Analysis' },
  { value: 'financial-fraud', label: 'Financial Fraud Detection' },
  { value: 'content-moderation', label: 'Content Moderation' }
]

export function FileUploadForm({
  selectedFile,
  analysisType,
  onFileSelect,
  onAnalysisTypeChange,
  onAnalyze,
  analyzing,
  connected
}: FileUploadFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload & Analyze</CardTitle>
        <CardDescription>
          Select a file and analysis type to begin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              onChange={onFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Analysis Type</label>
          <Select value={analysisType} onValueChange={onAnalysisTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              {analysisTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onAnalyze}
          disabled={!selectedFile || !analysisType || !connected || analyzing}
          className="w-full"
        >
          {analyzing ? 'Analyzing...' : 'Start Analysis'}
        </Button>
      </CardContent>
    </Card>
  )
}
