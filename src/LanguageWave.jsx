import { useEffect, useRef } from 'react'

export default function LanguageWave() {
    const track = useRef(null)
    const list = useRef(null)
    useEffect(() => {
        const region = track.current
        const row = list.current
        const media = matchMedia('(max-width:760px) and (prefers-reduced-motion:no-preference)')
        let distance = 0
        function sync() {
            if (!distance) return
            const top = parseFloat(getComputedStyle(row.parentElement).top)
            row.scrollLeft = Math.min(distance, Math.max(0, top - region.getBoundingClientRect().top))
        }
        function measure() {
            distance = media.matches ? Math.max(0, row.scrollWidth - row.clientWidth) : 0
            region.style.setProperty('--language-travel', distance + 'px')
            if (!distance) row.scrollLeft = 0
            sync()
        }
        const observer = new ResizeObserver(measure)
        observer.observe(row)
        media.addEventListener('change', measure)
        window.addEventListener('scroll', sync, { passive:true })
        measure()
        return () => {
            observer.disconnect()
            media.removeEventListener('change', measure)
            window.removeEventListener('scroll', sync)
        }
    }, [])
    return (
        <div className="technology-section" ref={track}><div className="language-pin"><h3>Languages & frameworks</h3><ul className="technology-list" ref={list}>
                        {[['Laravel','laravel'],['Rust','rust'],['PHP','php'],['Python','python'],['C','c'],['C++','cplusplus'],['HTML','html5'],['Java','java'],['React','react'],['JavaScript','javascript']].map(([name, icon], index) => <li key={icon} style={{ '--wave-delay': `-${index * .48}s` }}><span className="technology-icon"><img src={`/icons/${icon}.svg`} alt="" width="36" height="36" loading="lazy" /></span><span>{name}</span></li>)}
                    </ul></div></div>
    )
}
