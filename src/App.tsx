import { useState, useRef, useEffect, useCallback } from 'react';
import ScrollReveal from './ScrollReveal';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './app.css';
import confetti from 'canvas-confetti';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScrollContent, setShowScrollContent] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [isBirthdayVisible, setIsBirthdayVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const happyBirthdayRef = useRef<HTMLDivElement>(null);
  const fireworksTriggeredRef = useRef(false);

  const triggerFireworks = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 120 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return window.clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const handleClick = () => {
    if (!isPlaying && videoRef.current && audioRef.current) {
      setIsPlaying(true);
      audioRef.current.volume = 0.2; // Set BGM volume to 20%
      videoRef.current.play();
      audioRef.current.play();

      // Show scroll content after 15 seconds
      setTimeout(() => {
        setShowScrollContent(true);
      }, 15000);
    }
  };

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
  
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.2 }
    );
  
    elements.forEach(el => observer.observe(el));
  
    return () => observer.disconnect();
  }, []);
  
  // Check landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Check if assets are loaded
  useEffect(() => {
    const checkAssetsLoaded = () => {
      if (videoRef.current && audioRef.current) {
        const videoReady = videoRef.current.readyState >= 3; // HAVE_FUTURE_DATA
        const audioReady = audioRef.current.readyState >= 3;
        
        if (videoReady && audioReady) {
          setAssetsLoading(false);
        }
      }
    };

    // Use a small delay to ensure refs are set
    const timer = setTimeout(() => {
      if (videoRef.current && audioRef.current) {
        videoRef.current.addEventListener('canplaythrough', checkAssetsLoaded);
        audioRef.current.addEventListener('canplaythrough', checkAssetsLoaded);
        videoRef.current.addEventListener('loadeddata', checkAssetsLoaded);
        audioRef.current.addEventListener('loadeddata', checkAssetsLoaded);
        checkAssetsLoaded(); // Check immediately in case already loaded
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplaythrough', checkAssetsLoaded);
        videoRef.current.removeEventListener('loadeddata', checkAssetsLoaded);
      }
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', checkAssetsLoaded);
        audioRef.current.removeEventListener('loadeddata', checkAssetsLoaded);
      }
    };
  }, []);

  // Refresh ScrollTrigger when content appears
  useEffect(() => {
    if (showScrollContent && scrollContainerRef.current) {
      // Wait for DOM to update, then refresh ScrollTrigger
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }, [showScrollContent]);

  useEffect(() => {
    if (!showScrollContent || !happyBirthdayRef.current) {
      return;
    }

    const target = happyBirthdayRef.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsBirthdayVisible(true);
            if (!fireworksTriggeredRef.current) {
              fireworksTriggeredRef.current = true;
              triggerFireworks();
            }
          } else {
            setIsBirthdayVisible(false);
            fireworksTriggeredRef.current = false;
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.5,
      }
    );

    observer.observe(target);

    return () => {
      setIsBirthdayVisible(false);
      observer.unobserve(target);
    };
  }, [showScrollContent, triggerFireworks]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Landscape orientation warning */}
      {!isLandscape && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-neutral-900 text-white">
          <div className="text-center px-4">
            <div className="text-2xl font-semibold uppercase mb-2">Rotate your screen</div>
            <div className="text-lg">You can only see this in landscape</div>
          </div>
        </div>
      )}

      {/* Assets loading indicator */}
      {assetsLoading && isLandscape && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-neutral-800 text-white">
          <div className="text-center">
            <div className="text-xl font-semibold uppercase mb-4">Assets downloading...</div>
            <div className="w-64 h-1 bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {!isPlaying && isLandscape && !assetsLoading && (
        <div
          onClick={handleClick}
          className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-neutral-800 text-white transition-opacity duration-1000"
        >
          <div className="animate-pulse text-center text-2xl font-semibold uppercase md:text-4xl">
            Click anywhere to play
          </div>
        </div>
      )}
      
      {/* Fixed video background */}
      <video
        ref={videoRef}
        className="fixed inset-0 h-full w-full object-cover brightness-[80%]"
        src="/video/Tendou Arisu Maid Live2D - FULL.mp4"
        preload="auto"
        muted
        onLoadedData={() => {
          if (videoRef.current && audioRef.current) {
            const videoReady = videoRef.current.readyState >= 3;
            const audioReady = audioRef.current.readyState >= 3;
            if (videoReady && audioReady) {
              setAssetsLoading(false);
            }
          }
        }}
      />
      
      <audio
        ref={audioRef}
        src="/audio/Koi is Love BGM - Compressed.flac"
        preload="auto"
        onLoadedData={() => {
          if (videoRef.current && audioRef.current) {
            const videoReady = videoRef.current.readyState >= 3;
            const audioReady = audioRef.current.readyState >= 3;
            if (videoReady && audioReady) {
              setAssetsLoading(false);
            }
          }
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-black transition-opacity duration-700"
        style={{ opacity: isBirthdayVisible ? 0.45 : 0 }}
      />

      {/* Scrollable text content */}
      {showScrollContent && (
        <div
          ref={scrollContainerRef}
          className="relative z-10 h-screen w-screen overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="h-screen w-full flex items-center justify-center">
  <span className="text-white text-5xl font-bold animate-pulse drop-shadow-[0_0_12px_rgba(128,128,128,0.9)]">
    Scroll Down
  </span>
</div>

          {/* Spacer at top to allow scrolling down */}
          <div className="h-screen" />
          
          <div className="flex min-h-screen items-center justify-center px-8 py-20">
            <div className="max-w-4xl text-center text-white">
              
              <ScrollReveal
                scrollContainerRef={scrollContainerRef}
                baseOpacity={0}
                enableBlur={true}
                baseRotation={0}
                blurStrength={10}
                rotationEnd="+=100%"
                wordAnimationEnd="+=50%"
              >
                Oyeeee !!
                {/* ㅤㅤㅤㅤㅤㅤㅤㅤ
                ㅤㅤㅤㅤㅤ
                ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
                So, I know we just met...
                ㅤㅤㅤㅤㅤㅤ
                ...but I heard it was your birthday.
                ㅤㅤ
                ㅤ
                ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
                I thought a generic "hbd" text was kind of boring.
                ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ ㅤ ㅤ So I made you this instead.
                ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ ㅤㅤㅤHopeㅤyouㅤhaveㅤanㅤawesomeㅤday!! */}
              </ScrollReveal>
              {/* <div className="mb-14"> */}
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              
              
              <div className=" text-3xl font-semibold mb drop-shadow">
  So, I know we just met...
</div>

<div className=" text-3xl font-semibold mb-10 drop-shadow">
  ...but since it was your birthday.
</div>

<div className=" text-3xl font-semibold mb-10 drop-shadow">
  I thought a generic "hbd" text was kind of boring.
</div>

<div className=" text-3xl font-semibold mb drop-shadow">
  So I made you this instead.
</div>

<div className=" block text-xl mb-10 drop-shadow">
  (you know that i had these exams and stuff going on, so i made  <br />as fast as i can
  and had no time to do more, but i hope you like it)
</div>

<div className=" text-3xl font-semibold mb-20 drop-shadow">
  Hope you have an awesome day!
</div>
<span className=" block text-xl font-semibold m drop-shadow ">
  Scroll More....
</span>
            </div>
          </div>
          
          {/* Extra space at bottom to enable scrolling */}
          
          <div className="h-screen" />
          <div
            ref={happyBirthdayRef}
            className="text-white h-screen w-full flex flex-col items-center justify-center"
          >
  <span className="text-white text-5xl font-bold animate drop-shadow-[0_0_12px_rgba(128,128,128,0.9)]">
    Happy Birthday!!
  </span>
  <div className='drop-shadow text-xl'>(btw, thats how i imagine you 👉🏼👈🏼)</div>
</div>
        </div>
      )}
    </div>
  );
}

export default App;

