// ============================================================
// Gesture Detection Engine — REAL MediaPipe Hands Detection
// Runs entirely in the browser via @mediapipe/hands CDN WASM
// ============================================================

import type { GestureType, ActionType, Gesture, Landmark, Settings } from '../types';

// ─── Gesture Catalog ─────────────────────────────────────────
export const GESTURE_CATALOG: Gesture[] = [
  {
    id: 'thumbs_up',
    name: 'Thumbs Up',
    emoji: '👍',
    action: 'Volume Up',
    description: 'Raise thumb, curl other fingers',
    color: '#4ade80',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'thumbs_down',
    name: 'Thumbs Down',
    emoji: '👎',
    action: 'Volume Down',
    description: 'Lower thumb, curl other fingers',
    color: '#f87171',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'open_palm',
    name: 'Open Palm',
    emoji: '✋',
    action: 'Play / Pause',
    description: 'Spread all 5 fingers open',
    color: '#4f8ef7',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'fist',
    name: 'Closed Fist',
    emoji: '✊',
    action: 'Take Screenshot',
    description: 'All fingers curled into fist',
    color: '#f472b6',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'pointing',
    name: 'Pointing',
    emoji: '☝️',
    action: 'Select / Click',
    description: 'Only index finger extended upward',
    color: '#fb923c',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'two_fingers',
    name: 'Two Fingers',
    emoji: '✌️',
    action: 'Scroll Up',
    description: 'Index and middle finger extended',
    color: '#a78bfa',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'ok_sign',
    name: 'OK Sign',
    emoji: '👌',
    action: 'Open Browser',
    description: 'Thumb and index finger form circle',
    color: '#2dd4bf',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'swipe_left',
    name: 'Swipe Left',
    emoji: '👈',
    action: 'Previous Track',
    description: 'Point hand to the left',
    color: '#fbbf24',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'swipe_right',
    name: 'Swipe Right',
    emoji: '👉',
    action: 'Next Track',
    description: 'Point hand to the right',
    color: '#38bdf8',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'three_fingers_up',
    name: 'Three Fingers Up',
    emoji: '🤟',
    action: 'Brightness Up',
    description: 'Index, middle, ring upward',
    color: '#fcd34d',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'three_fingers_down',
    name: 'Three Fingers Down',
    emoji: '⬇️',
    action: 'Brightness Down',
    description: 'Index, middle, ring downward',
    color: '#f59e0b',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'four_fingers',
    name: 'Four Fingers Open',
    emoji: '🖐️',
    action: 'Mute',
    description: 'All 4 fingers open, thumb curled',
    color: '#6ee7b7',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'pinch_in',
    name: 'Pinch In',
    emoji: '🤏',
    action: 'Zoom In',
    description: 'Thumb and index touching',
    color: '#c084fc',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'pinch_out',
    name: 'Pinch Out',
    emoji: '🤌',
    action: 'Zoom Out',
    description: 'Thumb and index apart, others curled',
    color: '#d8b4fe',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'swipe_up',
    name: 'Swipe Up',
    emoji: '👆',
    action: 'Navigate Home',
    description: 'Swift upward movement',
    color: '#67e8f9',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'swipe_down',
    name: 'Swipe Down',
    emoji: '👇',
    action: 'Scroll Down',
    description: 'Swift downward movement',
    color: '#06b6d4',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'palm_push',
    name: 'Palm Push',
    emoji: '✋',
    action: 'Confirm',
    description: 'Open palm close to camera',
    color: '#86efac',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'palm_pull',
    name: 'Palm Pull',
    emoji: '🖐️',
    action: 'Cancel',
    description: 'Open palm pulled away',
    color: '#cbd5e1',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'finger_gun',
    name: 'Finger Gun',
    emoji: '🔫',
    action: 'Like / Favorite',
    description: 'Thumb & index extended',
    color: '#fca5a5',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'rock_sign',
    name: 'Rock Sign',
    emoji: '🤘',
    action: 'Play / Pause',
    description: 'Index and pinky extended',
    color: '#93c5fd',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'heart',
    name: 'Korean Heart',
    emoji: '🫰',
    action: 'Like / Favorite',
    description: 'Thumb and index crossed',
    color: '#f9a8d4',
    enabled: true,
    confidence: 0,
  },
  {
    id: 'none',
    name: 'No Gesture',
    emoji: '⬜',
    action: 'No Action',
    description: 'No hand gesture detected',
    color: '#2d3748',
    enabled: true,
    confidence: 0,
  },
];

