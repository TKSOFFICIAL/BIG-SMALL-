// Helper to format remaining 4-day expiration time
export function formatExpiryTime(remainingMs: number): string {
  if (remainingMs <= 0) return 'EXPIRED & LOCKED';
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function getSize(num: number): 'BIG' | 'SMALL' {
  return num >= 5 ? 'BIG' : 'SMALL';
}

export function getColor(num: number): 'RED' | 'GREEN' {
  return [0, 2, 4, 6, 8].includes(num) ? 'RED' : 'GREEN';
}

// Sound effects using Web Audio API
export function playAudioSound(type: 'win' | 'loss' | 'jackpot') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'win') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'loss') {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'jackpot') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.4); // D6
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    // Ignore audio context errors if blocked by browser policy
  }
}

// Trigger celebratory confetti effect
export function triggerConfetti() {
  const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'fixed z-[999999] pointer-events-none rounded-sm animate-bounce';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = '-20px';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = 6 + Math.random() * 8 + 'px';
    p.style.height = 10 + Math.random() * 12 + 'px';
    p.style.opacity = (0.7 + Math.random() * 0.3).toString();
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    const duration = 2.5 + Math.random() * 2.5;
    p.style.transition = `transform ${duration}s linear, top ${duration}s linear, opacity ${duration}s linear`;

    document.body.appendChild(p);

    setTimeout(() => {
      p.style.top = '105vh';
      p.style.transform = `rotate(${720 + Math.random() * 720}deg)`;
      p.style.opacity = '0';
    }, 50);

    setTimeout(() => p.remove(), duration * 1000 + 100);
  }
}
