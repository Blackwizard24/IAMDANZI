import assert from 'node:assert/strict'
import { test } from 'node:test'
import { watchBadgeMotion } from './badgeMotion.js'

test('badge follows visibility and live reduced-motion changes, then releases listeners', () => {
    const originalWindow = globalThis.window
    const originalObserver = globalThis.IntersectionObserver
    let listener, intersect, disconnected = false
    const preference = { matches: true, addEventListener: (_, fn) => { listener = fn }, removeEventListener: (_, fn) => { assert.equal(fn, listener); listener = null } }
    globalThis.window = { matchMedia: () => preference }
    globalThis.IntersectionObserver = class {
        constructor(fn) { intersect = fn }
        observe() {}
        disconnect() { disconnected = true }
    }
    try {
        let state
        const cleanup = watchBadgeMotion({}, (value) => { state = value })
        assert.deepEqual(state, { reduced: true, visible: true })
        intersect([{ isIntersecting: false }])
        assert.equal(state.visible, false)
        preference.matches = false
        listener()
        assert.deepEqual(state, { reduced: false, visible: false })
        intersect([{ isIntersecting: true }])
        assert.equal(state.visible, true)
        cleanup()
        assert.equal(listener, null)
        assert.equal(disconnected, true)
    } finally {
        globalThis.window = originalWindow
        globalThis.IntersectionObserver = originalObserver
    }
})
