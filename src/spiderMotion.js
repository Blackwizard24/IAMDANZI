// Coordinates are measured along the spider's spine (forward) and away from it.
// Each row is one mirrored pair: the longest pairs reach ahead and behind,
// while the middle pairs occupy separate lanes to the sides of the thorax.
const stance = [
    { root: 11, knee: [24, 16], ankle: [41, 22], toe: [51, 20] },
    { root: 7, knee: [17, 22], ankle: [25, 35], toe: [32, 39] },
    { root: 3, knee: [-7, 22], ankle: [-17, 33], toe: [-23, 39] },
    { root: -1, knee: [-21, 15], ankle: [-37, 22], toe: [-49, 22] },
]

export function createSpider(x, y) {
    return { x, y, heading: 0, phase: 0, caught: false, feet: [] }
}

export function moveSpider(spider, target, dt, resting, canCatch = true) {
    const dx = target.x - spider.x, dy = target.y - spider.y
    const distance = Math.hypot(dx, dy)
    const gap = resting && canCatch ? 16 : 78
    const closing = resting && canCatch
    const speed = spider.caught ? 0 : Math.min(closing ? 1600 : 250, Math.max(0, distance - gap) * (closing ? 10 : 5))
    if (speed > .5) {
        const angle = Math.atan2(dy, dx)
        const difference = Math.atan2(Math.sin(angle - spider.heading), Math.cos(angle - spider.heading))
        spider.heading += difference * (1 - Math.exp(-10 * dt))
        spider.x += dx / distance * speed * dt
        spider.y += dy / distance * speed * dt
        spider.phase += speed * dt / 18
    }
    if (resting && canCatch && distance < 19) spider.caught = true

    const cos = Math.cos(spider.heading), sin = Math.sin(spider.heading)
    const world = (x, y) => ({ x: spider.x + x * cos - y * sin, y: spider.y + x * sin + y * cos })
    const legs = []
    for (const side of [-1, 1]) {
        stance.forEach((pose, i) => {
            const index = legs.length
            const rest = world(pose.toe[0], side * pose.toe[1])
            const desired = world(pose.toe[0] + speed * .036, side * pose.toe[1])
            const foot = spider.feet[index] ??= { ...rest, progress: 1 }
            const error = Math.hypot(foot.x - desired.x, foot.y - desired.y)
            const steppingGroup = (i + (side === 1 ? 1 : 0)) % 2 === Math.floor(spider.phase) % 2
            if (foot.progress === 1 && (error > 21 || error > 8 && steppingGroup || speed < 1 && error > 1)) {
                foot.from = { x: foot.x, y: foot.y }
                foot.to = desired
                foot.progress = 0
            }
            if (foot.progress < 1) {
                foot.progress = Math.min(1, foot.progress + dt / .12)
                const t = foot.progress ** 2 * (3 - 2 * foot.progress)
                foot.x = foot.from.x + (foot.to.x - foot.from.x) * t
                foot.y = foot.from.y + (foot.to.y - foot.from.y) * t
            }
            const lift = Math.sin(Math.PI * foot.progress)
            const joint = (point, weight, z) => {
                const position = world(point[0], side * point[1])
                return { x: position.x + (foot.x - rest.x) * weight, y: position.y + (foot.y - rest.y) * weight, z: z + lift * 4 }
            }
            legs.push({
                hip: { ...world(pose.root, side * 5), z: 9 },
                knee: joint(pose.knee, .18, 16),
                ankle: joint(pose.ankle, .6, 5),
                foot: { x: foot.x, y: foot.y, z: 1 + lift * 5 },
            })
        })
    }
    return { legs, speed }
}
