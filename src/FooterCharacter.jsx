import { forwardRef } from 'react'

const FooterCharacter = forwardRef(function FooterCharacter(_, headRef) {
    return (
        <span className="footer-character" aria-hidden="true">
            {['body', 'head'].map(part => (
                <picture key={part} className={'character-' + part} ref={part === 'head' ? headRef : undefined}>
                    <source media="(max-width:760px)" srcSet="/footer-seated.png" />
                    <img src="/footer-standing.png" alt="" loading="lazy" />
                </picture>
            ))}
        </span>
    )
})

export default FooterCharacter
