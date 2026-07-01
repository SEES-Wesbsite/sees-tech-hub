import React from 'react';
import { RANK_TITLES } from './quiz-constants';

interface ShareableRankCardProps {
  userName: string;
  score: number;
  rankLetter: string;
}

// We use an inline style approach here to ensure html-to-image renders perfectly, 
// as complex external CSS can sometimes get stripped during the canvas conversion.
export const ShareableRankCard = React.forwardRef<HTMLDivElement, ShareableRankCardProps>(
  ({ userName, score, rankLetter }, ref) => {
    
    // Dynamic color based on Rank
    const rankColors: Record<string, string> = {
      'S': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Gold
      'A': 'linear-gradient(135deg, #025c48 0%, #10b981 100%)', // SEES Brand Green
      'B': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue
      'C': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
      'D': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
      'E': 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', // Red
    };

    const bgGradient = rankColors[rankLetter] || rankColors['E'];

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '800px',
          background: '#09090b', // Zinc-950
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          boxSizing: 'border-box',
          padding: '40px',
        }}
      >
        {/* Background Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: bgGradient,
          opacity: 0.15,
          filter: 'blur(100px)',
          zIndex: 0
        }} />

        {/* Content Wrapper */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Header & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
            <img src="/logo-mark.svg" alt="SEES Logo" style={{ width: '48px', height: '48px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', color: '#f4f4f5', margin: 0 }}>SEES TECH HUB</h2>
          </div>

          <p style={{ fontSize: '18px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px' }}>
            Official Placement Rank
          </p>

          {/* The Rank Letter */}
          <div style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: bgGradient,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(0,0,0,0.5)',
            marginBottom: '16px',
            border: '8px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: '72px', fontWeight: '900', color: '#ffffff', textShadow: '0 4px 24px rgba(0,0,0,0.4)', lineHeight: 1 }}>
              {rankLetter} Rank
            </span>
          </div>

          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '32px' }}>
            {RANK_TITLES[rankLetter] || RANK_TITLES['E']}
          </div>

          {/* Score & Name */}
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#ffffff' }}>
            {userName}
          </h1>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 40px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '20px', color: '#a1a1aa', marginRight: '12px' }}>Total Score:</span>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{score}</span>
          </div>

        </div>

        {/* Footer / CTA */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#a1a1aa', margin: '0 0 8px 0' }}>Think you can beat this rank?</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Join us at <span style={{ color: '#10b981' }}>tech.seesunilag.com</span></p>
        </div>
      </div>
    );
  }
);

ShareableRankCard.displayName = 'ShareableRankCard';
