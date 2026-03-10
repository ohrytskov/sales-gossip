export const detectSlowConnection = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const connection = window.navigator?.connection

  if (!connection) {
    return false
  }

  const { effectiveType, rtt, downlink } = connection

  return effectiveType === 'slow-2g' || rtt >= 1000 || downlink <= 0.5
}
