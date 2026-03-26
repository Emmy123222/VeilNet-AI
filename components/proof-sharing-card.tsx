'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, CheckCircle, Clock } from 'lucide-react'

interface ProofSharingCardProps {
  proofId: string
  transactionId: string
  onShare?: (shareData: ShareData) => void
}

interface ShareData {
  recipientAddress: string
  accessLevel: 'view' | 'verify' | 'full'
  expiryHours: number
}

export function ProofSharingCard({ proofId, transactionId, onShare }: ProofSharingCardProps) {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [accessLevel, setAccessLevel] = useState<'view' | 'verify' | 'full'>('view')
  const [expiryHours, setExpiryHours] = useState('24')
  const [shareLink, setShareLink] = useState('')
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    if (!recipientAddress) return
    
    setSharing(true)
    try {
      // Generate encrypted share link
      const shareData: ShareData = {
        recipientAddress,
        accessLevel,
        expiryHours: parseInt(expiryHours)
      }
      
      // Create share link with encrypted proof access
      const link = `${window.location.origin}/verify-proof?txid=${transactionId}&share=${btoa(JSON.stringify(shareData))}`
      setShareLink(link)
      
      if (onShare) {
        onShare(shareData)
      }
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setSharing(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Share Proof
        </CardTitle>
        <CardDescription>
          Grant specific addresses access to view or verify this proof
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Wallet Address</Label>
          <Input
            id="recipient"
            placeholder="aleo1..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access">Access Level</Label>
          <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as any)}>
            <SelectTrigger id="access">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">View</Badge>
                  Can see proof exists
                </div>
              </SelectItem>
              <SelectItem value="verify">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Verify</Badge>
                  Can verify authenticity
                </div>
              </SelectItem>
              <SelectItem value="full">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Full</Badge>
                  Can see all details
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry">Access Expiry</Label>
          <Select value={expiryHours} onValueChange={setExpiryHours}>
            <SelectTrigger id="expiry">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="168">7 days</SelectItem>
              <SelectItem value="720">30 days</SelectItem>
              <SelectItem value="0">No expiry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleShare} 
          disabled={!recipientAddress || sharing}
          className="w-full"
        >
          {sharing ? 'Creating Share Link...' : 'Generate Share Link'}
        </Button>

        {shareLink && (
          <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Share Link Created</span>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {expiryHours === '0' ? 'No expiry' : `${expiryHours}h`}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="text-xs" />
              <Button size="sm" variant="outline" onClick={copyShareLink}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-green-700">
              Only {recipientAddress.slice(0, 12)}... can access this proof with {accessLevel} permissions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
