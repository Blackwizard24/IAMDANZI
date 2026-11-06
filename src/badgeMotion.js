export function watchBadgeMotion(element, onChange) {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    const update = () => onChange({ reduced: preference.matches, visible })
    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        update()
    })
    preference.addEventListener('change', update)
    observer.observe(element)
    update()
    return () => {
        preference.removeEventListener('change', update)
        observer.disconnect()
    }
}
