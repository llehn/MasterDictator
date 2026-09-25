// Generates the Central Committee portraits in assets/portraits/.
// Usage: node tools/portraits/generate.js
// PNG rendering needs Microsoft Edge or Chrome; set BROWSER to its path if it is not found.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');


const INK = '#1a1412', RED = '#c1121f', RED2 = '#8f0d16', RED3 = '#5c070d', GOLD = '#e0a83a', GOLD2 = '#b8862a', CREAM = '#f3e9d6';
// poster background and microphone: the Midnight palette of the app icon (steel blue, fire)
const STEEL = '#48636f', STEEL2 = '#1b2d36', STEEL3 = '#05090c', FIRE = '#ff5e1a', FIRE_Y = '#ffbf3a', FIRE_D = '#a8200f';
const STAR = 'M0-12l3.5 8.3 9 .5-7.2 5.5 2.7 8.7L0 6l-8 5 2.7-8.7-7.2-5.5 9-.5z';

const SKIN = {
  fair: { b: '#efd5b2', s: '#d4a982', d: '#a8795a', h: '#fbe8cc', lip: '#b8715a' },
  warm: { b: '#e8c49c', s: '#c99a70', d: '#9a6a48', h: '#f6dcb8', lip: '#a8624a' },
  tan: { b: '#d6a67a', s: '#b3845a', d: '#855a38', h: '#e9c496', lip: '#8c5038' },
};

const mirror = d => d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (m, x, y) => `${+(400 - x).toFixed(1)} ${y}`);
const star = (x, y, s, fill = GOLD, op = 1) => `<path d="${STAR}" transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}"/>`;

function background(p) {
  let rays = '';
  const n = 28, cx = 200, cy = 215, R = 700;
  for (let i = 0; i < n; i += 2) {
    const a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
    rays += `M${cx} ${cy}L${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}L${(cx + R * Math.cos(a2)).toFixed(1)} ${(cy + R * Math.sin(a2)).toFixed(1)}Z`;
  }
  return `<rect width="400" height="500" fill="url(#${p}bg)"/>
<path d="${rays}" fill="${STEEL3}" opacity=".32"/>
<rect width="400" height="500" fill="url(#${p}ht)" opacity=".9"/>
<circle cx="200" cy="215" r="178" fill="${FIRE}" opacity=".10"/>
<circle cx="200" cy="215" r="132" fill="${FIRE}" opacity=".10"/>
${star(44, 50, 1.1, FIRE_Y)}${star(358, 70, .7, FIRE_Y)}${star(30, 150, .55, FIRE_Y, .7)}${star(376, 170, .5, FIRE_Y, .7)}`;
}

function defs(p, skin) {
  return `<defs>
<radialGradient id="${p}bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="${STEEL}"/><stop offset=".6" stop-color="${STEEL2}"/><stop offset="1" stop-color="${STEEL3}"/></radialGradient>
<pattern id="${p}ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3" cy="3" r="1" fill="${INK}" opacity=".16"/></pattern>
<pattern id="${p}hs" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="2.25" cy="2.25" r=".95" fill="${skin.d}" opacity=".55"/></pattern>
<pattern id="${p}hc" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="2.5" cy="2.5" r="1.1" fill="#000" opacity=".28"/></pattern>
<linearGradient id="${p}grille" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${FIRE_D}"/><stop offset=".35" stop-color="${FIRE}"/><stop offset=".55" stop-color="${FIRE_Y}"/><stop offset="1" stop-color="${FIRE_D}"/></linearGradient>
<linearGradient id="${p}shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
</defs>`;
}

