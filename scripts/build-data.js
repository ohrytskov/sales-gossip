const fs = require('fs')
const path = require('path')
const vm = require('vm')

const dataDir = path.join(__dirname, '..', 'src', 'data')
const outFile = path.join(dataDir, 'data.json')

const files = ['topics.js', 'suggestedUsers.js', 'samplePosts.js', 'sampleFeed.js', 'companies.js']

function extractDefaultExport(content) {
  const m = content.match(/const\s+(\w+)\s*=\s*([\s\S]*?)\nexport\s+default/) 
  if (!m) throw new Error('Could not find default export')
  return m[2]
}

function parseLiteral(literal) {
  // Remove trailing semicolon(s) then wrap expression in parentheses to allow object/array top-level
  literal = literal.replace(/;\s*$/m, '')
  const script = new vm.Script('(' + literal + ')')
  return script.runInNewContext({})
}

const result = {}
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
    const key = path.basename(f, '.js')
    result[key] = value
  } catch (err) {
    console.error('Failed to parse', f, err.message)
    process.exitCode = 2
  }
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n')
console.log('Wrote', outFile)
