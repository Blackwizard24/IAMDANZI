// Adapted from Skiper UI Skiper40 (CssLink), by @gurvinder-singh02.
// https://skiper-ui.com/v1/skiper40 — free version attribution retained.
// Uses native anchors and scoped CSS in this Vite project instead of Next.js/Tailwind.
import './skiper40.css'

function AnimatedLink({ children, className = '', variant = 1, ...props }) {
    return <a {...props} className={`skiper-link skiper-link-${variant} ${className}`}>
        {children}
        {variant !== 0 && <svg viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </a>
}
export const Link000 = props => <AnimatedLink {...props} variant={0} />
export const Link001 = props => <AnimatedLink {...props} variant={1} />
export const Link002 = props => <AnimatedLink {...props} variant={2} />
export const Link003 = props => <AnimatedLink {...props} variant={3} />
export const Link004 = props => <AnimatedLink {...props} variant={4} />
export const Link005 = props => <AnimatedLink {...props} variant={5} />
