'use client';

import React from "react"

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader, CheckCircle } from 'lucide-react';

interface AnalysisResult {
  id: string;
  filename: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  imagePreview: string;
  result?: {
    type: string;
    confidence: number;
    summary: string;
    risks: string[];
    flags: string[];
  };
  proofHash?: string;
  timestamp?: string;
}

interface ImageUploadAnalyzerProps {
  walletAddress?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function ImageUploadAnalyzer({
  walletAddress,
  onAnalysisComplete,
}: ImageUploadAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);

  const processFile = async (file: File) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imagePreview = e.target?.result as string;
      const result: AnalysisResult = {
        id: Math.random().toString(36).slice(2),
        filename: file.name,
        status: 'uploading',
        imagePreview,
      };

      setAnalyses((prev) => [result, ...prev]);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update to analyzing
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === result.id ? { ...a, status: 'analyzing' } : a
        )
      );

      // Simulate analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate proof generation
      const mockProofHash =
        '0x' + Math.random().toString(16).slice(2, 66);

      const completedResult: AnalysisResult = {
        ...result,
        status: 'complete',
        result: {
          type: 'Deepfake Detection',
          confidence: Math.random() * 100,
          summary:
            'Image analyzed for authenticity and potential deepfake indicators.',
          risks: [
            'Minor facial distortion detected',
            'Lighting inconsistencies',
          ],
          flags: Math.random() > 0.5 ? ['Review Recommended'] : [],
        },
        proofHash: mockProofHash,
        timestamp: new Date().toISOString(),
      };

      setAnalyses((prev) =>
        prev.map((a) => (a.id === result.id ? completedResult : a))
      );

      onAnalysisComplete?.(completedResult);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-muted hover:border-accent transition-colors">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-12 text-center cursor-pointer transition-colors ${
            isDragging ? 'bg-accent/5' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-foreground font-medium">
                Drag and drop your image here
              </p>
              <p className="text-sm text-muted-foreground">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent hover:underline"
                >
                  click to select
                </button>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: JPG, PNG, WebP
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Analysis History
          </h3>
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={analysis.imagePreview || "/placeholder.svg"}
                    alt={analysis.filename}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground truncate">
                        {analysis.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.timestamp
                          ? new Date(analysis.timestamp).toLocaleString()
                          : 'Processing...'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.status === 'uploading' && (
                        <Loader className="w-4 h-4 text-accent animate-spin" />
                      )}
                      {analysis.status === 'analyzing' && (
                        <Loader className="w-4 h-4 text-accent animate-spin" />
                      )}
                      {analysis.status === 'complete' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Status Text */}
                  <p className="text-xs text-muted-foreground mb-3">
                    {analysis.status === 'uploading' && 'Uploading...'}
                    {analysis.status === 'analyzing' &&
                      'Analyzing image with privacy-preserving inference...'}
                    {analysis.status === 'complete' && 'Analysis complete'}
                  </p>

                  {/* Results */}
                  {analysis.result && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm font-medium text-foreground">
                            {analysis.result.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Confidence
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {analysis.result.confidence.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {analysis.result.summary && (
                        <p className="text-sm text-foreground">
                          {analysis.result.summary}
                        </p>
                      )}

                      {analysis.result.risks.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Detected Risks
                          </p>
                          <ul className="text-xs text-foreground space-y-1">
                            {analysis.result.risks.map((risk, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-yellow-500">•</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.result.flags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {analysis.result.flags.map((flag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}

                      {analysis.proofHash && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            ZK Proof Hash
                          </p>
                          <code className="text-xs text-accent font-mono break-all">
                            {analysis.proofHash.slice(0, 20)}...
                            {analysis.proofHash.slice(-20)}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
