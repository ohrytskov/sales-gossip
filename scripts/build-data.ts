import fs from 'fs'
import path from 'path'
import vm from 'vm'

const dataDir = path.join(__dirname, '..', 'src', 'data')
const outFile = path.join(dataDir, 'data.json')

const files: string[] = ['topics.ts', 'suggestedUsers.ts', 'samplePosts.ts', 'sampleFeed.ts', 'companies.ts']

function extractDefaultExport(content: string): string {
  const m = content.match(/const\s+(\w+)\s*=\s*([\s\S]*?)\nexport\s+default/)
  if (!m) throw new Error('Could not find default export')
  return m[2]
}

function parseLiteral(literal: string): unknown {
  literal = literal.replace(/;\s*$/m, '')
  const script = new vm.Script('(' + literal + ')')
  return script.runInNewContext({})
}

const result: Record<string, unknown> = {}
for (const f of files) {
  const p = path.join(dataDir, f)
  if (!fs.existsSync(p)) {
    console.warn('Skipping missing file', p)
    continue
  }
  const content = fs.readFileSync(p, 'utf8')
  try {
    const literal = extractDefaultExport(content)
    const value = parseLiteral(literal)
    const key = path.basename(f, '.ts')
    result[key] = value
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Failed to parse', f, message)
    process.exitCode = 2
  }
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n')
console.log('Wrote', outFile)
