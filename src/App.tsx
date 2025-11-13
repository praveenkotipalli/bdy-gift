import { useState, useRef, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScrollContent, setShowScrollContent] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

      {/* Scrollable text content */}
      {showScrollContent && (
        <div
          ref={scrollContainerRef}
          className="relative z-10 h-screen w-screen overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          "Scroll Down"
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
                rotationEnd="+=200%"
                wordAnimationEnd="+=100%"
              >


‎ 
‎ 
‎ 
                When does a man die? When he is hit by a bullet? No! When he suffers a disease?
                No! When he ate a soup made out of a poisonous mushroom?
                No! A man dies when he is forgotten!
              </ScrollReveal>
            </div>
          </div>
          
          {/* Extra space at bottom to enable scrolling */}
          <div className="h-screen" />
        </div>
      )}
    </div>
  );
}

export default App;

