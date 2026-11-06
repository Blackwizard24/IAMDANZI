import { useRef, useState } from 'react'

export default function TouchBadge() {
    const rig = useRef(null)
    const gesture = useRef(null)
    const suppressClick = useRef(false)
    const [back, setBack] = useState(false)

    function grab(event) {
        if (!event.isPrimary || event.button !== 0) return
        gesture.current = { id:event.pointerId, x:event.clientX, y:event.clientY }
        suppressClick.current = false
        event.currentTarget.setPointerCapture(event.pointerId)
        rig.current.dataset.dragging = 'true'
    }
    function move(event) {
        const start = gesture.current
        if (!start || start.id !== event.pointerId) return
        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        if (Math.hypot(dx, dy) > 6) suppressClick.current = true
        const angle = Math.max(-24, Math.min(24, -dx * .24))
        rig.current.style.setProperty('--swing', angle + 'deg')
        rig.current.style.setProperty('--pull', Math.max(-18, Math.min(48, dy * .65)) + 'px')
    }
    function release(event) {
        if (gesture.current?.id !== event.pointerId) return
        gesture.current = null
        delete rig.current.dataset.dragging
        rig.current.style.removeProperty('--swing')
        rig.current.style.removeProperty('--pull')
    }
    return (
        <div className="touch-badge" ref={rig}>
            <div className="touch-strap" aria-hidden="true" />
            <button type="button" className="touch-card" aria-label={back ? 'Show badge photo' : 'Show badge projects'}
                aria-pressed={back} onPointerDown={grab} onPointerMove={move} onPointerUp={release}
                onPointerCancel={release} onLostPointerCapture={release}
                onClick={event => {
                    if (!event.detail || !suppressClick.current) setBack(value => !value)
                    suppressClick.current = false
                }}>
                <span className="touch-faces" data-back={back}>
                    <img src="/Card.jpg" alt="" draggable="false" />
                    <img src="/card-back.svg" alt="" draggable="false" />
                </span>
            </button>
        </div>
    )
}
