#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🧹 Clearing Next.js build cache...')

const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo'
]

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true })
    console.log(`✅ Deleted: ${folderPath}`)
    return true
  }
  return false
}

let clearedAny = false

cacheDirs.forEach(dir => {
  if (deleteFolderRecursive(dir)) {
    clearedAny = true
  }
})

if (clearedAny) {
  console.log('🎉 Build cache cleared successfully!')
  console.log('💡 Now run: npm run dev or npm run build')
} else {
  console.log('ℹ️  No cache directories found to clear')
}