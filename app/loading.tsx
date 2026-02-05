"use client";

const GlobalLoading = () => {
    return (
        <div className="gl-root">
            {/* Injected stylesheet — all keyframes + component styles, scoped by .gl- prefix */}
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* Grain texture overlay */}
            <svg className="gl-grain" aria-hidden="true">
                <filter id="gl-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#gl-noise)" />
            </svg>

            {/* Drifting ambient light orbs */}
            <div className="gl-orb gl-orb--1" aria-hidden="true" />
            <div className="gl-orb gl-orb--2" aria-hidden="true" />
            <div className="gl-orb gl-orb--3" aria-hidden="true" />

            {/* Center stage */}
            <div className="gl-stage">
                {/* Staggered bar loader */}
                <div className="gl-bars" aria-hidden="true">
                    <span className="gl-bar gl-bar--1" />
                    <span className="gl-bar gl-bar--2" />
                    <span className="gl-bar gl-bar--3" />
                    <span className="gl-bar gl-bar--4" />
                    <span className="gl-bar gl-bar--5" />
                </div>

                {/* Label */}
                <p className="gl-label">Loading</p>

                {/* Decorative fill line */}
                <div className="gl-fill-track" aria-hidden="true">
                    <div className="gl-fill-bar" />
                </div>
            </div>
        </div>
    );
};


const CSS = `
  /* ── Google Font (single tiny request, cached after first load) ── */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,300&display=swap');

  /* ── Root / backdrop ── */
  .gl-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    overflow: hidden;
  }

  /* ── Film-grain overlay ── */
  .gl-grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.035;
    pointer-events: none;
    z-index: 1;
  }

  /* ── Ambient light orbs ── */
  .gl-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
  }
  .gl-orb--1 {
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%);
    top: -15%;
    left: -10%;
    animation: gl-drift-1 11s ease-in-out infinite alternate;
  }
  .gl-orb--2 {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(180,140,100,0.14) 0%, transparent 70%);
    bottom: -18%;
    right: -8%;
    animation: gl-drift-2 14s ease-in-out infinite alternate;
  }
  .gl-orb--3 {
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(201,169,110,0.09) 0%, transparent 70%);
    top: 50%;
    left: 60%;
    animation: gl-drift-3 9s ease-in-out infinite alternate;
  }

  @keyframes gl-drift-1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    100% { transform: translate(60px, 80px) scale(1.1); }
  }
  @keyframes gl-drift-2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    100% { transform: translate(-70px, -50px) scale(1.08); }
  }
  @keyframes gl-drift-3 {
    0%   { transform: translate(0px, 0px) scale(1); }
    100% { transform: translate(-40px, 55px) scale(1.15); }
  }

  /* ── Center stage (sits above orbs & grain) ── */
  .gl-stage {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    animation: gl-stage-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes gl-stage-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Staggered bar loader ── */
  .gl-bars {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
  }
  .gl-bar {
    width: 3px;
    border-radius: 2px;
    background: linear-gradient(180deg, #c9a96e, #d4a574);
    box-shadow: 0 0 8px rgba(201,169,110,0.35);
    animation: gl-bar-pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  /* Resting heights & stagger delays — creates the wave */
  .gl-bar--1 { height: 12px; animation-delay: 0.0s; }
  .gl-bar--2 { height: 20px; animation-delay: 0.1s; }
  .gl-bar--3 { height: 32px; animation-delay: 0.2s; }
  .gl-bar--4 { height: 20px; animation-delay: 0.3s; }
  .gl-bar--5 { height: 12px; animation-delay: 0.4s; }

  @keyframes gl-bar-pulse {
    0%, 100% { transform: scaleY(1);    opacity: 0.55; }
    50%      { transform: scaleY(1.9);  opacity: 1; }
  }

  /* ── Label ── */
  .gl-label {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-size: 15px;
    font-weight: 400;
    font-style: italic;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: #c9a96e;
    opacity: 0;
    animation: gl-label-in 0.6s ease 0.35s forwards;
  }
  @keyframes gl-label-in {
    to { opacity: 0.82; }
  }

  /* ── Decorative fill line ── */
  .gl-fill-track {
    width: 120px;
    height: 1px;
    background: rgba(201,169,110,0.15);
    border-radius: 1px;
    overflow: hidden;
    opacity: 0;
    animation: gl-label-in 0.5s ease 0.55s forwards;
  }
  .gl-fill-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, transparent, #c9a96e, transparent);
    border-radius: 1px;
    animation: gl-fill 2.8s cubic-bezier(0.4, 0, 0.6, 1) 0.7s infinite;
  }
  @keyframes gl-fill {
    0%   { width: 0%;   opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { width: 100%; opacity: 0; }
  }
`;

export default GlobalLoading;