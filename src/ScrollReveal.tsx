import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Wait a bit for the DOM to be ready
    const timeoutId = setTimeout(() => {
      const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

      // Kill any existing triggers for this element
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === el) {
          trigger.kill();
        }
      });

      // Parse the wordAnimationEnd to get the reveal end point
      const revealEnd = wordAnimationEnd;
      // Calculate disappear start and end (after reveal completes)
      const disappearStart = revealEnd;
      const disappearEnd = typeof revealEnd === 'string' && revealEnd.startsWith('+=') 
        ? `+=${parseFloat(revealEnd.replace('+=', '')) * 2}%` 
        : '+=100%';

      // Container rotation animation - reveal (rotate from baseRotation to 0)
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            end: revealEnd,
            scrub: true
          }
        }
      );

      // Container rotation animation - disappear (rotate back from 0 to baseRotation)
      if (baseRotation !== 0) {
        gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: 0 },
          {
            ease: 'none',
            rotate: baseRotation,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: disappearStart,
              end: disappearEnd,
              scrub: true
            }
          }
        );
      }

      const wordElements = el.querySelectorAll<HTMLElement>('.word');

      // Set initial styles
      wordElements.forEach((word) => {
        gsap.set(word, {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
          willChange: 'opacity, filter'
        });
      });

      // Reveal animation - fade in and blur out
      gsap.to(
        wordElements,
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: revealEnd,
            scrub: true
          }
        }
      );

      // Disappear animation - fade out (reverse stagger)
      gsap.to(
        wordElements,
        {
          ease: 'none',
          opacity: baseOpacity,
          stagger: { amount: wordElements.length * 0.05, from: 'end' },
          scrollTrigger: {
            trigger: el,
            scroller,
            start: disappearStart,
            end: disappearEnd,
            scrub: true
          }
        }
      );

      if (enableBlur) {
        // Reveal blur animation
        gsap.to(
          wordElements,
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom-=20%',
              end: revealEnd,
              scrub: true
            }
          }
        );

        // Disappear blur animation (reverse stagger)
        gsap.to(
          wordElements,
          {
            ease: 'none',
            filter: `blur(${blurStrength}px)`,
            stagger: { amount: wordElements.length * 0.05, from: 'end' },
            scrollTrigger: {
              trigger: el,
              scroller,
              start: disappearStart,
              end: disappearEnd,
              scrub: true
            }
          }
        );
      }

      // Refresh ScrollTrigger after setup
      ScrollTrigger.refresh();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
