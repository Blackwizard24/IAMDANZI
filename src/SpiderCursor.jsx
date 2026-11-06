import { useEffect, useRef } from 'react'
import { createSpider, moveSpider } from './spiderMotion'
import { createCursorScene } from './cursorScene'

const controls = 'a,button,input,textarea,select,canvas:not(.web-cursor),dialog'

export default function SpiderCursor() {
    const ref = useRef(null)
    useEffect(() => {
        const canvas = ref.current
        const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
        let view, failed = false, frame = 0, previous = 0, moved = 0, jump = 0
        let visible = false, overControl = false, caughtAt = null
        const spider = createSpider(innerWidth / 2, -25)
        let target = { x: spider.x, y: 0 }
        const fly = { ...target, heading: 0 }
        let anchors = [{ ...target, z: 3 }]

        function clearWeb() {
            view?.clearWeb()
            anchors = [{ x: spider.x, y: spider.y, z: 4 }]
        }
        function resize() {
            view?.resize(innerWidth, innerHeight)
            clearWeb()
        }
        function stop() {
            cancelAnimationFrame(frame)
            frame = 0
            previous = 0
            view?.clear()
            document.documentElement.classList.remove('fly-cursor')
        }
        function draw(time) {
            frame = 0
            if (!visible || !media.matches || document.hidden || !view) return
            const dt = Math.min((time - (previous || time)) / 1000, .04)
            previous = time
            const resting = time - moved > 450
            const dx = target.x - fly.x, dy = target.y - fly.y
            if (Math.hypot(dx, dy) > 1) fly.heading = Math.atan2(dy, dx)
            fly.x += dx * (1 - Math.exp(-28 * dt))
            fly.y += dy * (1 - Math.exp(-28 * dt))
            const { legs } = moveSpider(spider, fly, dt, resting, !overControl)
            jump = Math.max(0, jump - dt)
            let anchor = anchors.at(-1)
            if (Math.hypot(spider.x-anchor.x, spider.y-anchor.y) > 95) {
                const next = { x: spider.x, y: spider.y, z: 4 }
                view.addThread(anchor, next)
                const neighbor = anchors.slice(0, -2).find(p => Math.hypot(next.x-p.x, next.y-p.y) < 175)
                if (neighbor) view.addThread(neighbor, next)
                anchors.push(next)
                if (anchors.length > 18) anchors.shift()
                anchor = next
            }
            canvas.dataset.huntState = spider.caught ? 'caught' : resting ? 'approaching' : 'following'
            if (spider.caught) caughtAt ??= time
            const bite = caughtAt === null ? 0 : Math.min(1, (time - caughtAt) / 200)
            // Hold the bite briefly before resting until the next pointer movement.
            if (caughtAt !== null && time - caughtAt > 650) {
                view.clear()
                return
            }
            view.draw(spider, legs, fly, anchor, !overControl, resting, time, jump, bite)
            if (time - moved < 8000 || (!spider.caught && !overControl)) frame = requestAnimationFrame(draw)
        }
        function start() {
            if (!frame && view && visible && media.matches && !document.hidden) frame = requestAnimationFrame(draw)
        }
        function move(event) {
            if (event.pointerType !== 'mouse' || !media.matches || failed) return
            if (!view) {
                try {
                    view = createCursorScene(canvas)
                    view.resize(innerWidth, innerHeight)
                } catch {
                    failed = true
                    stop()
                    return
                }
            }
            visible = true
            overControl = !!event.target.closest(controls)
            document.documentElement.classList.toggle('fly-cursor', !overControl)
            if (event.clientX !== target.x || event.clientY !== target.y) {
                if (spider.caught) {
                    clearWeb()
                    fly.x = event.clientX
                    fly.y = event.clientY
                }
                spider.caught = false
                caughtAt = null
                moved = performance.now()
            }
            target = { x: event.clientX, y: event.clientY }
            start()
        }
        const leave = () => { visible = false; stop() }
        const change = () => { stop(); start() }
        const click = event => {
            if (view && !event.target.closest(controls)) { jump = .5; moved = performance.now(); start() }
        }
        const key = event => {
            if (['Delete','Backspace'].includes(event.key) && !event.target.closest('input,textarea,[contenteditable]')) clearWeb()
        }
        window.addEventListener('resize', resize)
        window.addEventListener('pointermove', move)
        window.addEventListener('blur', leave)
        window.addEventListener('click', click)
        window.addEventListener('keydown', key)
        document.addEventListener('pointerleave', leave)
        document.addEventListener('visibilitychange', change)
        media.addEventListener('change', change)
        return () => {
            stop()
            view?.dispose()
            window.removeEventListener('resize', resize)
            window.removeEventListener('pointermove', move)
            window.removeEventListener('blur', leave)
            window.removeEventListener('click', click)
            window.removeEventListener('keydown', key)
            document.removeEventListener('pointerleave', leave)
            document.removeEventListener('visibilitychange', change)
            media.removeEventListener('change', change)
        }
    }, [])
    return <canvas ref={ref} className="web-cursor" aria-hidden="true" />
}
