import { useRef, useState } from 'react'
import './ProjectArchive.css'
import AmbientParticles from './AmbientParticles'

export default function ProjectArchive({ projects }) {
    const [active, setActive] = useState(() => window.matchMedia('(max-width:760px)').matches ? Math.min(3, projects.length - 1) : 0)
    const dialog = useRef(null)
    const gesture = useRef(null)
    const project = projects[active]
    const liveCount = projects.filter(item => item.url).length
    const step = (direction) => setActive(index => (index + direction + projects.length) % projects.length)
    return (
        <section className="archive section particle-surface" id="work" aria-labelledby="work-title">
            <AmbientParticles />
            <header className="archive-header"><h2 id="work-title">Selected work.</h2><span>IAMDANZI / WEB ARCHIVE</span></header>
            <div className="archive-shelf" role="region" aria-label="Project archive. Use left and right arrow keys to browse." tabIndex={0}
                onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1) } }}
                onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY } }}
                onPointerUp={event => { const start = gesture.current; gesture.current = null; if (start && Math.abs(event.clientX - start.x) > 45 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) { step(event.clientX < start.x ? 1 : -1); gesture.current = 'swiped' } }}
                onPointerCancel={() => { gesture.current = null }}>
                <div className="archive-watermark" aria-hidden="true">BUILT<br />FOR THE WEB</div>
                <div className="archive-floor" />
                <div className="archive-stage">
                    {Array.from({ length: projects.length * 3 }, (_, virtualIndex) => {
                        const index = virtualIndex % projects.length
                        const item = projects[index]
                        const count = projects.length * 3
                        let offset = (virtualIndex - active - projects.length + count) % count
                        if (offset > count / 2) offset -= count
                        const distance = Math.abs(offset)
                        const selected = offset === 0
                        const u = distance * .20 + (distance ? .22 : 0)
                        const scale = 1 / (1 + Math.pow(u / 1.15, 1.6))
                        let x = 0
                        for (let t = 0; t < u; t += .01) x += .01 / (1 + Math.pow(t / 1.15, 1.6))
                        const duplicate = distance > Math.floor(projects.length / 2)
                        return <button type="button" key={virtualIndex} className={`archive-tape${selected ? ' is-active' : ''}`}
                            data-mobile-hidden={distance > 3 || undefined}
                            style={{ '--side': Math.sign(offset), '--distance': distance, '--x': Math.sign(offset) * x, '--y': (1 - scale) * .24, '--scale': selected ? 1 : scale, '--angle': selected ? '-90deg' : `${Math.sign(offset) * Math.min(distance * 2, 18)}deg`, '--tape-tone': ['#31572c','#ecf39e','#4f772d','#90a955'][index % 4], '--tape-ink': index % 2 ? '#132a13' : '#ecf39e', zIndex: 30 - distance, display: distance > 11 ? 'none' : undefined }}
                            aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : 0}
                            aria-label={selected ? `Open ${item.name} project details` : `Select ${item.name}`} aria-pressed={selected}
                            onClick={() => { if (gesture.current === 'swiped') { gesture.current = null; return } if (selected) dialog.current.showModal(); else setActive(index) }}>
                            <span className="tape-object"><span className="tape-spine"><span className="tape-code">WEB / {String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><span className="tape-brand">{item.status === 'development' ? 'UNDER DEVELOPMENT' : 'IAMDANZI'}</span></span>
                            <span className="tape-cover"><span className="cover-top">IAMDANZI / SELECTED WORK</span><strong>{item.name}</strong>{item.preview ? <img src={item.preview} alt="" width="1200" height="750" draggable="false" /> : <span className="development-art" aria-hidden="true"><span>{item.name.charAt(0)}</span><small>IN THE MAKING</small></span>}<span className="cover-bottom">{item.type}<span>OPEN ↗</span></span></span></span>
                        </button>
                    })}
                </div>
            </div>
            <div className="archive-caption">
                <button type="button" onClick={() => step(-1)} aria-label="Previous project">←</button>
                <div aria-live="polite" aria-atomic="true" className="archive-caption-mask"><div key={active}><span>{project.type}</span><h3>{project.name}</h3><p>{project.description}</p></div></div>
                <button type="button" onClick={() => step(1)} aria-label="Next project">→</button>
            </div>
            <p className="archive-note">{liveCount} live projects. {projects.length - liveCount} under development.</p>
            <dialog ref={dialog} className="archive-detail" aria-labelledby="archive-detail-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close() }}>
                <button type="button" className="archive-close" onClick={() => dialog.current.close()} autoFocus>Close ×</button>
                <div className="detail-copy"><span>IAMDANZI / {project.type}</span><h2 id="archive-detail-title">{project.name}</h2><p>{project.description}</p>{project.url ? <a className="button button-dark" href={project.url} target="_blank" rel="noreferrer">Visit live website ↗</a> : <p className="development-status">Under development</p>}</div>
                {project.preview ? <img src={project.preview} alt={`${project.name} homepage preview`} width="1200" height="750" /> : <div className="development-art detail-development" aria-hidden="true"><span>{project.name.charAt(0)}</span><small>IN THE MAKING</small></div>}
            </dialog>
        </section>
    )
}