// ---- body ----
const SH = 'M-10 510V440C-10 400 30 376 90 364C124 357 148 348 162 338H238C252 348 276 357 310 364C370 376 410 400 410 440V510Z';
function body(p, c, cs, ch) {
  return `<clipPath id="${p}sh"><path d="${SH}"/></clipPath>
<path d="${SH}" fill="${c}"/>
<g clip-path="url(#${p}sh)">
 <path d="M-20 330H150C126 380 112 440 118 520H-20Z" fill="${cs}"/>
 <path d="M-20 330H150C126 380 112 440 118 520H-20Z" fill="url(#${p}hc)" opacity=".6"/>
 <path d="M296 360C360 372 404 398 412 440V520H396C394 440 362 392 296 374Z" fill="${ch}" opacity=".75"/>
 <path d="M60 420C70 450 72 480 70 510M330 420C322 450 322 480 326 510" stroke="${cs}" stroke-width="3" fill="none" opacity=".7"/>
 <rect y="440" width="400" height="70" fill="url(#${p}shade)"/>
</g>`;
}
function neck(p, s) {
  return `<path d="M168 290V354C182 366 218 366 232 354V290Z" fill="${s.b}"/>
<path d="M168 290V354C174 358 180 362 188 364C182 340 180 316 182 290Z" fill="${s.s}"/>
<path d="M164 292C176 336 224 336 236 292V334C222 350 178 350 164 334Z" fill="${s.d}" opacity=".55"/>`;
}
const standCollar = (c, cs, trim) => `<path d="M158 326C155 344 155 362 160 378C180 388 220 388 240 378C245 362 245 344 242 326C222 338 178 338 158 326Z" fill="${c}"/>
<path d="M158 326C155 344 155 362 160 378C170 383 184 386 196 387C184 372 176 350 176 334C168 332 162 330 158 326Z" fill="${cs}"/>
${trim ? `<path d="M158 326C178 338 222 338 242 326M160 376C180 386 220 386 240 376" stroke="${trim}" stroke-width="3" fill="none"/>` : ''}
<path d="M200 338V388" stroke="${cs}" stroke-width="2.5"/>`;
const maoCollar = (c, cs, ch) => `<path d="M160 320C170 336 230 336 240 320V350C220 360 180 360 160 350Z" fill="${cs}"/>
<path d="M150 332L200 374L200 398L190 398L134 352Z" fill="${c}"/><path d="M250 332L200 374L200 398L210 398L266 352Z" fill="${ch}"/>
<path d="M150 332L200 374M250 332L200 374" stroke="${cs}" stroke-width="2.5"/>
<path d="M134 352L190 398H210L266 352" stroke="${cs}" stroke-width="2" fill="none" opacity=".6"/>`;
function suitFront(shirt, tie, lapel, lapelH, dots) {
  return `<path d="M164 334L200 420L236 334Z" fill="${shirt}"/>
<path d="M164 330L186 364L199 346L178 326Z" fill="${shirt}" stroke="#b9ae98" stroke-width="1.5"/><path d="M236 330L214 364L201 346L222 326Z" fill="${shirt}" stroke="#b9ae98" stroke-width="1.5"/>
<path d="M190 350H210L205 368H195Z" fill="${tie}"/><path d="M195 368L188 450L200 470L212 450L205 368Z" fill="${tie}"/>
${dots ? `<g fill="#f6eedd"><circle cx="200" cy="358" r="1.8"/><circle cx="196" cy="384" r="2"/><circle cx="204" cy="398" r="2"/><circle cx="195" cy="414" r="2"/><circle cx="204" cy="430" r="2"/><circle cx="197" cy="446" r="2"/><circle cx="203" cy="376" r="1.8"/></g>` : ''}
<path d="M150 338L198 452L164 510H118L138 420L116 360Z" fill="${lapel}"/><path d="M250 338L202 452L236 510H282L262 420L284 360Z" fill="${lapelH}"/>
<path d="M150 338L198 452M250 338L202 452" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
}
const board = (x, y, r, c, edge, extra = '') => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-34" y="-9" width="68" height="18" rx="4" fill="${c}" stroke="${edge}" stroke-width="2"/>${extra}</g>`;
const buttons = (ys, c = GOLD) => ys.map(y => `<circle cx="200" cy="${y}" r="4.5" fill="${c}"/><circle cx="198.8" cy="${y - 1.2}" r="1.5" fill="#fff" opacity=".6"/>`).join('');

// ---- head ----
function head(p, s, face, earY, earX = [116, 284]) {
  const [lx, rx] = earX;
  const earL = `M${lx + 4} ${earY - 8}C${lx - 14} ${earY - 16} ${lx - 20} ${earY + 10} ${lx - 16} ${earY + 28}C${lx - 12} ${earY + 42} ${lx - 2} ${earY + 48} ${lx + 8} ${earY + 42}Z`;
  const earR = `M${rx - 4} ${earY - 8}C${rx + 14} ${earY - 16} ${rx + 20} ${earY + 10} ${rx + 16} ${earY + 28}C${rx + 12} ${earY + 42} ${rx + 2} ${earY + 48} ${rx - 8} ${earY + 42}Z`;
  return `<path d="${earL}" fill="${s.s}" stroke="${s.d}" stroke-width="1.5"/>
<path d="M${lx - 4} ${earY}C${lx - 10} ${earY + 8} ${lx - 10} ${earY + 22} ${lx - 4} ${earY + 32}" stroke="${s.d}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="${earR}" fill="${s.b}" stroke="${s.d}" stroke-width="1.5"/>
<path d="M${rx + 4} ${earY}C${rx + 10} ${earY + 8} ${rx + 10} ${earY + 22} ${rx + 4} ${earY + 32}" stroke="${s.d}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<clipPath id="${p}face"><path d="${face}"/></clipPath>
<path d="${face}" fill="${s.b}"/>
<g clip-path="url(#${p}face)">
 <path d="M40 40H178C150 110 136 196 148 262C158 314 190 344 236 368H40Z" fill="${s.s}"/>
 <path d="M40 40H160C140 110 130 196 140 262C148 310 172 338 206 360H40Z" fill="url(#${p}hs)" opacity=".7"/>
 <ellipse cx="236" cy="168" rx="34" ry="22" fill="${s.h}" opacity=".85"/>
 <ellipse cx="252" cy="252" rx="16" ry="12" fill="${s.h}" opacity=".7"/>
 <ellipse cx="170" cy="${earY - 2}" rx="26" ry="15" fill="${s.s}" opacity=".55"/>
 <ellipse cx="230" cy="${earY - 2}" rx="24" ry="14" fill="${s.s}" opacity=".35"/>
 <path d="M150 340C170 324 230 324 260 340V380H150Z" fill="${s.d}" opacity=".25"/>
</g>
<path d="${face}" fill="none" stroke="${s.d}" stroke-width="2"/>`;
}

function eye(p, k, cx, cy, s, o = {}) {
  const w = o.w ?? 14, op = o.o ?? 5.5, ir = o.ir ?? 6.2, iris = o.iris ?? '#3a2a1e', heavy = o.heavy ?? 0, lid = o.lid ?? 3.2;
  const alm = `M${cx - w} ${cy}C${cx - w * .5} ${cy - op * 1.45} ${cx + w * .5} ${cy - op * 1.45} ${cx + w} ${cy}C${cx + w * .45} ${cy + op * 1.05} ${cx - w * .45} ${cy + op * 1.05} ${cx - w} ${cy}Z`;
  const lidCurve = `M${cx - w - 1.5} ${cy + .5}C${cx - w * .5} ${cy - op * 1.45 + heavy} ${cx + w * .5} ${cy - op * 1.45 + heavy} ${cx + w + 1.5} ${cy - .5}`;
  const id = `${p}e${k}`;
  return `<clipPath id="${id}"><path d="${alm}"/></clipPath>
<path d="${alm}" fill="${CREAM}"/>
<g clip-path="url(#${id})">
 <circle cx="${cx}" cy="${cy - .3}" r="${ir}" fill="${iris}"/><circle cx="${cx}" cy="${cy - .3}" r="${ir * .48}" fill="#0c0908"/>
 <circle cx="${cx + ir * .38}" cy="${cy - ir * .42}" r="${ir * .26}" fill="#fff" opacity=".9"/>
 ${heavy ? `<path d="${lidCurve}L${cx + w + 2} ${cy - op * 2.2}L${cx - w - 2} ${cy - op * 2.2}Z" fill="${s.s}"/>` : ''}
 <path d="${alm}" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
</g>
<path d="${lidCurve}" fill="none" stroke="${INK}" stroke-width="${lid}" stroke-linecap="round"/>
${heavy ? '' : `<path d="M${cx - w * .8} ${cy - op - 3.5}C${cx - w * .3} ${cy - op * 1.9 - 2.5} ${cx + w * .4} ${cy - op * 1.9 - 2.5} ${cx + w * .85} ${cy - op - 2}" stroke="${s.d}" stroke-width="1.6" fill="none" opacity=".7"/>`}
<path d="M${cx - w * .7} ${cy + op * .95 + 1}C${cx - w * .2} ${cy + op * 1.35 + 1.5} ${cx + w * .3} ${cy + op * 1.35 + 1.5} ${cx + w * .75} ${cy + op * .8 + 1}" stroke="${s.d}" stroke-width="1.3" fill="none" opacity=".6"/>`;
}
const eyes = (p, cy, s, o = {}, lx = 170, rx = 230) => eye(p, 'l', lx, cy, s, o) + eye(p, 'r', rx, cy, s, o);

function nose(s, tip, k = 1, top = 222) {
  const X = dx => (200 + dx * k).toFixed(1);
  return `<path d="M${X(-7)} ${top}C${X(-9)} ${top + 20} ${X(-15)} ${tip - 14} ${X(-17)} ${tip - 4}C${X(-10)} ${tip + 4} ${X(0)} ${tip + 3} ${X(4)} ${tip}C${X(-4)} ${tip - 10} ${X(-2)} ${top + 14} ${X(-7)} ${top}Z" fill="${s.s}" opacity=".85"/>
<path d="M${X(-6)} ${top}C${X(-8)} ${top + 22} ${X(-14)} ${tip - 12} ${X(-15)} ${tip - 4}" stroke="${s.d}" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>
<path d="M${X(-16)} ${tip - 6}C${X(-24)} ${tip + 2} ${X(-15)} ${tip + 9} ${X(-6)} ${tip + 5}C${X(-2)} ${tip + 8} ${X(2)} ${tip + 8} ${X(6)} ${tip + 5}C${X(15)} ${tip + 9} ${X(24)} ${tip + 2} ${X(16)} ${tip - 6}" stroke="${s.d}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<ellipse cx="${X(-8)}" cy="${tip + 3.5}" rx="${3.6 * k}" ry="2" fill="${INK}" opacity=".6"/><ellipse cx="${X(8)}" cy="${tip + 3.5}" rx="${3.6 * k}" ry="2" fill="${INK}" opacity=".6"/>
<ellipse cx="${X(4)}" cy="${tip - 6}" rx="${5 * k}" ry="4" fill="${s.h}" opacity=".9"/>
<path d="M${X(5)} ${top + 6}C${X(6)} ${top + 20} ${X(7)} ${tip - 20} ${X(6)} ${tip - 12}" stroke="${s.h}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
}
const nasolabial = (s, y, op = .5) => `<path d="M${176} ${y}C166 ${y + 10} 160 ${y + 22} 160 ${y + 34}M224 ${y}C234 ${y + 10} 240 ${y + 22} 240 ${y + 34}" stroke="${s.d}" stroke-width="2" fill="none" opacity="${op}" stroke-linecap="round"/>`;

function mic(p) {
  let bars = '';
  for (let y = -32; y <= 32; y += 6.5) bars += `M-20 ${y.toFixed(1)}H20`;
  return `<path d="M316 450V520" stroke="${INK}" stroke-width="9"/><path d="M314 450V520" stroke="#4a3f38" stroke-width="2"/>
<g transform="translate(322 404) rotate(-16)">
 <path d="M-36 6C-36 48 36 48 36 6" stroke="${INK}" stroke-width="7" fill="none"/>
 <rect x="-5" y="38" width="10" height="16" fill="${INK}"/>
 <rect x="-27" y="-46" width="54" height="92" rx="27" fill="${INK}"/>
 <rect x="-21" y="-40" width="42" height="80" rx="21" fill="url(#${p}grille)"/>
 <path d="${bars}" stroke="${INK}" stroke-width="2.2" opacity=".55"/>
 <rect x="-3" y="-42" width="6" height="84" fill="${INK}"/>
 <path d="M-15 -30C-18 -14 -18 14 -15 30" stroke="#fff6dc" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
 <circle cx="-36" cy="6" r="5" fill="${FIRE}"/><circle cx="36" cy="6" r="5" fill="${FIRE}"/>
</g>
<g fill="none" stroke="${FIRE}" stroke-width="5" stroke-linecap="round" transform="translate(346 336) rotate(-40)">
 <path d="M0 0a20 20 0 0 1 0 40" opacity=".9"/><path d="M9-10a34 34 0 0 1 0 60" opacity=".6"/><path d="M18-20a48 48 0 0 1 0 80" opacity=".35"/>
</g>`;
}

const parts = (p, s, label, inner) => ({ p, s, label: label.replace(' speaking into a microphone', ''), inner });

// ---------------- characters ----------------
const chars = [];

// 1 STALIN
{
  const p = 'st', s = SKIN.fair, HAIR = '#2c2724';
  const face = 'M200 124C254 124 286 160 286 212C286 258 272 292 250 312C234 326 216 334 200 334C184 334 166 326 150 312C128 292 114 258 114 212C114 160 146 124 200 124Z';
  const tunic = '#d8cdb0', tunicS = '#a89c7e', tunicH = '#f1e9d4';
  const pocks = [[150, 262], [158, 272], [246, 266], [238, 278], [252, 280], [146, 280]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${s.d}" opacity=".35"/>`).join('');
  const inner = `${body(p, tunic, tunicS, tunicH)}
${board(66, 382, -16, GOLD, GOLD2, `<path d="M-30 0H30" stroke="${GOLD2}" stroke-width="1.5"/>${star(16, 0, .5, RED)}`)}
${board(334, 382, 16, GOLD, GOLD2, `<path d="M-30 0H30" stroke="${GOLD2}" stroke-width="1.5"/>${star(-16, 0, .5, RED)}`)}
<path d="M200 380V510" stroke="${tunicS}" stroke-width="3"/>${buttons([404, 440, 476])}
<path d="M96 418h40v14H96z" fill="${RED}"/><path d="M96 418h40v14H96z" fill="none" stroke="${GOLD2}" stroke-width="1.5"/>${star(116, 452, 1.35, GOLD)}${star(116, 452, .7, '#f6d991')}
<path d="M226 440h60M226 440v34h60v-34" stroke="${tunicS}" stroke-width="2.5" fill="none"/>
${neck(p, s)}${standCollar(tunic, tunicS, GOLD)}
${head(p, s, face, 210)}
<path d="M116 214C106 160 124 106 176 90C204 82 244 86 266 104C290 124 296 170 284 214C280 190 272 170 260 156C244 144 224 140 200 140C176 140 156 146 142 158C130 170 122 190 116 214Z" fill="${HAIR}"/>
<path d="M150 150C162 122 190 104 226 102M170 144C184 120 214 108 248 112M136 172C142 140 162 116 190 104M210 140C230 124 256 122 274 136M124 190C124 160 138 132 160 116" stroke="#6d655e" stroke-width="2.6" fill="none" opacity=".75" stroke-linecap="round"/>
<path d="M186 142C206 118 240 110 266 122" stroke="#9a938b" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>
<path d="M116 214C112 196 114 180 120 168C124 186 126 200 128 214ZM284 214C288 196 286 180 280 168C276 186 274 200 272 214Z" fill="#7a736c"/>
<path d="M144 200C150 184 172 178 192 190C192 196 176 194 162 196C154 197 148 200 144 200Z" fill="${HAIR}"/><path d="${mirror('M144 200C150 184 172 178 192 190C192 196 176 194 162 196C154 197 148 200 144 200Z')}" fill="${HAIR}"/>
${eyes(p, 214, s, { w: 14, o: 5.6, heavy: 2.6, iris: '#5a4430' })}
${nose(s, 262, 1.15)}${nasolabial(s, 262)}${pocks}
<path d="M182 308C190 316 210 316 218 308C210 311 190 311 182 308Z" fill="${s.lip}"/>
<path d="M200 270C184 262 162 264 148 278C140 290 142 302 150 304C158 296 172 292 186 294C194 295 198 292 200 288C202 292 206 295 214 294C228 292 242 296 250 304C258 302 260 290 252 278C238 264 216 262 200 270Z" fill="${HAIR}"/>
<path d="M156 290C168 280 184 276 196 278M244 290C232 280 216 276 204 278M162 298C172 290 184 288 192 290" stroke="#6d655e" stroke-width="1.8" fill="none" opacity=".8" stroke-linecap="round"/>
<ellipse cx="200" cy="322" rx="16" ry="5" fill="${s.h}" opacity=".6"/>`;
  chars.push({ name: 'Spolem', basedOn: 'Stalin', title: 'General Secretary of Offline Affairs', quote: 'Trust is good. Airplane mode is better.', art: parts(p, s, 'Caricature of a mustachioed marshal speaking into a microphone', inner) });
}

