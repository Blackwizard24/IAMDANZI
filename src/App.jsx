import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Band from './Band'
import ProjectArchive from './ProjectArchive'
import ContactLink from './ContactLink'
import FooterCharacter from './FooterCharacter'
import LanguageWave from './LanguageWave'
import SpiderCursor from './SpiderCursor'
import AmbientParticles from './AmbientParticles'
import { Link001 } from './components/ui/skiper-ui/skiper40'
import { watchBadgeMotion } from './badgeMotion'

const projects = [
    { name: 'The King and the Code', type: 'Streaming platform', preview: '/projects/king-code.png', url: 'https://thekingandthecode.com/', description: 'A home for streaming content and connecting with an audience.' },
    { name: 'Freedom Select', type: 'E-commerce', preview: '/projects/freedom-select.png', url: 'https://freedomselect.co.tz/', description: 'An online storefront that brings products and customers together.' },
    { name: 'Osborns Exhibition', type: 'Exhibition website', preview: '/projects/exhibition.png', url: 'https://osbornsexhibition.co.tz/', description: 'A digital presence for an exhibition and its community.' },
    { name: 'Pastor Tony Osborn Ministries', type: 'Church website', preview: '/projects/ministry.png', url: 'https://pastortonyosbornministries.org/', description: 'A place for a ministry to share its message and reach its community.' },
    { name: 'Coffee Shop', type: 'Under development', status: 'development', description: 'Currently under development. More details will be shared when it is ready.' },
    { name: 'Osborns Book Store', type: 'Under development', status: 'development', description: 'Currently under development. More details will be shared when it is ready.' },
    { name: 'Msingi', type: 'Under development', status: 'development', description: 'Currently under development. More details will be shared when it is ready.' },
    { name: 'Mboni', type: 'Under development', status: 'development', description: 'Currently under development. More details will be shared when it is ready.' },
    { name: 'Msafiri', type: 'Under development', status: 'development', description: 'Currently under development. More details will be shared when it is ready.' },

]

