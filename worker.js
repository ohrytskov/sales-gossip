if (typeof globalThis.WeakRef === 'undefined') {
  globalThis.WeakRef = class WeakRef {
    constructor(value) {
      this._value = value
    }
    deref() {
      return this._value
    }
  }
}

if (typeof globalThis.FinalizationRegistry === 'undefined') {
  globalThis.FinalizationRegistry = class FinalizationRegistry {
    register() {}
    unregister() {
      return false
    }
  }
}

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js'
import worker from './.open-next/worker.js'

export default worker

