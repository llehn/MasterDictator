// Generates the app icon in assets/icon/.
// Usage: node tools/icon/generate.js
//
// Two masters share one scene (the leader behind a burning microphone, a crowd in front,
// everything else misty steel blue), drawn at two levels of detail:
//   icon_small.svg - 108x108 adaptive-icon grid, heavy mic outline, for launcher and favicon sizes
//   icon_large.svg - 512x512, full detail, for the Play Store and other large uses
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '..', 'assets', 'icon');

// Midnight palette
const MIDNIGHT = {
  top: '#48636f', mid: '#1b2d36', bottom: '#05090c', haze: '#7f9ba6',
  leader: '#101e25', crowdBack: '#1c313b', crowdFront: '#03080a', emblem: '#4f6b77',
  core: '#fff1c4', fire1: '#ffbf3a', fire2: '#ff5e1a', fire3: '#a8200f', halo: '#ff5a1e',
  dark: '#030608', metal: '#0b1419'
};
const LOW_GLOW = .25;

// deterministic pseudo-random numbers, so every run produces the same file
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
const f = n => +n.toFixed(2);

// a person seen from behind: head and shoulders, as two separate sub-shapes
function person(x, y, s) {
  const r = 3.4 * s, cy = y - 6.2 * s, w = 6.5 * s, top = y - 3 * s, sh = y + 1.5 * s, bot = y + 8 * s;
  return [
    `M${f(x - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`,
    `M${f(x - w)} ${f(bot)}V${f(sh)}C${f(x - w)} ${f(top + 1.2 * s)} ${f(x - 4 * s)} ${f(top)} ${f(x)} ${f(top)}S${f(x + w)} ${f(top + 1.2 * s)} ${f(x + w)} ${f(sh)}V${f(bot)}Z`
  ];
}
// one path element per sub-shape: overlapping sub-paths with opposite winding would punch holes
const paths = list => list.map(d => `<path d="${d}"/>`).join('');

// the invented cap emblem: a winged circle
const EMBLEM = '<circle r="2.1"/>' +
  '<path d="M-2.6-.6c-1.6-1.6-3.6-2-5.2-1.4 1 .7 1.6 1.4 1.8 2.3-.9-.2-1.8 0-2.6.5 1.6.9 3.6 1 6 .2Z"/>' +
  '<path d="M2.6-.6c1.6-1.6 3.6-2 5.2-1.4-1 .7-1.6 1.4-1.8 2.3.9-.2 1.8 0 2.6.5-1.6.9-3.6 1-6 .2Z"/>';

// filters and gradients both masters use; p prefixes the ids
function commonDefs(C, p, { lightX, lightY, lightR, blur, edge, topEdge, grain }) {
  return `
<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.top}"/><stop offset=".55" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.bottom}"/></linearGradient>
<radialGradient id="${p}haze"><stop offset="0" stop-color="${C.haze}" stop-opacity=".55"/><stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}halo"><stop offset="0" stop-color="${C.halo}" stop-opacity=".55"/><stop offset=".5" stop-color="${C.halo}" stop-opacity=".18"/><stop offset="1" stop-color="${C.halo}" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}fire" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="${C.core}"/><stop offset=".3" stop-color="${C.fire1}"/><stop offset=".7" stop-color="${C.fire2}"/><stop offset="1" stop-color="${C.fire3}"/></radialGradient>
<linearGradient id="${p}fs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.fire1}"/><stop offset=".6" stop-color="${C.fire2}"/><stop offset="1" stop-color="${C.fire3}"/></linearGradient>
<linearGradient id="${p}fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.haze}" stop-opacity="0"/><stop offset=".5" stop-color="${C.haze}" stop-opacity=".22"/><stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></linearGradient>
<radialGradient id="${p}fall" cx="${lightX}" cy="${lightY}" r="${lightR}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${p}lightfall" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="3000" height="3000"><rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#${p}fall)"/></mask>
<filter id="${p}blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>
<filter id="${p}edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="${edge}" result="in"/><feComposite in="SourceAlpha" in2="in" operator="out" result="ring"/><feFlood flood-color="${C.fire1}"/><feComposite in2="ring" operator="in"/></filter>
<filter id="${p}topedge" x="-10%" y="-10%" width="120%" height="120%"><feOffset in="SourceAlpha" dy="${topEdge}" result="down"/><feComposite in="SourceAlpha" in2="down" operator="out" result="top"/><feFlood flood-color="${C.fire1}"/><feComposite in2="top" operator="in"/></filter>
<filter id="${p}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${grain}" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.35"/></filter>`;
}