// ─── Landmark Connections (MediaPipe Hand Model) ─────────────
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// ─── Landmark indices ─────────────────────────────────────────
const WRIST       = 0;
const THUMB_CMC   = 1; const THUMB_MCP = 2; const THUMB_IP = 3; const THUMB_TIP = 4;
const INDEX_MCP   = 5; const INDEX_PIP = 6;                    const INDEX_TIP = 8;
const MIDDLE_MCP  = 9; const MIDDLE_PIP = 10;                  const MIDDLE_TIP = 12;
const RING_MCP    = 13; const RING_PIP  = 14;                  const RING_TIP  = 16;
const PINKY_MCP   = 17; const PINKY_PIP = 18;                  const PINKY_TIP = 20;

// ─── Helper: is a finger extended? ──────────────────────────
function isFingerExtended(
  lms: Landmark[],
  tip: number,
  pip: number,
  mcp: number
): boolean {
  // Finger is "extended" when tip is further from wrist than pip & mcp
  const wrist = lms[WRIST];
  const tipLm = lms[tip];
  const pipLm = lms[pip];
  const mcpLm = lms[mcp];
  if (!wrist || !tipLm || !pipLm || !mcpLm) return false;

  const dist = (a: Landmark, b: Landmark) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const tipDist = dist(tipLm, wrist);
  const pipDist = dist(pipLm, wrist);

  // Tip must be clearly further from wrist than PIP
  return tipDist > pipDist * 1.1;
}

// ─── Helper: thumb extended? ─────────────────────────────────
function isThumbExtended(lms: Landmark[]): boolean {
  const tip    = lms[THUMB_TIP];
  const ip     = lms[THUMB_IP];
  const mcp    = lms[THUMB_MCP];
  const cmc    = lms[THUMB_CMC];
  const wrist  = lms[WRIST];
  const indexMcp = lms[INDEX_MCP];
  if (!tip || !ip || !mcp || !cmc || !wrist || !indexMcp) return false;

  const dist = (a: Landmark, b: Landmark) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  // Thumb extended = tip is far from index MCP
  return dist(tip, indexMcp) > dist(mcp, indexMcp) * 1.1;
}

// ─── Helper: thumb pointing up? ──────────────────────────────
function isThumbUp(lms: Landmark[]): boolean {
  const tip   = lms[THUMB_TIP];
  const mcp   = lms[THUMB_MCP];
  const wrist = lms[WRIST];
  if (!tip || !mcp || !wrist) return false;
  // Thumb tip is above the MCP (in screen coords y decreases upward)
  return tip.y < mcp.y && tip.y < wrist.y;
}

function isThumbDown(lms: Landmark[]): boolean {
  const tip   = lms[THUMB_TIP];
  const mcp   = lms[THUMB_MCP];
  const wrist = lms[WRIST];
  if (!tip || !mcp || !wrist) return false;
  return tip.y > mcp.y && tip.y > wrist.y;
}