// 2 LENIN
{
  const p = 'ln', s = SKIN.fair, HAIR = '#7a4a2c', HD = '#56321c';
  const face = 'M200 98C258 98 288 142 288 204C288 254 274 290 252 310C236 324 218 332 200 332C182 332 164 324 148 310C126 290 112 254 112 204C112 142 142 98 200 98Z';
  const suit = '#2c2724', suitS = '#1a1715', suitH = '#48413b';
  const inner = `${body(p, suit, suitS, suitH)}
${neck(p, s)}${suitFront('#f3ecdc', RED, suitS, suit, true)}
<path d="M222 470h46l-4 8h-42z" fill="${suitS}"/>
${head(p, s, face, 208)}
<ellipse cx="226" cy="138" rx="38" ry="24" fill="${s.h}" opacity=".95"/><ellipse cx="236" cy="128" rx="13" ry="6" fill="#fff" opacity=".4"/>
<path d="M162 150C182 142 218 142 238 150M168 164C186 158 214 158 232 164" stroke="${s.d}" stroke-width="1.8" fill="none" opacity=".45" stroke-linecap="round"/>
<path d="M114 230C106 204 108 180 118 162C124 180 128 204 130 226Z" fill="${HAIR}"/><path d="${mirror('M114 230C106 204 108 180 118 162C124 180 128 204 130 226Z')}" fill="${HAIR}"/>
<path d="M116 200C114 186 116 176 120 170M284 200C286 186 284 176 280 170" stroke="${HD}" stroke-width="2" fill="none"/>
<path d="M144 194C154 180 176 176 192 186C180 184 162 186 146 198Z" fill="${HAIR}"/><path d="${mirror('M144 194C154 180 176 176 192 186C180 184 162 186 146 198Z')}" fill="${HAIR}"/>
${eyes(p, 212, s, { w: 14, o: 3.6, ir: 5.2, iris: '#4a3322', lid: 3.4 })}
<path d="M140 208L132 204M140 214L131 216M260 208L268 204M260 214L269 216" stroke="${s.d}" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>
<path d="M150 236C156 256 162 268 172 276M250 236C244 256 238 268 228 276" stroke="${s.s}" stroke-width="7" fill="none" opacity=".7" stroke-linecap="round"/>
${nose(s, 260, 1.05)}
<path d="M186 292C194 297 206 297 214 292C208 296 192 296 186 292Z" fill="${s.lip}" stroke="${s.lip}" stroke-width="2"/>
<path d="M170 294C172 318 186 346 200 360C214 346 228 318 230 294C220 304 210 308 200 308C190 308 180 304 170 294Z" fill="${HAIR}"/>
<path d="M188 312C190 328 194 340 200 352M212 312C210 328 206 340 200 352M178 306C182 318 186 328 190 336M222 306C218 318 214 328 210 336" stroke="${HD}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M200 276C186 268 168 270 156 282C164 288 178 288 188 286C194 285 198 283 200 281C202 283 206 285 212 286C222 288 236 288 244 282C232 270 214 268 200 276Z" fill="${HAIR}"/>
<path d="M164 282C174 278 186 276 196 278M236 282C226 278 214 276 204 278" stroke="${HD}" stroke-width="1.6" fill="none"/>`;
  chars.push({ name: 'Lanom', basedOn: 'Lenin', title: 'Chairman of the Council of Local Processing', quote: 'What is to be done? Dictate.', art: parts(p, s, 'Caricature of a bald revolutionary with a goatee speaking into a microphone', inner) });
}