// ---------------------------------------------------------------- small master (108 grid)

// flat: plain colour fills only, without clouds, haze, glow, fog and grain
function small(C = MIDNIGHT, GLOW = LOW_GLOW, { flat = false } = {}) {
  const mood = s => flat ? '' : s;
  const p = 's';
  const jitter = [0, .8, -.6, .4, -.9, .6, -.3, .9, -.5, .2, -.8, .5, -.2, .7, -.7, .3, -.4, .6, -.1, .8, -.6];
  const rows = [
    { y: 77, s: .5, gap: 5.4, off: 1.5, back: true },
    { y: 82, s: .62, gap: 6.6, off: 4.5, back: true },
    { y: 88, s: .76, gap: 8, off: 0 },
    { y: 95, s: .92, gap: 9.6, off: 5 }
  ];
  const crowd = rows.map((r, ri) => {
    const list = [];
    for (let i = 0, x = 14 + r.off; x < 96; i++, x += r.gap)
      list.push(...person(x + jitter[(i + ri * 5) % jitter.length], r.y + jitter[(i + ri * 3) % jitter.length] * .8, r.s));
    return { list, back: !!r.back };
  });
  const leader = ['M24 88C24 66 37 58 46 56h16c9 2 22 10 22 32Z', 'M48.5 44h11v13h-11Z', 'M44.5 38a9.5 11 0 1 0 19 0a9.5 11 0 1 0-19 0Z',
    'M40.5 31c1.5-8 7-11.5 13.5-11.5S66 23 67.5 31Z', 'M41 30.5h26l-1.8 3.2H42.8Z', 'M30.6 63.4l10.3-3.8 1.2 3.4-10.3 3.8Z', 'M77.4 63.4l-10.3-3.8-1.2 3.4 10.3 3.8Z'];
  const sparks = [[38, 40, .5], [70, 36, .6], [33, 52, .4], [76, 50, .45], [44, 30, .35], [64, 27, .4], [29, 44, .3], [80, 42, .35], [60, 22, .3], [47, 24, .3], [73, 60, .35], [35, 62, .3]]
    .map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${f(r * .6)}" ry="${f(r * 1.6)}" transform="rotate(${(i % 2 ? 1 : -1) * (8 + i * 3)} ${x} ${y})" fill="${i % 3 ? C.fire2 : C.fire1}" opacity="${f(.55 + (i % 4) * .1)}"/>`).join('');

  // the microphone, 115% around (54,57), with a heavy outline: all outline layers first, the fire on top
  const ow = 4, STEM = 'M54 67v13', HOLDER = 'M44 57a10 10 0 0 0 20 0';
  const outline = `<path d="${STEM}" stroke="${C.dark}" stroke-width="${3 + ow}" stroke-linecap="round"/>` +
    `<path d="${HOLDER}" fill="none" stroke="${C.dark}" stroke-width="${2.8 + ow}" stroke-linecap="round"/>` +
    `<rect x="${48.4 - ow / 2}" y="${42.4 - ow / 2}" width="${11.2 + ow}" height="${21.2 + ow}" rx="${5.6 + ow / 2}" fill="${C.dark}"/>`;
  const mic = `
<g transform="translate(54 57) scale(1.15) translate(-54 -57)">
 ${mood(`<g filter="url(#${p}blur)" opacity="${f(.95 * GLOW)}">
  <rect x="47" y="41" width="14" height="24" rx="7" fill="${C.fire2}"/>
  <path d="M44 57a10 10 0 0 0 20 0M54 67v12" fill="none" stroke="${C.fire2}" stroke-width="4" stroke-linecap="round"/>
  <path d="M68 50a13 13 0 0 1 0 17M40 50a13 13 0 0 0 0 17" fill="none" stroke="${C.fire2}" stroke-width="3" stroke-linecap="round"/>
 </g>`)}
 <g fill="none" stroke="url(#${p}fs)" stroke-width="2" stroke-linecap="round">
  <path d="M68 50a13 13 0 0 1 0 17" opacity=".95"/><path d="M72.5 46a19 19 0 0 1 0 25" opacity=".55"/>
  <path d="M40 50a13 13 0 0 0 0 17" opacity=".95"/><path d="M35.5 46a19 19 0 0 0 0 25" opacity=".55"/>
 </g>
 ${outline}
 <path d="${STEM}" stroke="url(#${p}fs)" stroke-width="3" stroke-linecap="round"/>
 <path d="${HOLDER}" fill="none" stroke="url(#${p}fs)" stroke-width="2.8" stroke-linecap="round"/>
 <rect x="48.4" y="42.4" width="11.2" height="21.2" rx="5.6" fill="url(#${p}fire)"/>
 <path d="M50.5 49.5h7M50.5 53h7M50.5 56.5h7" stroke="${flat ? C.dark : C.fire3}" stroke-width=".9" stroke-linecap="round" opacity=".55"/>
</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108" role="img" aria-label="Master Dictator app icon: a burning microphone in front of a leader and a crowd">
<defs>${commonDefs(C, p, { lightX: 54, lightY: 54, lightR: 34, blur: 2.6, edge: .75, topEdge: .9, grain: 1.4 })}
<filter id="${p}soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".35"/></filter>
<filter id="${p}cloud" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
<rect width="108" height="108" fill="url(#${p}sky)"/>
${mood(`<g filter="url(#${p}cloud)" fill="${C.haze}"><ellipse cx="26" cy="24" rx="20" ry="8" opacity=".35"/><ellipse cx="86" cy="30" rx="18" ry="7" opacity=".3"/><ellipse cx="60" cy="14" rx="24" ry="6" opacity=".25"/></g>`)}
${mood(`<circle cx="54" cy="40" r="36" fill="url(#${p}haze)"/>`)}
<g${flat ? '' : ` filter="url(#${p}soft)"`} fill="${C.leader}" opacity="${flat ? 1 : '.78'}">${paths(leader)}<path d="M44 33.5c3.5 2.6 16.5 2.6 20 0" stroke="${C.leader}" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
<g transform="translate(54 26)" fill="${C.emblem}">${EMBLEM}</g>
${mood(`<circle cx="54" cy="55" r="30" fill="url(#${p}halo)" opacity="${GLOW}"/>`)}
<g mask="url(#${p}lightfall)"><g opacity="${f(.3 * GLOW)}" fill="${C.fire2}">${paths(leader)}</g><g filter="url(#${p}edge)">${paths(leader)}</g></g>
${mic}
${sparks}
${crowd.map(c => `<g fill="${c.back ? C.crowdBack : C.crowdFront}">${paths(c.list)}</g>`).join('')}
${mood(`<rect y="70" width="108" height="20" fill="url(#${p}fog)"/>`)}
<g mask="url(#${p}lightfall)"><g filter="url(#${p}topedge)">${crowd.map(c => paths(c.list)).join('')}</g></g>
${mood(`<rect width="108" height="108" filter="url(#${p}grain)" opacity=".12"/>`)}
</svg>
`;
}