// ─── Helper: dist between two landmarks ──────────────────────
function dist2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Real Gesture Classifier ─────────────────────────────────
export function classifyLandmarks(
  lms: Landmark[],
  settings: Settings
): { gesture: GestureType; confidence: number } {
  if (!lms || lms.length < 21) {
    return { gesture: 'none', confidence: 0 };
  }

  const indexExt  = isFingerExtended(lms, INDEX_TIP,  INDEX_PIP,  INDEX_MCP);
  const middleExt = isFingerExtended(lms, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringExt   = isFingerExtended(lms, RING_TIP,   RING_PIP,   RING_MCP);
  const pinkyExt  = isFingerExtended(lms, PINKY_TIP,  PINKY_PIP,  PINKY_MCP);
  const thumbExt  = isThumbExtended(lms);
  const thumbUp   = isThumbUp(lms);
  const thumbDown = isThumbDown(lms);

  const extCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;
  const sens = settings.sensitivity;

  const wrist     = lms[WRIST];
  const thumbTip  = lms[THUMB_TIP];
  const indexTip  = lms[INDEX_TIP];
  const middleTip = lms[MIDDLE_TIP];
  const pinkyTip  = lms[PINKY_TIP];
  const indexPip  = lms[INDEX_PIP];

  // ── Thumbs Up: only thumb extended + pointing up, all fingers curled
  if (thumbExt && thumbUp && !indexExt && !middleExt && !ringExt && !pinkyExt) {
    return { gesture: 'thumbs_up', confidence: 0.88 + sens * 0.08 };
  }

  // ── Thumbs Down: only thumb extended + pointing down, all fingers curled
  if (thumbExt && thumbDown && !indexExt && !middleExt && !ringExt && !pinkyExt) {
    return { gesture: 'thumbs_down', confidence: 0.88 + sens * 0.08 };
  }

  // ── Closed Fist: nothing extended
  if (!indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) {
    return { gesture: 'fist', confidence: 0.85 + sens * 0.08 };
  }

  // ── Finger Gun: thumb + index extended, middle/ring/pinky curled
  // Must check before open_palm and rock_sign
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    // Distinguish from thumbs_up: index must also be extended (not just thumb)
    return { gesture: 'finger_gun', confidence: 0.86 + sens * 0.08 };
  }

  // ── Rock Sign: index + pinky extended, middle + ring curled, thumb can be either
  if (indexExt && !middleExt && !ringExt && pinkyExt) {
    return { gesture: 'rock_sign', confidence: 0.87 + sens * 0.08 };
  }

  // ── Open Palm: all 4 fingers + thumb extended — check push/pull via z-depth
  if (indexExt && middleExt && ringExt && pinkyExt && thumbExt) {
    // Palm Push: wrist z significantly close to camera (negative = closer)
    // MediaPipe z is relative — smaller = closer to camera
    const avgZ = (lms[INDEX_MCP].z + lms[MIDDLE_MCP].z + lms[RING_MCP].z + lms[PINKY_MCP].z) / 4;
    if (avgZ < -0.07) {
      return { gesture: 'palm_push', confidence: 0.83 + sens * 0.08 };
    }
    if (avgZ > 0.07) {
      return { gesture: 'palm_pull', confidence: 0.81 + sens * 0.08 };
    }
    return { gesture: 'open_palm', confidence: 0.91 + sens * 0.06 };
  }

  // ── Four Fingers Open: all 4 fingers open, thumb NOT extended
  if (indexExt && middleExt && ringExt && pinkyExt && !thumbExt) {
    return { gesture: 'four_fingers', confidence: 0.86 + sens * 0.08 };
  }

  // ── Three Fingers: index + middle + ring, pinky curled, no thumb
  if (indexExt && middleExt && ringExt && !pinkyExt && !thumbExt) {
    // Up or Down based on where fingertips are relative to wrist
    const midTipY = (indexTip.y + middleTip.y + lms[RING_TIP].y) / 3;
    if (midTipY < wrist.y - 0.05) {
      return { gesture: 'three_fingers_up', confidence: 0.84 + sens * 0.08 };
    }
    return { gesture: 'three_fingers_down', confidence: 0.82 + sens * 0.08 };
  }

  // ── Two Fingers (peace / V sign): index + middle only
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    const midX = (indexTip.x + middleTip.x) / 2;
    const midY = (indexTip.y + middleTip.y) / 2;

    // Swipe Up: fingers pointing high above wrist
    if (midY < wrist.y - 0.25) {
      return { gesture: 'swipe_up', confidence: 0.80 + sens * 0.08 };
    }
    // Swipe Down  
    if (midY > wrist.y + 0.1) {
      return { gesture: 'swipe_down', confidence: 0.80 + sens * 0.08 };
    }
    // Swipe left/right detection
    if (midX < wrist.x - 0.15) {
      return { gesture: 'swipe_left', confidence: 0.80 + sens * 0.08 };
    }
    if (midX > wrist.x + 0.15) {
      return { gesture: 'swipe_right', confidence: 0.80 + sens * 0.08 };
    }
    return { gesture: 'two_fingers', confidence: 0.87 + sens * 0.08 };
  }

  // ── Pointing: only index finger extended
  if (indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) {
    // Swipe Up: index pointing well above wrist
    if (indexTip.y < wrist.y - 0.25) {
      return { gesture: 'swipe_up', confidence: 0.82 + sens * 0.08 };
    }
    // Swipe Down: index pointing below wrist level
    if (indexTip.y > wrist.y + 0.05) {
      return { gesture: 'swipe_down', confidence: 0.80 + sens * 0.08 };
    }
    // Swipe direction via x axis
    if (indexTip.x < wrist.x - 0.1) {
      return { gesture: 'swipe_left', confidence: 0.82 + sens * 0.08 };
    }
    if (indexTip.x > wrist.x + 0.1) {
      return { gesture: 'swipe_right', confidence: 0.82 + sens * 0.08 };
    }
    return { gesture: 'pointing', confidence: 0.88 + sens * 0.08 };
  }

  // ── OK Sign: thumb + index close, middle/ring/pinky extended
  if (!indexExt && middleExt && ringExt && pinkyExt) {
    const d = dist2D(thumbTip, indexTip);
    if (d < 0.08) {
      return { gesture: 'ok_sign', confidence: 0.86 + sens * 0.08 };
    }
  }

  // ── Pinch In: thumb + index tips touching, middle/ring/pinky curled
  if (!indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
    const d = dist2D(thumbTip, indexTip);
    if (d < 0.07) {
      return { gesture: 'pinch_in', confidence: 0.85 + sens * 0.08 };
    }
  }

  // ── Pinch Out: thumb + index both somewhat extended but separated, others curled
  if (!middleExt && !ringExt && !pinkyExt) {
    const d = dist2D(thumbTip, indexTip);
    if (d > 0.1 && d < 0.25) {
      return { gesture: 'pinch_out', confidence: 0.82 + sens * 0.08 };
    }
  }

  // ── Korean Heart: thumb tip crosses over index PIP/middle joint area
  // Thumb and index form a small snap shape — thumb tip near index PIP
  if (!middleExt && !ringExt && !pinkyExt) {
    const dThumbIndexPip = dist2D(thumbTip, indexPip);
    if (dThumbIndexPip < 0.06) {
      return { gesture: 'heart', confidence: 0.83 + sens * 0.08 };
    }
  }

  // ── Swipe left/right fallback (3+ fingers as a broad hand gesture)
  if (extCount >= 3) {
    const middleMcp = lms[MIDDLE_MCP];
    if (middleMcp && middleMcp.x < wrist.x - 0.12) {
      return { gesture: 'swipe_left', confidence: 0.78 + sens * 0.1 };
    }
    if (middleMcp && middleMcp.x > wrist.x + 0.12) {
      return { gesture: 'swipe_right', confidence: 0.78 + sens * 0.1 };
    }
  }

  // ── Swipe Up fallback (single finger high)
  if (pinkyTip && pinkyTip.y < wrist.y - 0.3 && extCount >= 1) {
    return { gesture: 'swipe_up', confidence: 0.75 + sens * 0.1 };
  }

  return { gesture: 'none', confidence: 0 };
}

