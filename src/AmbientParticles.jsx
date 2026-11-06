import { useEffect, useRef } from 'react'

export default function AmbientParticles() {
    const ref = useRef(null)
    useEffect(() => {
        const canvas = ref.current, host = canvas.parentElement, ctx = canvas.getContext('2d')
        const reduced = matchMedia('(prefers-reduced-motion: reduce)')
        let width = 0, height = 0, frame = 0, last = 0, visible = false, dots = [], pointer = null
        const resize = () => {
            width = host.clientWidth; height = host.clientHeight
            const dpr = Math.min(devicePixelRatio, 1.5)
            canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            dots = Array.from({ length: Math.min(100, Math.floor(width * height / 6500)) }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, phase: Math.random() * 6.28, size: 1 + Math.random() * 2 }))
        }
        const draw = time => {
            frame = 0
            if (!visible || document.hidden || reduced.matches) return
            const dt = Math.min((time - (last || time)) / 1000, .04); last = time
            ctx.clearRect(0,0,width,height); ctx.strokeStyle = '#90a955'; ctx.lineCap = 'round'
            for (const dot of dots) {
                const dx = pointer ? dot.x - pointer.x : 1000, dy = pointer ? dot.y - pointer.y : 1000, distance = Math.hypot(dx,dy)
                if (distance < 110 && distance > 0) { const force = (1-distance/110)*180; dot.vx += dx/distance*force*dt; dot.vy += dy/distance*force*dt }
                dot.vx *= Math.exp(-2*dt); dot.vy *= Math.exp(-2*dt)
                dot.x = (dot.x + (dot.vx + Math.sin(time*.0003+dot.phase)*5)*dt + width) % width
                dot.y = (dot.y + (dot.vy - 4)*dt + height) % height
                const angle = dot.phase + time*.00015
                ctx.globalAlpha = .25 + dot.size*.1; ctx.lineWidth = dot.size
                ctx.beginPath(); ctx.moveTo(dot.x,dot.y); ctx.lineTo(dot.x+Math.cos(angle)*4,dot.y+Math.sin(angle)*4); ctx.stroke()
            }
            frame = requestAnimationFrame(draw)
        }
        const sync = () => { cancelAnimationFrame(frame); frame=0; last=0; if (reduced.matches) ctx.clearRect(0,0,width,height); else if (visible && !document.hidden) frame=requestAnimationFrame(draw) }
        const move = event => { const rect=host.getBoundingClientRect(); pointer={x:event.clientX-rect.left,y:event.clientY-rect.top} }
        const leave = () => { pointer=null }
        const observer = new ResizeObserver(resize); observer.observe(host)
        const intersection = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; sync() }); intersection.observe(host)
        host.addEventListener('pointermove',move); host.addEventListener('pointerleave',leave); reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync)
        return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); host.removeEventListener('pointermove',move); host.removeEventListener('pointerleave',leave); reduced.removeEventListener('change',sync); document.removeEventListener('visibilitychange',sync) }
    }, [])
    return <canvas className="ambient-particles" ref={ref} aria-hidden="true" />
}
