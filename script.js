
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  color-scheme: dark;
  --bg: #111019;
  --panel: #1b1926;
  --panel-light: #242131;
  --border: #343044;
  --text: #f5f1ff;
  --muted: #a49db7;
  --accent: #bb91ff;
  --accent-bright: #d3b5ff;
  --gold: #ffcb75;
  --green: #7de5b0;
  --red: #ff8595;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 15% 0%, #352343 0, transparent 35%),
    radial-gradient(ellipse at 90% 40%, #22213c 0, transparent 32%),
    var(--bg);
  color: var(--text);
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
}

button {
  font: inherit;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: 4px;
}

.topbar {
  height: 76px;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ffffff0d;
  background: #111019a8;
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
  font-weight: 800;
  letter-spacing: 1.2px;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(135deg, #d3adff, #8556d6);
  color: #20162c;
  font-size: 21px;
  box-shadow: 0 4px 20px #ad80ff35;
}

.brand-light {
  color: var(--accent);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-status {
  color: var(--green);
  font-size: 12px;
  margin-right: 6px;
}

.small-button {
  padding: 9px 13px;
  color: var(--text);
  background: var(--panel-light);
  border: 1px solid var(--border);
  border-radius: 9px;
  cursor: pointer;
  transition: 0.2s;
}

.small-button:hover {
  border-color: var(--accent);
  background: #30283e;
}

.danger-button:hover {
  border-color: var(--red);
  color: var(--red);
}

.game-layout {
  width: min(1380px, 92%);
  margin: 34px auto 50px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
  align-items: start;
  gap: 24px;
}

.panel {
  background: linear-gradient(145deg, #211e2d, #191722);
  border: 1px solid var(--border);
  border-radius: 19px;
  box-shadow: 0 18px 50px #00000017;
}

.main-panel {
  padding: 34px 30px 26px;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.eyebrow {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

h1, h2, p {
  margin-top: 0;
}

h1 {
  margin: 10px 0;
  font-size: clamp(27px, 3vw, 38px);
  letter-spacing: -1.5px;
}

h2 {
  margin: 7px 0 0;
  font-size: 21px;
  letter-spacing: -0.6px;
}

.subtitle, .section-description {
  color: var(--muted);
  line-height: 1.65;
}

.subtitle {
  margin-bottom: 25px;
  font-size: 13px;
}

.cookie-total {
  font-size: clamp(34px, 4vw, 48px);
  font-weight: 800;
  letter-spacing: -2px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.cookie-label {
  margin-top: 5px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-top: 25px;
}

.stat-card {
  display: grid;
  gap: 8px;
  padding: 13px 5px;
  background: #ffffff05;
  border: 1px solid #ffffff0c;
  border-radius: 12px;
}

.stat-card span {
  color: var(--muted);
  font-size: 11px;
}

.stat-card strong {
  font-size: 17px;
}

.cookie-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 310px;
  margin: 8px 0;
}

.cookie-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: #bd86ff13;
  box-shadow: 0 0 85px #bd86ff14;
  pointer-events: none;
}

.cookie-button {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 220px;
  height: 220px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 16px 15px #0000004d);
  transition: transform 0.12s, filter 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.cookie-button:hover {
  filter: drop-shadow(0 16px 22px #d09a6045);
  transform: translateY(-3px) rotate(-2deg);
}

.cookie-button:active,
.cookie-button.clicked {
  transform: scale(0.91) rotate(2deg);
}

.pixel-cookie {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  overflow: visible;
}

.click-hint {
  position: absolute;
  bottom: 8px;
  color: #c5b0e8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.floating-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

.float-number {
  position: absolute;
  color: var(--gold);
  font-weight: 800;
  font-size: 19px;
  text-shadow: 0 2px 12px #000;
  animation: float-up 0.9s ease-out forwards;
}

@keyframes float-up {
  0% { opacity: 0; transform: translateY(8px) scale(.8); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-85px) scale(1.1); }
}

.progress-section {
  text-align: left;
  padding-top: 18px;
  border-top: 1px solid #ffffff0d;
}

.progress-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 11px;
  margin-bottom: 10px;
}

.progress-heading span:last-child {
  text-align: right;
}

.progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 10px;
  background: #ffffff0d;
}

.progress-fill {
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, #9262e3, #d4aaff);
  border-radius: inherit;
  transition: width 0.3s;
}

.bottom-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  text-align: left;
  margin-top: 25px;
}

.bottom-stats > div, .prestige-stats > div {
  display: grid;
  gap: 8px;
}

.muted-label {
  color: var(--muted);
  font-size: 11px;
}

.bottom-stats strong, .prestige-stats strong {
  font-size: 17px;
  overflow-wrap: anywhere;
}

.side-column {
  display: grid;
  gap: 20px;
}

.shop-panel, .achievement-panel, .prestige-panel {
  padding: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.item-count {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
}

.section-description {
  font-size: 12px;
  margin: 10px 0 18px;
}

.shop-list {
  display: grid;
  gap: 10px;
}

.shop-item {
  display: grid;
  grid-template-columns: 45px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px;
  background: #ffffff04;
  border: 1px solid #ffffff10;
  border-radius: 13px;
  transition: border-color .2s, background .2s;
}

.shop-item.affordable {
  border-color: #b991ff4a;
  background: #bb91ff08;
}

.building-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #ad87ff14;
  font-size: 25px;
}

.building-info {
  min-width: 0;
}

.building-name {
  font-weight: 700;
  font-size: 12px;
}

.building-description {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
}

.building-owned {
  margin-top: 6px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
}

.buy-button {
  min-width: 84px;
  max-width: 120px;
  padding: 10px 9px;
  display: grid;
  justify-items: center;
  gap: 5px;
  border: 1px solid #b58afc35;
  border-radius: 10px;
  color: #e8d8ff;
  background: #b58afc15;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.buy-button span {
  font-size: 10px;
}

.buy-button:hover:not(:disabled) {
  background: #b58afc2d;
  border-color: var(--accent);
}

.buy-button:disabled {
  cursor: not-allowed;
  opacity: .4;
}

.achievement-list {
  display: grid;
  gap: 9px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ffffff0c;
  background: #ffffff03;
  border-radius: 12px;
}

.achievement-item.unlocked {
  border-color: #e4b86b45;
  background: #ffcb7508;
}

.achievement-icon {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  background: #ffffff08;
  border-radius: 10px;
  font-size: 18px;
  filter: grayscale(1);
  opacity: .5;
}

.unlocked .achievement-icon {
  filter: none;
  opacity: 1;
}

.achievement-info {
  min-width: 0;
}

.achievement-name {
  font-size: 12px;
  font-weight: 700;
}

.achievement-description {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
}

.achievement-check {
  margin-left: auto;
  color: var(--green);
  font-size: 12px;
}

.prestige-top {
  display: flex;
  align-items: center;
  gap: 13px;
}

.prestige-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid #d7adff40;
  border-radius: 13px;
  color: var(--gold);
  background: #bb91ff13;
  font-size: 25px;
}

.prestige-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #ffffff0c;
  border-bottom: 1px solid #ffffff0c;
}

.prestige-note {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
  margin: 15px 0;
}

.primary-button {
  width: 100%;
  padding: 13px;
  border: 0;
  border-radius: 11px;
  color: #24162f;
  background: linear-gradient(110deg, #c7a1ff, #e0c3ff);
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: .2s;
}

.primary-button:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.primary-button:disabled {
  cursor: not-allowed;
  filter: grayscale(.5);
  opacity: .45;
}

footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  width: min(1380px, 92%);
  margin: 0 auto;
  padding: 20px 0 30px;
  color: var(--muted);
  font-size: 10px;
}

footer span:first-child {
  font-weight: 800;
  letter-spacing: 1.5px;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, 20px);
  padding: 13px 18px;
  max-width: 90%;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  background: #282336;
  box-shadow: 0 12px 35px #0006;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s, transform .2s;
}