// ---------------------------------------------------------------- large master (512)

function large(C = MIDNIGHT, GLOW = LOW_GLOW) {
  const p = 'l';
  const rand = rng(7);
  const MX = 256, MY = 236; // centre of the microphone capsule, where the light comes from

  // leader: a bigger, more detailed silhouette with a raised fist
  const leader = [
    'M112 470C112 330 176 292 222 280L290 280C336 292 400 330 400 470Z',            // torso
    'M234 214h44v72h-44Z',                                                            // neck
    'M216 176a40 48 0 1 0 80 0a40 48 0 1 0-80 0Z',                                    // head
    'M205 182a8 13 0 1 0 16 0a8 13 0 1 0-16 0Z', 'M291 182a8 13 0 1 0 16 0a8 13 0 1 0-16 0Z', // ears
    'M194 146C198 102 226 82 256 82S314 102 318 146Z',                                // cap crown
    'M198 140h116v18H198Z',                                                           // cap band
    'M206 156C226 178 286 178 306 156L298 150H214Z',                                  // visor
    'M226 272l30 26 30-26 6 10-36 30-36-30Z',                                         // collar
    'M346 352C360 300 374 250 384 204L420 212C412 260 400 310 388 358Z',              // raised sleeve, tapering to the wrist
    'M378 192c0-16 10-26 26-26s26 10 26 26-10 26-26 26-26-10-26-26Z'                  // fist
  ];
  const leaderShapes = paths(leader);
  const epaulette = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})" fill="#1d313b"><rect x="-30" y="-8" width="60" height="16" rx="6"/>` +
    Array.from({ length: 7 }, (_, i) => `<path d="M${-24 + i * 8} 8v9" stroke="#1d313b" stroke-width="3" stroke-linecap="round"/>`).join('') +
    `<rect x="-24" y="-3" width="48" height="2" rx="1" fill="${C.emblem}" opacity=".6"/></g>`;
  const medals = [[176, 350], [196, 356], [186, 380]].map(([x, y]) =>
    `<g transform="translate(${x} ${y})"><path d="M-5-18h10v10h-10Z" fill="${C.emblem}" opacity=".45"/><circle r="8" fill="${C.emblem}" opacity=".55"/><circle r="4" fill="${C.leader}" opacity=".6"/></g>`).join('');

  // podium in front of the leader, with the emblem on its front
  const podium = `
<linearGradient id="${p}pod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a141a"/><stop offset="1" stop-color="#020507"/></linearGradient>`;
  const podiumShape = 'M146 340H366L386 520H126Z';

  // crowd: many rows, far and small near the podium, near and large at the bottom; some raise a fist
  const crowdRows = [];
  const nRows = 9;
  for (let r = 0; r < nRows; r++) {
    const t = r / (nRows - 1);
    const s = 1.6 + t * t * 4.2, y = 402 + t * 122, gap = 13.5 * s * (.9 + rand() * .1);
    const list = [], arms = [];
    for (let x = -10 + rand() * gap; x < 522; x += gap * (.85 + rand() * .3)) {
      const px = x, py = y + (rand() - .5) * 3 * s;
      list.push(...person(px, py, s));
      if (rand() < .1) {
        const side = rand() < .5 ? -1 : 1;
        arms.push({ d: `M${f(px + side * 4.5 * s)} ${f(py)}L${f(px + side * 6.5 * s)} ${f(py - 13 * s)}`, w: f(2.6 * s), fx: f(px + side * 6.8 * s), fy: f(py - 14.5 * s), fr: f(1.9 * s) });
      }
    }
    const col = t < .45 ? C.crowdBack : C.crowdFront;
    crowdRows.push({ list, arms, col, t });
  }
  const crowdRowShapes = (c, paint) => paths(c.list) +
    c.arms.map(a => `<path d="${a.d}" fill="none" stroke="${paint}" stroke-width="${a.w}" stroke-linecap="round"/><circle cx="${a.fx}" cy="${a.fy}" r="${a.fr}"/>`).join('');

  // embers rising from the microphone
  const sparks = Array.from({ length: 46 }, (_, i) => {
    const a = -Math.PI / 2 + (rand() - .5) * 2.6, d = 40 + rand() * 190;
    const x = MX + Math.cos(a) * d * 1.1, y = MY + Math.sin(a) * d * .8 + 20, r = .8 + rand() * 1.6;
    return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * .55)}" ry="${f(r * 1.8)}" transform="rotate(${f((rand() - .5) * 60)} ${f(x)} ${f(y)})" fill="${rand() < .35 ? C.fire1 : C.fire2}" opacity="${f(.35 + rand() * .55)}"/>`;
  }).join('');

  // the microphone: studio mic with a mesh grille, a band, a yoke with pivots and a short stand, thin outline
  const CAP = { x: 228, y: 176, w: 56, h: 118, r: 28 };
  const ow = 7;
  const yoke = 'M206 238v18a50 50 0 0 0 100 0v-18';
  const stand = 'M256 306v36';
  const micShapes = (w, paint) =>
    `<path d="${stand}" stroke="${paint}" stroke-width="${12 + w}" stroke-linecap="round"/>` +
    `<path d="${yoke}" fill="none" stroke="${paint}" stroke-width="${10 + w}" stroke-linecap="round"/>` +
    `<circle cx="206" cy="244" r="${9 + w / 2}" fill="${paint}"/><circle cx="306" cy="244" r="${9 + w / 2}" fill="${paint}"/>` +
    `<rect x="${CAP.x - w / 2}" y="${CAP.y - w / 2}" width="${CAP.w + w}" height="${CAP.h + w}" rx="${CAP.r + w / 2}" fill="${paint}"/>` +
    `<ellipse cx="256" cy="344" rx="${30 + w / 2}" ry="${7 + w / 2}" fill="${paint}"/>`;
  const waves = [[62, .95], [88, .6], [114, .32]].map(([r, o]) => {
    const a = .62, dx = f(r * Math.cos(a)), dy = f(r * Math.sin(a));
    return `<path d="M${f(MX + dx)} ${f(MY - dy)}A${r} ${r} 0 0 1 ${f(MX + dx)} ${f(MY + dy)}M${f(MX - dx)} ${f(MY - dy)}A${r} ${r} 0 0 0 ${f(MX - dx)} ${f(MY + dy)}" opacity="${o}"/>`;
  });

  const mic = `
<g filter="url(#${p}blur)" opacity="${f(.95 * GLOW)}">${micShapes(0, C.fire2)}</g>
<g fill="none" stroke="${C.dark}" stroke-width="10" stroke-linecap="round">${waves.join('')}</g>
<g fill="none" stroke="url(#${p}fsu)" stroke-width="6" stroke-linecap="round">${waves.join('')}</g>
${micShapes(ow, C.dark)}
<path d="${stand}" stroke="url(#${p}fsu)" stroke-width="12" stroke-linecap="round"/>
<ellipse cx="256" cy="344" rx="30" ry="7" fill="url(#${p}fsu)"/>
<path d="${yoke}" fill="none" stroke="url(#${p}fsu)" stroke-width="10" stroke-linecap="round"/>
<path d="${yoke}" fill="none" stroke="${C.core}" stroke-width="2" stroke-linecap="round" opacity=".45" transform="translate(0 -2.5)"/>
<g fill="url(#${p}fsu)"><circle cx="206" cy="244" r="9"/><circle cx="306" cy="244" r="9"/></g>
<g fill="${C.dark}"><circle cx="206" cy="244" r="3.2"/><circle cx="306" cy="244" r="3.2"/></g>
<rect x="${CAP.x}" y="${CAP.y}" width="${CAP.w}" height="${CAP.h}" rx="${CAP.r}" fill="url(#${p}fire)"/>
<g clip-path="url(#${p}grilleclip)">
 <rect x="${CAP.x}" y="${CAP.y}" width="${CAP.w}" height="70" fill="url(#${p}mesh)"/>
 <rect x="${CAP.x}" y="${CAP.y}" width="${CAP.w}" height="${CAP.h}" fill="url(#${p}capshade)"/>
</g>
<rect x="${CAP.x}" y="244" width="${CAP.w}" height="9" fill="${C.dark}" opacity=".85"/>
<rect x="${CAP.x}" y="245.5" width="${CAP.w}" height="1.6" fill="${C.core}" opacity=".5"/>
<path d="M240 200c0-12 6-18 14-19" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Master Dictator: a leader at a podium speaks into a burning microphone in front of a crowd">
<defs>${commonDefs(C, p, { lightX: MX, lightY: MY, lightR: 250, blur: 12, edge: 2.4, topEdge: 2.2, grain: .85 })}${podium}
<linearGradient id="${p}fsu" x1="0" y1="${CAP.y}" x2="0" y2="350" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.fire1}"/><stop offset=".6" stop-color="${C.fire2}"/><stop offset="1" stop-color="${C.fire3}"/></linearGradient>
<pattern id="${p}mesh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45 256 210)"><rect width="6" height="6" fill="none"/><path d="M0 0h6M0 0v6" stroke="${C.fire3}" stroke-width="1.1" opacity=".55"/></pattern>
<linearGradient id="${p}capshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.fire3}" stop-opacity=".55"/><stop offset=".3" stop-color="${C.fire3}" stop-opacity="0"/><stop offset=".7" stop-color="${C.fire3}" stop-opacity="0"/><stop offset="1" stop-color="${C.fire3}" stop-opacity=".6"/></linearGradient>
<clipPath id="${p}grilleclip"><rect x="${CAP.x}" y="${CAP.y}" width="${CAP.w}" height="${CAP.h}" rx="${CAP.r}"/></clipPath>
<filter id="${p}clouds" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency=".007 .013" numOctaves="5" seed="11"/>
 <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .61  0 0 0 0 .65  0 0 0 1.9 -.95"/>
</filter>
<linearGradient id="${p}cloudfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".55" stop-color="#fff" stop-opacity=".25"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="${p}cloudmask"><rect width="512" height="512" fill="url(#${p}cloudfade)"/></mask>
<radialGradient id="${p}vignette" cx="50%" cy="45%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<filter id="${p}soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="${p}ember" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation=".6"/></filter>
</defs>
<rect width="512" height="512" fill="url(#${p}sky)"/>
<rect width="512" height="512" filter="url(#${p}clouds)" mask="url(#${p}cloudmask)"/>
<ellipse cx="256" cy="190" rx="210" ry="170" fill="url(#${p}haze)"/>

<g filter="url(#${p}soft)" fill="${C.leader}" opacity=".9">${leaderShapes}<path d="M218 162c16 12 60 12 76 0" stroke="${C.leader}" stroke-width="10" fill="none" stroke-linecap="round"/></g>
${epaulette(172, 304, -20)}${epaulette(340, 304, 20)}
${medals}
<g transform="translate(256 124) scale(3.6)" fill="${C.emblem}">${EMBLEM}</g>

<circle cx="${MX}" cy="${MY + 20}" r="170" fill="url(#${p}halo)" opacity="${GLOW}"/>
<g mask="url(#${p}lightfall)"><g opacity="${f(.3 * GLOW)}" fill="${C.fire2}">${leaderShapes}</g><g filter="url(#${p}edge)">${leaderShapes}</g></g>

<path d="${podiumShape}" fill="url(#${p}pod)"/>
<path d="M146 340H366" stroke="${C.fire2}" stroke-width="3" opacity=".6"/><path d="M146 340L126 520M366 340L386 520" stroke="${C.fire2}" stroke-width="1.5" opacity=".25"/>
<g transform="translate(256 374) scale(3.6)" fill="${C.emblem}" opacity=".8">${EMBLEM}</g>

${mic}
<g filter="url(#${p}ember)">${sparks}</g>

${crowdRows.map((c, i) => `<g fill="${c.col}">${crowdRowShapes(c, c.col)}</g>${i < 4 ? `<rect y="${f(380 + i * 16)}" width="512" height="30" fill="url(#${p}fog)"/>` : ''}`).join('\n')}
<g mask="url(#${p}lightfall)"><g filter="url(#${p}topedge)">${crowdRows.map(c => crowdRowShapes(c, '#000')).join('')}</g></g>

<rect width="512" height="512" fill="url(#${p}vignette)"/>
<rect width="512" height="512" filter="url(#${p}grain)" opacity=".1"/>
</svg>
`;
}

if (require.main === module) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'icon_small.svg'), small());
  fs.writeFileSync(path.join(OUT, 'icon_large.svg'), large());
  console.log(`Wrote icon_small.svg and icon_large.svg to ${OUT}`);
}

module.exports = { small, large, MIDNIGHT };