// 3 MAO
{
  const p = 'mo', s = SKIN.fair, HAIR = '#1c1715';
  const face = 'M200 118C254 118 288 154 288 210C288 264 276 298 254 318C236 334 218 340 200 340C182 340 164 334 146 318C124 298 112 264 112 210C112 154 146 118 200 118Z';
  const c = '#8b9197', cs = '#5e656b', ch = '#b1b7bb';
  const inner = `${body(p, c, cs, ch)}
<path d="M200 396V510" stroke="${cs}" stroke-width="2.5"/>${buttons([418, 452, 486], '#4d5358')}
<path d="M84 432h58v10H84zM258 432h58v10h-58z" fill="${cs}"/><path d="M84 442l29 8 29-8" fill="none" stroke="${cs}" stroke-width="2"/>
<circle cx="113" cy="470" r="15" fill="${RED}" stroke="${GOLD}" stroke-width="3"/>${star(113, 471, .7, GOLD)}
${neck(p, s)}${maoCollar(c, cs, ch)}
${head(p, s, face, 214, [114, 286])}
<path d="M116 196C110 146 138 96 200 94C262 96 290 146 284 196C280 172 268 150 246 140C230 134 214 132 200 134C186 132 170 134 154 140C132 150 120 172 116 196Z" fill="${HAIR}"/>
<path d="M150 130C170 110 210 104 244 114M140 146C156 124 182 112 212 110M232 128C252 132 268 146 276 164" stroke="#4d4540" stroke-width="2.4" fill="none" opacity=".8" stroke-linecap="round"/>
<path d="M150 196C160 190 174 190 186 194M250 196C240 190 226 190 214 194" stroke="${HAIR}" stroke-width="4" fill="none" stroke-linecap="round"/>
${eyes(p, 216, s, { w: 13.5, o: 4.8, heavy: 1.6, ir: 5.8 })}
<ellipse cx="150" cy="262" rx="22" ry="16" fill="${s.h}" opacity=".35"/><ellipse cx="252" cy="262" rx="22" ry="16" fill="${s.h}" opacity=".7"/>
${nose(s, 266, 1.25)}${nasolabial(s, 268, .45)}
<path d="M178 298C188 304 212 304 222 298" stroke="${s.lip}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M184 302C192 312 208 312 216 302C208 305 192 305 184 302Z" fill="${s.lip}" opacity=".7"/>
<path d="M174 296l4 3M226 296l-4 3" stroke="${s.d}" stroke-width="2" stroke-linecap="round"/>
<circle cx="214" cy="320" r="4.6" fill="#3a2a22"/><circle cx="213" cy="318.5" r="1.2" fill="#fff" opacity=".35"/>`;
  chars.push({ name: 'Moe', basedOn: 'Mao', title: 'Chairman of the Hundred Languages', quote: 'Let a hundred languages bloom. Let none be uploaded.', art: parts(p, s, 'Caricature of a round-faced chairman in a grey tunic speaking into a microphone', inner) });
}

