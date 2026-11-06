import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'

test('badge assets exist with the exact filename case used by the loaders', () => {
    const files = readdirSync(new URL('../public/', import.meta.url))
    const source = readFileSync(new URL('./Band.jsx', import.meta.url), 'utf8')
    const assets = [...source.matchAll(/use(?:Texture|GLTF)(?:\.preload)?\('\/([^']+)'\)/g)]
    assert.ok(assets.length > 0)
    for (const [, name] of assets) {
        assert.ok(files.includes(name), `Missing asset or incorrect filename case: ${name}`)
    }
})
