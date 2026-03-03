import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

// File type handlers
const extractTextFromPDF = async (buffer: ArrayBuffer): Promise<string> => {
  return `[PDF Content Extracted]\n\nThis is a placeholder for PDF text extraction. In production, this would use a library like pdf-parse to extract actual text content from the PDF file.\n\nDocument contains ${Math.floor(buffer.byteLength / 1024)}KB of data.`
}

const extractTextFromDOCX = async (buffer: ArrayBuffer): Promise<string> => {
  return `[DOCX Content Extracted]\n\nThis is a placeholder for DOCX text extraction. In production, this would use a library like mammoth to extract actual text content from the Word document.\n\nDocument contains ${Math.floor(buffer.byteLength / 1024)}KB of data.`
}

const extractTextFromImage = async (buffer: ArrayBuffer): Promise<string> => {
  return `[Image OCR Analysis]\n\nThis is a placeholder for image text extraction using OCR. In production, this would use Tesseract.js or a cloud OCR service to extract text from images.\n\nImage size: ${Math.floor(buffer.byteLength / 1024)}KB`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const analysisType = formData.get('analysisType') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()

    // ✅ FIX: Generate file hash WITHOUT 0x prefix — Aleo does not use 0x
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // ← 0x removed

    // Extract text based on file type
    let extractedText: string

    try {
      switch (file.type) {
        case 'application/pdf':
          extractedText = await extractTextFromPDF(buffer)
          break
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          extractedText = await extractTextFromDOCX(buffer)
          break
        case 'text/plain':
          extractedText = new TextDecoder().decode(buffer)
          break
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/png':
          extractedText = await extractTextFromImage(buffer)
          break
        default:
          throw new Error('Unsupported file type for text extraction')
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to extract text from file' },
        { status: 500 }
      )
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Insufficient text content extracted from file' },
        { status: 400 }
      )
    }

    // ✅ documentHash — clean hex, no 0x prefix, safe for Aleo
    const documentHash = createHash('sha256')
      .update(extractedText)
      .digest('hex') // digest('hex') never adds 0x — already correct

    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
        hash: fileHash,        // ✅ No 0x — file integrity hash
        documentHash,          // ✅ No 0x — use this for Aleo submission
      },
      extractedText: extractedText.substring(0, 5000),
      textLength: extractedText.length,
      analysisType: analysisType || 'document-risk'
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    )
  }
}