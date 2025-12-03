#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

function safeExec(cmd) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' }
}

const commit = safeExec('git rev-parse --short HEAD') || 'unknown'
const branch = safeExec('git rev-parse --abbrev-ref HEAD') || 'unknown'
const status = new Date().toISOString()

let middlewareHash = ''
try {
  const content = readFileSync('middleware.ts', 'utf8')
  middlewareHash = createHash('sha256').update(content).digest('hex').slice(0, 12)
} catch {}

const payload = { timestamp: status, git: { commit, branch }, artifacts: { middlewareHash } }
mkdirSync('public', { recursive: true })
writeFileSync('public/build-info.json', JSON.stringify(payload, null, 2))
console.log('Generated public/build-info.json:', payload)