.toast.visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (max-width: 850px) {
  .game-layout {
    grid-template-columns: 1fr;
    width: min(620px, 92%);
  }

  .main-panel {
    padding: 28px 20px;
  }

  .cookie-stage {
    min-height: 280px;
  }

  .cookie-button {
    width: 200px;
    height: 200px;
  }

  .side-column {
    grid-template-columns: 1fr;
  }

  footer {
    width: 92%;
  }
}

@media (max-width: 480px) {
  .topbar {
    height: auto;
    min-height: 68px;
    padding: 14px 4%;
    gap: 8px;
  }

  .brand {
    gap: 7px;
    font-size: 10px;
    letter-spacing: .4px;
  }

  .brand-icon {
    width: 30px;
    height: 30px;
  }

  .top-actions {
    gap: 5px;
  }

  .save-status {
    display: none;
  }

  .small-button {
    padding: 8px;
    font-size: 11px;
  }

  .game-layout {
    margin-top: 20px;
    gap: 15px;
  }

  .shop-panel, .achievement-panel, .prestige-panel {
    padding: 17px;
  }

  .shop-item {
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 9px;
    padding: 10px 8px;
  }

  .building-icon {
    width: 38px;
    height: 38px;
    font-size: 21px;
  }

  .buy-button {
    min-width: 74px;
    padding: 9px 6px;
  }

  footer {
    flex-direction: column;
    line-height: 1.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
