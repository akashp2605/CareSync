import React, { useState, useEffect } from 'react';
import caresyncLogo from '../../assets/caresync.png';

/**
 * SplashScreen Component
 *
 * Displays CareSync logo in the center with a gentle heartbeat pulse
 * for ~1 second, then smoothly fades out.
 */
const SplashScreen = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Hold splash screen for 900ms, then start smooth fade-out
    const holdTimer = setTimeout(() => {
      setFadingOut(true);
    }, 900);

    // After fade-out completes (400ms), transition at 1300ms (900ms + 400ms)
    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 1300);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`caresync-splash-overlay ${fadingOut ? 'fade-out' : ''}`}
      aria-label="CareSync Loading Splash Screen"
      role="status"
    >
      {/* Subtle healthcare ambient blur glow */}
      <div className="caresync-splash-ambient" />

      <div className="caresync-splash-content">
        {/* Subtle rhythmic heartbeat pulse rings */}
        <div className="caresync-pulse-ring-outer" />
        <div className="caresync-pulse-ring-inner" />

        {/* Center Logo Box */}
        <div className="caresync-splash-logo-box">
          <img
            src={caresyncLogo}
            alt="CareSync Healthcare System"
            className="caresync-splash-logo-img"
          />
        </div>

        {/* Elegant minimal tagline */}
        <div className="caresync-splash-tagline">
          <span>CareSync Health</span>
          <span className="dot" />
          <span>Care Together, Always</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