// 4 HITLER
{
  const p = 'hy', s = SKIN.fair, HAIR = '#1f1916';
  const face = 'M200 118C250 118 280 156 280 210C280 258 268 292 248 314C232 330 216 338 200 338C184 338 168 330 152 314C132 292 120 258 120 210C120 156 150 118 200 118Z';
  const c = '#7d6a4a', cs = '#554631', ch = '#a08b64';
  const inner = `${body(p, c, cs, ch)}
${neck(p, s)}${suitFront('#b9a57c', '#3a2c1e', cs, c, false)}
<path d="M86 440h52v36H86z" fill="none" stroke="${cs}" stroke-width="2.5"/><path d="M86 440l26 8 26-8" fill="none" stroke="${cs}" stroke-width="2"/>
${head(p, s, face, 212, [120, 280])}
<path d="M118 212C110 158 132 108 190 100C250 94 286 132 282 200C276 176 266 158 250 148C232 140 214 138 196 140C176 142 160 150 150 164C138 180 128 196 122 214Z" fill="#2c2420"/>
<path d="M236 132C206 136 176 150 158 174C148 188 140 204 136 220C150 200 166 186 184 176C206 166 226 156 246 146Z" fill="${HAIR}"/>
<path d="M232 104C238 116 242 128 246 142" stroke="#6a5e56" stroke-width="2" fill="none"/>
<path d="M170 150C190 138 214 132 236 134M160 166C180 150 204 142 226 140" stroke="#5a4e46" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>
<path d="M146 200C158 193 174 193 188 197L188 202C174 200 160 200 146 205Z" fill="${HAIR}"/><path d="${mirror('M146 200C158 193 174 193 188 197L188 202C174 200 160 200 146 205Z')}" fill="${HAIR}"/>
${eyes(p, 216, s, { w: 13.5, o: 6, ir: 6.6, iris: '#3d5a7a' })}
<path d="M190 200C194 206 196 212 196 218M210 200C206 206 204 212 204 218" stroke="${s.d}" stroke-width="1.6" opacity=".6" fill="none"/>
${nose(s, 264, 1.08)}${nasolabial(s, 268, .55)}
<path d="M188 274H212C214 282 214 288 211 292H189C186 288 186 282 188 274Z" fill="${HAIR}"/>
<path d="M180 305C192 301 208 301 220 305" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M186 308C194 313 206 313 214 308" stroke="${s.lip}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  chars.push({ name: 'Hadlor', basedOn: 'Hitler', title: 'Chancellor of the Loud Voice', quote: 'Had a lot to say. None of it needed a cloud.', art: parts(p, s, 'Caricature of a stern chancellor with a toothbrush mustache speaking into a microphone', inner) });
}

// 5 KIM
{
  const p = 'km', s = SKIN.fair, HAIR = '#151111';
  const face = 'M200 124C258 124 294 160 294 216C294 270 282 306 258 326C240 342 220 348 200 348C180 348 160 342 142 326C118 306 106 270 106 216C106 160 142 124 200 124Z';
  const c = '#232020', cs = '#121010', ch = '#3f3a3a';
  const inner = `${body(p, c, cs, ch)}
<path d="M200 396V510" stroke="${cs}" stroke-width="2.5"/>${buttons([420, 456, 492], '#0c0a0a')}
${neck(p, s)}${maoCollar(c, cs, ch)}
${head(p, s, face, 220, [108, 292])}
<path d="M110 226C104 200 110 174 124 158L130 186C120 198 114 212 112 228Z" fill="#6b625e" opacity=".75"/><path d="${mirror('M110 226C104 200 110 174 124 158L130 186C120 198 114 212 112 228Z')}" fill="#6b625e" opacity=".55"/>
<path d="M126 180C120 150 122 112 134 94C150 82 250 82 266 94C278 112 280 150 274 180C266 164 248 152 226 148C210 146 190 146 174 148C152 152 134 164 126 180Z" fill="${HAIR}"/>
<path d="M146 100C176 92 224 92 254 100M140 122C170 112 230 112 262 122" stroke="#4d4646" stroke-width="2.6" fill="none" opacity=".8" stroke-linecap="round"/>
<path d="M150 206C160 200 174 200 186 204M250 206C240 200 226 200 214 204" stroke="${HAIR}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
${eyes(p, 226, s, { w: 12.5, o: 4, heavy: 1.8, ir: 5.2, iris: '#2a1d16' })}
<ellipse cx="148" cy="272" rx="24" ry="15" fill="#e8907c" opacity=".35"/><ellipse cx="252" cy="272" rx="24" ry="15" fill="#e8907c" opacity=".35"/>
<ellipse cx="258" cy="264" rx="12" ry="8" fill="${s.h}" opacity=".8"/>
${nose(s, 272, 1.18, 232)}
<path d="M180 302C192 310 208 310 220 302" stroke="${s.lip}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<path d="M186 306C194 312 206 312 214 306C206 308 194 308 186 306Z" fill="${s.lip}" opacity=".7"/>
<path d="M176 298l4 4M224 298l-4 4" stroke="${s.d}" stroke-width="2" stroke-linecap="round"/>
<path d="M156 334C176 348 224 348 244 334" stroke="${s.d}" stroke-width="2.2" fill="none" opacity=".6"/>`;
  chars.push({ name: 'Jim Chong-am', basedOn: 'Kim Jong-un', title: 'Supreme Leader of Airplane Mode', quote: 'My phone has no internet either.', art: parts(p, s, 'Caricature of a chubby supreme leader with a flat-top haircut speaking into a microphone', inner) });
}

// 6 MUSSOLINI
{
  const p = 'mz', s = SKIN.warm;
  const face = 'M200 104C252 104 282 142 284 196C286 240 290 276 278 306C266 334 236 350 200 352C164 350 134 334 122 306C110 276 114 240 116 196C118 142 148 104 200 104Z';
  const c = '#3f4436', cs = '#272a21', ch = '#5d634f';
  const ribbons = [['#1f7a3a', '#f3ecdc', RED], [GOLD, '#1f3a8a', GOLD], ['#6a2a8a', '#f3ecdc', '#6a2a8a']].map((r, i) => r.map((col, j) => `<rect x="${92 + j * 16}" y="${424 + i * 12}" width="16" height="10" fill="${col}"/>`).join('')).join('');
  const inner = `${body(p, c, cs, ch)}
${neck(p, s)}${suitFront('#1a1817', '#0e0d0c', cs, c, false)}
${ribbons}<rect x="92" y="424" width="48" height="34" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".6"/>
${head(p, s, face, 212)}
<ellipse cx="228" cy="140" rx="36" ry="22" fill="${s.h}" opacity=".95"/><ellipse cx="238" cy="130" rx="13" ry="6" fill="#fff" opacity=".35"/>
<path d="M124 200C120 170 130 140 150 122" stroke="#7a6252" stroke-width="10" fill="none" opacity=".25" stroke-linecap="round"/>
<path d="M142 204C154 192 176 190 192 198C190 204 174 202 160 204C152 205 146 206 142 204Z" fill="${INK}"/><path d="${mirror('M142 204C154 192 176 190 192 198C190 204 174 202 160 204C152 205 146 206 142 204Z')}" fill="${INK}"/>
${eyes(p, 220, s, { w: 14, o: 5.6, heavy: 3.8 })}
${nose(s, 268, 1.2, 226)}${nasolabial(s, 270, .6)}
<path d="M174 302C188 296 212 296 226 302" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M178 304C188 320 212 320 222 304C210 308 190 308 178 304Z" fill="${s.lip}"/><path d="M190 310C196 313 204 313 210 310" stroke="${s.h}" stroke-width="2" opacity=".6" fill="none"/>
<path d="M174 302l-5 7M226 302l5 7" stroke="${s.d}" stroke-width="2.2" stroke-linecap="round"/>
<ellipse cx="208" cy="336" rx="24" ry="10" fill="${s.h}" opacity=".8"/><path d="M200 326v12" stroke="${s.d}" stroke-width="2" opacity=".6"/>
<path d="M128 300C140 320 160 336 180 344M272 300C262 320 244 336 222 344" stroke="#7a6252" stroke-width="8" fill="none" opacity=".18" stroke-linecap="round"/>`;
  chars.push({ name: 'Mozzarellini', basedOn: 'Mussolini', title: 'Il Duce of Punctuality', quote: 'Makes the transcription run on time.', art: parts(p, s, 'Caricature of a bald, jutting-jawed strongman speaking into a microphone', inner) });
}

// 7 CASTRO
{
  const p = 'cs', s = SKIN.warm, B = '#1d1714';
  const face = 'M200 122C252 122 282 160 282 214C282 262 270 296 250 316C234 332 216 340 200 340C184 340 166 332 150 316C130 296 118 262 118 214C118 160 148 122 200 122Z';
  const c = '#4f5c3a', cs = '#343e26', ch = '#6c7b52';
  let tex = '';
  for (let i = 0; i < 46; i++) {
    const a = (i * 137.5) % 360, r = 18 + ((i * 29) % 58);
    const x = 200 + Math.cos(a * Math.PI / 180) * r * 1.05, y = 318 + Math.sin(a * Math.PI / 180) * r * .55;
    if (y < 282) continue;
    tex += `M${x.toFixed(1)} ${y.toFixed(1)}c2 5 1 9-2 12`;
  }
  const inner = `${body(p, c, cs, ch)}
${board(70, 380, -16, cs, '#232a1a', `<path d="M-6-6l6 6-6 6-6-6z" transform="translate(14 0)" fill="${RED}"/>`)}${board(330, 380, 16, cs, '#232a1a', `<path d="M-6-6l6 6-6 6-6-6z" transform="translate(-14 0)" fill="${RED}"/>`)}
<path d="M84 430h58v42H84zM84 430h58v12H84z" fill="none" stroke="${cs}" stroke-width="2.5"/><circle cx="113" cy="438" r="2.5" fill="${cs}"/>
${neck(p, s)}
<path d="M160 330L200 420L240 330L262 350L214 440H186L138 350Z" fill="${cs}"/><path d="M168 334L200 404L232 334Z" fill="${s.s}"/>
<path d="M150 332L198 386L176 400L134 350Z" fill="${c}"/><path d="M250 332L202 386L224 400L266 350Z" fill="${ch}"/>
${head(p, s, face, 212, [118, 282])}
<path d="M118 214C116 262 126 306 148 334C166 356 184 368 200 370C216 368 234 356 252 334C274 306 284 262 282 214C276 244 266 264 252 276C238 270 222 268 200 270C178 268 162 270 148 276C134 264 124 244 118 214Z" fill="${B}"/>
<path d="${tex}" stroke="#4a3e36" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M130 240c2 16 6 30 14 42M270 240c-2 16-6 30-14 42M140 296c8 16 20 30 34 40M260 296c-8 16-20 30-34 40" stroke="#4a3e36" stroke-width="2" fill="none" opacity=".8"/>
<path d="M186 296C194 301 206 301 214 296C208 305 192 305 186 296Z" fill="#3a1f18"/>
<path d="M200 278C184 272 166 276 156 288C170 292 186 290 200 288C214 290 230 292 244 288C234 276 216 272 200 278Z" fill="${B}"/>
<g transform="translate(190 300) rotate(160)"><rect x="0" y="-6.5" width="68" height="13" rx="5" fill="#7a4a2a"/><rect x="0" y="-6.5" width="68" height="4" rx="2" fill="#9a6440" opacity=".7"/><rect x="12" y="-7" width="9" height="14" fill="${RED}"/><rect x="14" y="-7" width="5" height="14" fill="${GOLD}"/><rect x="62" y="-6.5" width="7" height="13" rx="2" fill="#9a918a"/><rect x="67" y="-6.5" width="3" height="13" rx="1.5" fill="#ff7a2e"/></g>
<path d="M124 318C112 302 134 290 120 272C110 258 126 246 118 232" stroke="#f3e9d6" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
<path d="M146 204C158 196 174 196 188 200L188 205C174 203 160 203 146 208Z" fill="${B}"/><path d="${mirror('M146 204C158 196 174 196 188 200L188 205C174 203 160 203 146 208Z')}" fill="${B}"/>
${eyes(p, 218, s, { w: 13.5, o: 5.6, ir: 6 })}
${nose(s, 264, 1, 224)}
<path d="M118 214C116 196 118 186 122 180L130 214ZM282 214C284 196 282 186 278 180L270 214Z" fill="${B}"/>
<path d="M116 186L124 104C150 88 250 88 276 104L284 186C250 174 150 174 116 186Z" fill="${c}"/>
<path d="M116 186L124 104C136 98 146 95 156 93C146 120 142 150 146 178C134 180 124 183 116 186Z" fill="${cs}"/>
<path d="M124 104C150 92 250 92 276 104C250 114 150 114 124 104Z" fill="${ch}"/>
<path d="M114 182C150 170 250 170 286 182L290 198C250 186 150 186 110 198Z" fill="#262d1b"/><path d="M116 184C150 174 250 174 284 184" stroke="${ch}" stroke-width="1.5" fill="none" opacity=".6"/>
<path d="M200 128L216 146L200 164L184 146Z" fill="${RED}"/><path d="M184 146L216 146L200 164Z" fill="${INK}"/>${star(200, 146, .45, '#f3ecdc')}`;
  chars.push({ name: 'Gosdra', basedOn: 'Castro', title: 'Comandante of the Long Dictation', quote: 'Spoke for seven hours. Nothing was uploaded.', art: parts(p, s, 'Caricature of a bearded comandante with cap and cigar speaking into a microphone', inner) });
}

// 8 NAPOLEON
{
  const p = 'np', s = SKIN.fair, HAIR = '#4a3222';
  const face = 'M200 126C250 126 280 162 280 214C280 260 268 292 248 312C232 326 216 334 200 334C184 334 168 326 152 312C132 292 120 260 120 214C120 162 150 126 200 126Z';
  const c = '#1f2c55', cs = '#131b38', ch = '#34467a';
  const fringe = x0 => Array.from({ length: 9 }, (_, i) => `M${x0 + i * 7} 392l${(i - 4) * .6} 16`).join('');
  const inner = `${body(p, c, cs, ch)}
<path d="M160 338L200 470L240 338Z" fill="#efe6d2"/><path d="M160 338L200 470L200 338Z" fill="#d6cab0"/>${buttons([400, 428, 456], GOLD2)}
<path d="M150 338L196 452L160 510H118L138 420L116 360Z" fill="${cs}"/><path d="M250 338L204 452L240 510H282L262 420L284 360Z" fill="${c}"/>
<path d="M150 338L196 452M250 338L204 452" stroke="${GOLD}" stroke-width="2.5"/>
<g transform="rotate(-14 70 380)"><rect x="34" y="370" width="72" height="22" rx="8" fill="${GOLD}"/><path d="${fringe(38)}" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round"/><rect x="34" y="370" width="72" height="8" rx="4" fill="#f6d991" opacity=".6"/></g>
<g transform="rotate(14 330 380)"><rect x="294" y="370" width="72" height="22" rx="8" fill="${GOLD}"/><path d="${fringe(298)}" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round"/><rect x="294" y="370" width="72" height="8" rx="4" fill="#f6d991" opacity=".6"/></g>
<path d="M40 520C60 474 100 446 146 432L152 454C118 466 100 490 94 520Z" fill="${cs}"/>
<path d="M140 426C156 420 170 420 176 426L178 452C166 458 152 460 142 456Z" fill="${RED}" stroke="${GOLD}" stroke-width="2"/>
<path d="M174 426C184 420 200 422 206 430L206 450C196 456 184 456 176 452Z" fill="${s.b}"/><path d="M180 434h20M180 442h20" stroke="${s.d}" stroke-width="1.5" opacity=".6"/>
<path d="M204 424L206 456" stroke="#b9ae98" stroke-width="2.5"/>
${neck(p, s)}
<path d="M154 320C152 340 154 358 160 372C180 382 220 382 240 372C246 358 248 340 246 320C224 334 176 334 154 320Z" fill="${RED}"/>
<path d="M160 330C176 340 224 340 240 330M162 364C180 374 220 374 238 364" stroke="${GOLD}" stroke-width="3" fill="none"/>
<path d="M176 336C170 350 176 364 186 368M224 336C230 350 224 364 214 368" stroke="${GOLD}" stroke-width="2" fill="none" opacity=".8"/>
<path d="M182 336C190 350 210 350 218 336L214 372C206 376 194 376 186 372Z" fill="#f6efe0"/>
${head(p, s, face, 212, [120, 280])}
<path d="M122 222C118 196 122 176 130 164L140 214ZM278 222C282 196 278 176 270 164L260 214Z" fill="${HAIR}"/>
<path d="M176 150C168 170 172 186 186 194C182 180 186 166 196 156ZM198 152C196 168 204 180 216 184C210 172 212 162 218 154ZM220 152C222 164 230 172 240 174C234 166 236 158 240 152Z" fill="${HAIR}"/>
<path d="M148 200C160 193 174 193 188 197M252 200C240 193 226 193 212 197" stroke="${HAIR}" stroke-width="5" fill="none" stroke-linecap="round"/>
${eyes(p, 216, s, { w: 13.5, o: 5.8, ir: 6.2, iris: '#5a6f86' })}
${nose(s, 266, 1.08)}
<path d="M182 302C192 299 208 299 218 302" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M186 305C194 310 206 310 214 305" stroke="${s.lip}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M196 324C198 327 202 327 204 324" stroke="${s.d}" stroke-width="1.8" fill="none"/>
<path d="M28 168C44 104 120 62 200 60C280 62 356 104 372 168C340 150 270 140 200 140C130 140 60 150 28 168Z" fill="#141111"/>
<path d="M28 168C60 150 130 142 200 142C270 142 340 150 372 168C336 164 270 160 200 160C130 160 64 164 28 168Z" fill="#0a0908"/>
<path d="M36 160C52 104 124 68 200 66C276 68 348 104 364 160" stroke="${GOLD}" stroke-width="3" fill="none"/>
<path d="M70 140C96 108 144 86 200 82" stroke="#4a4444" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
<path d="M150 72V120" stroke="${GOLD}" stroke-width="5"/><circle cx="150" cy="98" r="17" fill="#1f3a8a"/><circle cx="150" cy="98" r="11.5" fill="#f3ecdc"/><circle cx="150" cy="98" r="6" fill="${RED}"/>`;
  chars.push({ name: 'Mabureon', basedOn: 'Napoleon', title: 'Emperor of the Compact Model', quote: 'Small model. Big conquests.', art: parts(p, s, 'Caricature of an emperor in a sideways bicorne hat speaking into a microphone', inner) });
}

// 9 GADDAFI
{
  const p = 'gf', s = SKIN.tan, HAIR = '#1c1512', HL = '#3d2c22';
  const face = 'M200 128C250 128 280 164 280 218C280 262 268 294 248 314C232 328 216 336 200 336C184 336 168 328 152 314C132 294 120 262 120 218C120 164 150 128 200 128Z';
  const c = '#e6dcc3', cs = '#b9ad90', ch = '#f7f1e2';
  let curlsBack = '', curlsBackHi = '', curlLines = '';
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (0.92 + i * (1.16 / 16));
    const x = 200 + Math.cos(a) * 96, y = 206 + Math.sin(a) * 100;
    curlsBack += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(28 + (i % 3) * 4)}"/>`;
    const x2 = 200 + Math.cos(a) * 104, y2 = 200 + Math.sin(a) * 108;
    curlsBackHi += `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${14 + (i % 2) * 4}"/>`;
    curlLines += `M${(x2 - 8).toFixed(1)} ${(y2 + 2).toFixed(1)}a8 8 0 1 1 10 6`;
  }
  const colors = [RED, '#1f7a3a', GOLD, '#1f3a8a', '#f3ecdc', '#6a2a8a', '#2a8a8a', RED2];
  let ribbons = '';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) {
    const col = colors[(r * 3 + k * 5) % colors.length], col2 = colors[(r * 5 + k * 3 + 2) % colors.length];
    ribbons += `<rect x="${60 + k * 22}" y="${404 + r * 13}" width="22" height="11" fill="${col}"/><rect x="${68 + k * 22}" y="${404 + r * 13}" width="6" height="11" fill="${col2}"/>`;
  }
  const inner = `<g fill="${HAIR}">${curlsBack}</g><g fill="${HL}">${curlsBackHi}</g><path d="${curlLines}" stroke="#5c4434" stroke-width="2" fill="none"/>
${body(p, c, cs, ch)}
${board(66, 380, -16, GOLD, GOLD2, `${star(-14, 0, .45, RED)}${star(4, 0, .45, RED)}<path d="M18-6l6 6-6 6" stroke="${GOLD2}" stroke-width="2" fill="none"/>`)}
${board(334, 380, 16, GOLD, GOLD2, `${star(14, 0, .45, RED)}${star(-4, 0, .45, RED)}<path d="M-18-6l-6 6 6 6" stroke="${GOLD2}" stroke-width="2" fill="none"/>`)}
${ribbons}<rect x="60" y="404" width="88" height="63" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".5"/>
${star(104, 488, 1.3, GOLD)}${star(104, 488, .6, RED)}
<path d="M40 392C60 430 110 446 150 420M46 402C70 446 120 462 156 432" stroke="${GOLD}" stroke-width="4" fill="none"/>
<path d="M200 386V510" stroke="${cs}" stroke-width="2.5"/>${buttons([412, 448, 484], GOLD)}
${neck(p, s)}${standCollar(c, cs, GOLD)}
<path d="M168 350h64M166 362h68" stroke="${GOLD}" stroke-width="2.5"/>
${head(p, s, face, 214, [120, 280])}
<path d="M124 206C118 160 140 122 200 116C260 122 282 160 276 206C268 182 254 164 236 158C220 154 212 160 200 156C188 160 176 154 160 158C146 164 132 182 124 206Z" fill="${HAIR}"/>
<g fill="${HL}"><circle cx="144" cy="150" r="12"/><circle cx="170" cy="136" r="12"/><circle cx="200" cy="130" r="13"/><circle cx="230" cy="136" r="12"/><circle cx="256" cy="150" r="12"/></g>
<path d="M136 152a7 7 0 1 1 9 5M162 138a7 7 0 1 1 9 5M192 132a7 7 0 1 1 9 5M222 138a7 7 0 1 1 9 5M248 152a7 7 0 1 1 9 5" stroke="#5c4434" stroke-width="2" fill="none"/>
<path d="M160 176C180 170 220 170 240 176" stroke="${s.d}" stroke-width="1.6" fill="none" opacity=".5"/>
<path d="M150 194C160 188 176 188 188 192M250 194C240 188 224 188 212 192" stroke="${HAIR}" stroke-width="4" fill="none" stroke-linecap="round"/>
<defs><linearGradient id="${p}lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e120c"/><stop offset=".6" stop-color="#4a2c18"/><stop offset="1" stop-color="#8a5a2a"/></linearGradient></defs>
<path d="M146 210L120 214M254 210L280 214" stroke="${GOLD2}" stroke-width="3"/>
<path d="M146 208C146 202 152 200 170 200C186 200 193 204 193 212C193 228 185 242 169 242C155 242 146 228 146 208Z" fill="url(#${p}lens)" stroke="${GOLD}" stroke-width="2.6"/>
<path d="${mirror('M146 208C146 202 152 200 170 200C186 200 193 204 193 212C193 228 185 242 169 242C155 242 146 228 146 208Z')}" fill="url(#${p}lens)" stroke="${GOLD}" stroke-width="2.6"/>
<path d="M193 208C196 204 204 204 207 208M188 201H212" stroke="${GOLD}" stroke-width="2.4" fill="none"/>
<path d="M156 214L170 204M160 224L178 210M214 214L228 204M218 224L236 210" stroke="#fff" stroke-width="2.5" opacity=".35" stroke-linecap="round"/>
${nose(s, 270, 1.15, 236)}${nasolabial(s, 274, .7)}
<path d="M178 304C188 297 196 299 200 300C204 299 212 297 222 304C212 308 188 308 178 304Z" fill="${s.lip}"/>
<path d="M180 306C190 318 210 318 220 306C210 309 190 309 180 306Z" fill="#a4623f"/><path d="M178 305C190 307 210 307 222 305" stroke="${INK}" stroke-width="1.6" fill="none"/>
<path d="M176 304l-4 6M224 304l4 6" stroke="${s.d}" stroke-width="2" stroke-linecap="round"/>`;
  chars.push({ name: 'Kittafu', basedOn: 'Gaddafi', title: 'Brother Leader of On-Device Processing', quote: 'The masses shall dictate directly.', art: parts(p, s, 'Caricature of a colonel with curly hair, aviator sunglasses and many medals speaking into a microphone', inner) });
}