// ─── Action Mapper ─────────────────────────────────────────────
export function mapGestureToAction(gesture: GestureType): ActionType {
  const map: Record<GestureType, ActionType> = {
    thumbs_up:          'Volume Up',
    thumbs_down:        'Volume Down',
    open_palm:          'Play / Pause',
    swipe_left:         'Previous Track',
    swipe_right:        'Next Track',
    two_fingers:        'Scroll Up',
    fist:               'Take Screenshot',
    ok_sign:            'Open Browser',
    pointing:           'Select / Click',
    peace:              'No Action',
    three_fingers_up:   'Brightness Up',
    three_fingers_down: 'Brightness Down',
    four_fingers:       'Mute',
    pinch_in:           'Zoom In',
    pinch_out:          'Zoom Out',
    swipe_up:           'Navigate Home',
    swipe_down:         'Scroll Down',
    palm_push:          'Confirm',
    palm_pull:          'Cancel',
    finger_gun:         'Like / Favorite',
    rock_sign:          'Play / Pause',
    heart:              'Like / Favorite',
    none:               'No Action',
  };
  return map[gesture] ?? 'No Action';
}

// ─── Draw Real Landmarks on Canvas ───────────────────────────
export function drawLandmarksOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number,
  showBox: boolean,
  color = '#6366f1'
) {
  if (!landmarks || landmarks.length === 0) return;

  // Convert normalized [0,1] coords → pixel coords (mirrored x)
  const toPixel = (lm: Landmark) => ({
    px: (1 - lm.x) * canvasWidth,   // mirror X
    py: lm.y * canvasHeight,
  });

  ctx.save();

  // ── Draw connections ────────────────────────────────────────
  ctx.strokeStyle = `${color}70`;
  ctx.lineWidth   = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;

  for (const [a, b] of HAND_CONNECTIONS) {
    const lA = landmarks[a];
    const lB = landmarks[b];
    if (!lA || !lB) continue;
    const pA = toPixel(lA);
    const pB = toPixel(lB);
    ctx.beginPath();
    ctx.moveTo(pA.px, pA.py);
    ctx.lineTo(pB.px, pB.py);
    ctx.stroke();
  }

  // ── Draw joints ─────────────────────────────────────────────
  ctx.shadowBlur = 0;
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const { px, py } = toPixel(lm);
    const isFingerTip = [4, 8, 12, 16, 20].includes(i);
    const radius = isFingerTip ? 6 : 3.5;

    // Subtle halo
    ctx.beginPath();
    ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = `${color}14`;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, `${color}55`);
    ctx.fillStyle  = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }

  // ── Bounding box ─────────────────────────────────────────────
  if (showBox && landmarks.length > 0) {
    const pixels = landmarks.map(toPixel);
    const xs = pixels.map(p => p.px);
    const ys = pixels.map(p => p.py);
    const x1 = Math.min(...xs) - 16;
    const y1 = Math.min(...ys) - 16;
    const x2 = Math.max(...xs) + 16;
    const y2 = Math.max(...ys) + 16;
    const w  = x2 - x1;
    const h  = y2 - y1;
    const c  = 14;

    // Dashed rect
    ctx.strokeStyle = `${color}50`;
    ctx.lineWidth   = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(x1, y1, w, h);
    ctx.setLineDash([]);

    // Corner brackets
    const corner = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * c);
      ctx.strokeStyle = `${color}cc`;
      ctx.lineWidth   = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 8;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    };
    corner(x1, y1,  1,  1);
    corner(x2, y1, -1,  1);
    corner(x1, y2,  1, -1);
    corner(x2, y2, -1, -1);
  }

  ctx.restore();
}

// ─── FPS Calculator ────────────────────────────────────────────
export class FPSCounter {
  private frames: number[] = [];
  private maxFrames = 60;

  tick(): number {
    const now = performance.now();
    this.frames.push(now);
    if (this.frames.length > this.maxFrames) this.frames.shift();
    if (this.frames.length < 2) return 0;
    const dt = (this.frames[this.frames.length - 1] - this.frames[0]) / 1000;
    return Math.round((this.frames.length - 1) / dt);
  }
}
