'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Cloud, Laptop, CheckCircle, AlertTriangle } from 'lucide-react'
import { checkOllamaStatus } from '@/lib/ollama-service'

interface AIProviderSelectorProps {
  value: 'cloud' | 'local'
  onChange: (value: 'cloud' | 'local') => void
}

export function AIProviderSelector({ value, onChange }: AIProviderSelectorProps) {
  const [ollamaAvailable, setOllamaAvailable] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkOllama()
  }, [])

  const checkOllama = async () => {
    setChecking(true)
    const available = await checkOllamaStatus()
    setOllamaAvailable(available)
    setChecking(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          AI Provider Selection
        </CardTitle>
        <CardDescription>
          Choose where your AI analysis runs - cloud or locally on your machine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={value} onValueChange={(v) => onChange(v as 'cloud' | 'local')}>
          {/* Cloud Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="cloud" id="cloud" />
            <div className="flex-1">
              <Label htmlFor="cloud" className="flex items-center cursor-pointer">
                <Cloud className="h-4 w-4 mr-2" />
                Cloud AI (Groq)
                <Badge variant="secondary" className="ml-2">Fast</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Uses Groq's Llama 3.3 70B model. Fast and powerful, but data is processed on our servers.
              </p>
            </div>
          </div>

          {/* Local Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="local" id="local" disabled={!ollamaAvailable} />
            <div className="flex-1">
              <Label htmlFor="local" className="flex items-center cursor-pointer">
                <Laptop className="h-4 w-4 mr-2" />
                Local AI (Ollama)
                <Badge variant="secondary" className="ml-2">Zero Trust</Badge>
                {ollamaAvailable ? (
                  <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 ml-2 text-orange-600" />
                )}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Runs AI on your machine. Data NEVER leaves your device. Requires Ollama installed.
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Ollama Status Alert */}
        {!checking && !ollamaAvailable && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Ollama not detected.</strong> To use local AI:
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Install Ollama from <a href="https://ollama.ai" target="_blank" className="underline">ollama.ai</a></li>
                <li>Run: <code className="bg-orange-100 px-1 rounded">ollama pull llama3.2</code></li>
                <li>Start Ollama: <code className="bg-orange-100 px-1 rounded">ollama serve</code></li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {ollamaAvailable && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Ollama is running!</strong> You can now use local AI for maximum privacy.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
