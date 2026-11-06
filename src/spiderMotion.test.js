import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSpider, moveSpider } from './spiderMotion.js'

test('spider catches a stationary fly and resumes following when released', () => {
    const spider = createSpider(0, 0)
    for (let i = 0; i < 240; i++) moveSpider(spider, { x: 150, y: 0 }, 1 / 60, true)
    assert.equal(spider.caught, true)
    const previous = spider.x
    spider.caught = false
    for (let i = 0; i < 60; i++) moveSpider(spider, { x: 400, y: 0 }, 1 / 60, false)
    assert.ok(spider.x > previous + 50)
    assert.equal(spider.caught, false)
})
test('stance feet stay planted while the body advances', () => {
    const spider = createSpider(0, 0)
    moveSpider(spider, { x: 400, y: 0 }, 1 / 60, false)
    const feet = spider.feet.map(foot => ({ x: foot.x, y: foot.y }))
    const previous = spider.x
    moveSpider(spider, { x: 400, y: 0 }, 1 / 60, false)
    assert.ok(spider.x > previous)
    assert.ok(spider.feet.filter((foot, i) => foot.x === feet[i].x && foot.y === feet[i].y).length >= 4)
})
