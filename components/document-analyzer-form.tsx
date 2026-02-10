'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield, FileText } from 'lucide-react'

interface DocumentAnalyzerFormProps {
  documentText: string
  setDocumentText: (text: string) => void
  onAnalyze: () => void
  analyzing: boolean
  submittingToAleo: boolean
}

export function DocumentAnalyzerForm({
  documentText,
  setDocumentText,
  onAnalyze,
  analyzing,
  submittingToAleo
}: DocumentAnalyzerFormProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Enter Document Text
        </CardTitle>
        <CardDescription>
          Paste or type your document content below. It will be hashed and analyzed privately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter your document text here... (minimum 10 characters)"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          rows={10}
          className="font-mono text-sm"
          disabled={analyzing || submittingToAleo}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {documentText.length} characters
          </span>
          <Button
            onClick={onAnalyze}
            disabled={analyzing || submittingToAleo || documentText.length < 10}
          >
            {analyzing || submittingToAleo ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {analyzing ? 'Analyzing...' : 'Submitting to Aleo...'}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