// ---------------- output ----------------
const OUT = path.resolve(__dirname, '../../assets/portraits');
const PNG_WIDTHS = [512, 1024];
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

// figure: transparent background, no microphone. poster: red sunburst and microphone, as on the website.
function file(a, poster) {
  const body = poster ? `${background(a.p)}${a.inner}${mic(a.p)}` : a.inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="${a.label}">${defs(a.p, a.s)}${body}</svg>\n`;
}

function findBrowser() {
  const candidates = [process.env.BROWSER,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  return candidates.find(c => c && fs.existsSync(c));
}

function renderPng(browser, svgFile, pngFile, width) {
  const height = width * 5 / 4;
  const page = path.join(OUT, `.render-${path.basename(pngFile)}.html`);
  fs.writeFileSync(page, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${path.basename(svgFile)}" width="${width}" height="${height}" style="display:block"></body></html>`);
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000',
    `--window-size=${width},${height}`, `--screenshot=${pngFile}`, 'file:///' + page.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.unlinkSync(page);
}

fs.mkdirSync(path.join(OUT, 'png'), { recursive: true });
const browser = findBrowser();
if (!browser) console.warn('No Edge/Chrome found: SVGs written, PNGs skipped. Set BROWSER.');
const manifest = chars.map(c => {
  const id = slug(c.name);
  fs.writeFileSync(path.join(OUT, `${id}.svg`), file(c.art, false));
  fs.writeFileSync(path.join(OUT, `${id}_poster.svg`), file(c.art, true));
  const png = {};
  for (const w of PNG_WIDTHS) {
    png[w] = `png/${id}_${w}.png`;
    if (browser) renderPng(browser, path.join(OUT, `${id}.svg`), path.join(OUT, png[w]), w);
  }
  return { id, name: c.name, basedOn: c.basedOn, title: c.title, quote: c.quote, description: c.art.label, svg: `${id}.svg`, posterSvg: `${id}_poster.svg`, png };
});
fs.writeFileSync(path.join(OUT, 'portraits.json'), JSON.stringify({ aspectRatio: '4:5', viewBox: '0 0 400 500', portraits: manifest }, null, 2) + '\n');
console.log(`Wrote ${manifest.length} portraits to ${OUT}`);
