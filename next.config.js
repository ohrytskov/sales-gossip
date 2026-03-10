const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER

  if (isDevServer) {
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare')
    initOpenNextCloudflareForDev()
  }

  return {
    reactStrictMode: false,
    distDir: isDevServer ? '.next-dev' : '.next',
  }
}