export default function App() {
    const [sideNav, setSideNav] = useState(false)
    useEffect(() => {
        const home = document.getElementById('home')
        let lastY = window.scrollY
        const homeEnd = () => home.offsetTop + home.offsetHeight
        setSideNav(lastY >= homeEnd())
        function followScroll() {
            const y = Math.max(0, window.scrollY)
            if (Math.abs(y - lastY) < 4 && y !== 0) return
            setSideNav(y > 0 && (y > lastY || y >= homeEnd()))
            lastY = y
        }
        window.addEventListener('scroll', followScroll, { passive: true })
        return () => window.removeEventListener('scroll', followScroll)
    }, [])
    const characterHead = useRef(null)
    function nodAtContact(event) {
        const link = event.target.closest('a')
        if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget)) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const head = characterHead.current
        head.getAnimations().forEach(animation => animation.cancel())
        head.animate([
            { transform:'none' },
            { transform:'translateY(1.2%) rotate(-8deg) scaleY(.96)', offset:.42 },
            { transform:'none' },
        ], { duration:520, easing:'ease-in-out' })
    }
    const badgeElement = useRef(null)
    const [projectPressed, setProjectPressed] = useState(false)
    const pressTimer = useRef(null)
    useEffect(() => () => clearTimeout(pressTimer.current), [])
    const illuminateProject = () => {
        setProjectPressed(true)
        clearTimeout(pressTimer.current)
        pressTimer.current = setTimeout(() => setProjectPressed(false), 1800)
    }
    const [badgeMotion, setBadgeMotion] = useState(() => ({ reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches, visible: true }))
    useEffect(() => watchBadgeMotion(badgeElement.current, setBadgeMotion), [])
    return (
        <>
            <SpiderCursor />
            <a className="skip-link" href="#main">Skip to content</a>
            <nav className={sideNav ? "rail rail-side" : "rail"} aria-label="Main navigation">
                <div className="rail-links">
                    <a href="#work">Work</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
            <main id="main">
                <section className="hero" id="home" aria-labelledby="intro-title">
                    <div className="intro particle-surface"><AmbientParticles />
                        <div className="intro-copy">
                            <p className="outline greeting">Hi there, I'm</p>
                            <h1 id="intro-title">IAMDANZI</h1>
                            <p className="outline role">Full-stack<br />developer.</p>
                            <p className="intro-description">I develop websites, apps, and custom systems that help businesses reach customers and manage everyday work.</p>
                        </div>
                        {/* Button design by adamgiebl on Uiverse.io. */}
                        <a onPointerDown={illuminateProject} onClick={illuminateProject} className={`button cssbuttons-io-button${projectPressed ? ' is-illuminated' : ''}`} href="mailto:eltonmdanzi@gmail.com?subject=Let%27s%20digitize%20my%20business">
                            Start a project
                            <div className="icon" aria-hidden="true"><span className="button-great">Great</span>
                                <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                    <path d="M0 0h24v24H0z" fill="none" />
                                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
                                </svg>
                            </div>
                        </a>
                    </div>
                    <div className="badge-panel">
                        <div className="badge-scene" ref={badgeElement}>
                            {badgeMotion.reduced ? <div className="static-badge"><div className="static-ribbon" /><img src="/Card.jpg" alt="IAMDANZI profile photograph" width="801" height="1068" /></div> :
                            <Canvas frameloop={badgeMotion.visible ? 'always' : 'never'} aria-label="Draggable IAMDANZI photo badge on a GitHub ribbon" camera={{ position: [0, 0, 13], fov: 25 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
                                <ambientLight intensity={Math.PI} />
                                <Physics paused={!badgeMotion.visible} interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                                    <Band />
                                </Physics>
                                <Environment>
                                    <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                                    <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                                    <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                                    <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                                </Environment>
                            </Canvas>}
                        </div>
                        {/* Glass orbit button adapted from Uiverse.io by Surush0098. */}
                        <a className="work-orbit" href="#work"><span className="orbit-disc" aria-hidden="true" /><span className="orbit-glass" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 17h6m-3-3v6"/></svg></span><span className="orbit-label">See my work</span></a>
                    </div>
                </section>
                <ProjectArchive projects={projects} />
                <section className="about section particle-surface" id="about" aria-labelledby="about-title"><AmbientParticles />
                    <h2 id="about-title">Always building.<br /><span>Always learning.</span></h2>
                    <div className="about-copy">
                        <p>I'm a full-stack developer with an interest in how people, software and communication systems connect.</p>
                        <p>My work spans streaming, e-commerce, exhibitions and ministry websites. Beyond development, I'm interested in telecommunications and exploring cybersecurity as my next area of learning.</p>
                        <Link001 href="https://github.com/IAMDANZI" target="_blank" rel="noreferrer">Find me on GitHub</Link001>
                    </div>
                    <LanguageWave />
                </section>
                <footer className="contact section particle-surface" id="contact"><AmbientParticles />
                    <p>Have something in mind?</p>
                    <h2>Let’s digitize<br />your business.</h2>
                    <div className="contact-layout">
                        <div>
                            <p className="contact-brief">What would you like to move online or make easier to manage? Tell me about your idea for a website, app, or system.</p>
                            {/* Adapted from Uiverse.io by MuhammadHasann. */}
                            <a className="email-project" href="mailto:eltonmdanzi@gmail.com?subject=Let%27s%20digitize%20my%20business">Email me about a project
                                {[1,2,3].map(i => <svg key={i} className={`email-sprig email-sprig-${i}`} viewBox="0 0 24 80" aria-hidden="true"><path d="M12 1C6 20 17 37 10 56S11 70 14 78" fill="none" stroke="currentColor" strokeWidth="1.2" />{[8,18,28,38,48,58,68].map((y,j) => <g key={y} transform={`translate(${j%2 ? 11 : 10} ${y})`}><path d="M0 0C-8-8-10-3-8 0-6 3-2 3 0 0Z" fill="currentColor"/><path d="M0 3C7-5 11-1 8 3 6 6 2 7 0 3Z" fill="currentColor"/></g>)}</svg>)}
                            </a>
                            <address className="contact-details" onPointerOver={nodAtContact} onFocus={nodAtContact}>
                                <ContactLink type="Email" href="mailto:eltonmdanzi@gmail.com">eltonmdanzi@gmail.com</ContactLink>
                                <ContactLink type="Call" href="tel:+255707919039">+255 707 919 039</ContactLink>
                                <ContactLink type="Instagram" href="https://www.instagram.com/iamdanzi/" target="_blank" rel="noreferrer">@iamdanzi</ContactLink>
                                <ContactLink type="GitHub" href="https://github.com/IAMDANZI" target="_blank" rel="noreferrer">IAMDANZI</ContactLink>
                            </address>
                        </div>
                        <figure className="instagram-qr">
                            <FooterCharacter ref={characterHead} />
                            <a href="https://www.instagram.com/iamdanzi/" target="_blank" rel="noreferrer" aria-label="Open @iamdanzi on Instagram">
                                <img src="/iamdanzi_qr.png" alt="Instagram QR code for @iamdanzi" width="2350" height="2700" loading="lazy" />
                            </a>
                            <figcaption>Scan to find me on Instagram.<br />On your phone? Tap the code.</figcaption>
                        </figure>
                    </div>
                    <div className="footer-line"><span>© 2026 IAMDANZI</span><a className="back-top" href="#home" aria-label="Back to top"><span className="back-text" aria-hidden="true"><span>Back</span><span>to</span><span>top</span></span><span className="back-clone" aria-hidden="true"><span>Back</span><span>to</span><span>top</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a></div>
                </footer>
            </main>
        </>
    )
}



