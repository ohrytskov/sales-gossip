export const buildCompaniesSearchBody = (q = '') => {
  return {
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: 'You - helpful search companies assistant. Return please result as an array of JSON objects with companies names and websites URLs. Return empty array if no results found.'
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Lets try to find nine popular U.S. companies that contain term ${q} in title.`
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'companies_list',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              description: 'Array of companies with their names and website URLs.',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the company.'
                  },
                  website_url: {
                    type: 'string',
                    description: 'The website URL of the company.'
                  }
                },
                required: ['name', 'website_url'],
                additionalProperties: false
              }
            }
          },
          required: ['companies'],
          additionalProperties: false
        }
      }
    },
    reasoning: {},
    tools: [
      {
        type: 'web_search',
        user_location: {
          type: 'approximate',
          country: 'US'
        },
        search_context_size: 'high'
      }
    ],
    store: false,
  }
}

export const parseCompaniesFromOpenAiResponse = (json) => {
  let content = ''
  if (Array.isArray(json?.output)) {
    const msg = json.output.filter(o => o.type === 'message').pop()
    content = msg?.content?.[0]?.text ?? ''
  } else {
    content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? ''
  }

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch {
    const objMatch = content.match(/\{[\s\S]*\}/)
    const arrMatch = content.match(/\[[\s\S]*\]/)
    const substr = objMatch ? objMatch[0] : (arrMatch ? arrMatch[0] : null)
    try {
      parsed = substr ? JSON.parse(substr) : null
    } catch {
      parsed = null
    }
  }

  if (Array.isArray(parsed)) return parsed
  if (parsed && Array.isArray(parsed.companies)) return parsed.companies
  return []
}

