import { useEffect } from 'react'

/** Progressive enhancement: content starts visible; no animation library required. */
export function usePortfolioMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktopPointer = window.matchMedia('(min-width: 1000px) and (pointer: fine)')
    const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    const portrait = document.querySelector<HTMLElement>('[data-parallax]')
    const hero = document.querySelector<HTMLElement>('.hero')
    let observer: IntersectionObserver | undefined
    let frame = 0
    let listening = false

    const updatePortrait = () => {
      frame = 0
      if (!portrait || !hero) return
      const { top, bottom } = hero.getBoundingClientRect()
      if (bottom > 0 && top < window.innerHeight) {
        portrait.style.setProperty('--parallax-y', `${Math.min(24, Math.max(-12, -top * 0.045))}px`)
      }
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updatePortrait) }

    const clearMotion = () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.cancelAnimationFrame(frame)
      frame = 0
      listening = false
      portrait?.style.removeProperty('--parallax-y')
      items.forEach((item) => item.classList.remove('reveal-pending'))
    }

    const configure = () => {
      clearMotion()
      if (reducedMotion.matches) return
      const lowPower = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4
      if (lowPower) return
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('reveal-pending')
              observer?.unobserve(entry.target)
            }
          })
        }, { threshold: 0, rootMargin: '0px 0px 40px 0px' })
        items.forEach((item) => {
          if (item.getBoundingClientRect().top > window.innerHeight + 40) {
            item.classList.add('reveal-pending')
            observer?.observe(item)
          }
        })
      }
      if (desktopPointer.matches) {
        listening = true
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        onScroll()
      }
    }
    const revealFocused = (event: FocusEvent) => {
      if (event.target instanceof Element) event.target.closest('.reveal-pending')?.classList.remove('reveal-pending')
    }
    const onViewportChange = () => {
      if (desktopPointer.matches !== listening && !reducedMotion.matches) configure()
    }
    configure()
    reducedMotion.addEventListener('change', configure)
    desktopPointer.addEventListener('change', onViewportChange)
    document.addEventListener('focusin', revealFocused)
    return () => {
      clearMotion()
      reducedMotion.removeEventListener('change', configure)
      desktopPointer.removeEventListener('change', onViewportChange)
      document.removeEventListener('focusin', revealFocused)
    }
  }, [])
}
