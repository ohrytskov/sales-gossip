#!/usr/bin/env node
import fetch from 'node-fetch'
import getStdin from 'get-stdin'

async function main() {
  const token = process.env.FIGMA_TOKEN
  const mcpUrl = 'https://mcp.figma.com/mcp'
  const input = await getStdin()

  const resp = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: input
  })

  const data = await resp.json()
  process.stdout.write(JSON.stringify(data))
}

main()
