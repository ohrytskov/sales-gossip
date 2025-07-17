import get from 'lodash.get'

export const detectSlowConnection = () => {
    if (!window) {
        return false
    }
    if (get(window, 'navigator.connection')) {
        const { effectiveType, rtt, downlink } = get(window, 'navigator.connection')

        // Check the effectiveType and downlink values to determine the network speed
        if (effectiveType === 'slow-2g' || rtt >= 1000 || downlink <= 0.5) {
            // Connection is slow or of poor quality
            return true
        }
    }
    return false;
}