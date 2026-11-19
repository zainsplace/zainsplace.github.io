/* ===== SHOP DATA =====
   The shop's pets and accessories: original flat "sticker" art drawn in code
   (shapes only, no images or fonts), prices, unlocks and the anchor system that
   lets one accessory fit every pet and the avatar. No DOM and no app globals,
   so tests/shop-data.test.js can load it in Node. The shop page (Task 13)
   draws from here.

   Art rules: every pet is drawn in a 200x200 box; every accessory once on a
   100x100 grid with its anchor at (50,50). Fills come from one colour `col`
   (fill, a lighter tone and a darker 3px outline), so passing another colour
   makes a colour variant. compose() places each worn item on the matching
   anchor { x, y, s, r } of the pet or avatar:
     hat -> head (top of the head, where a brim sits)
     face -> eyes (midway between the eyes; glasses lenses are 34 apart)
     neck -> neck, back -> back (upper back; drawn behind the body)
     held -> hand (the grip point)
     bg / frame / effect -> the whole 200x200 box. */
const SHOP = (() => {
  /* ---------- colour ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  function mix(a, b, t) {
    const A = rgb(a), B = rgb(b);
    return hex(A.map((v, i) => v + (B[i] - v) * t));
  }
  const darker = (c, t) => mix(c, '#000000', t == null ? 0.45 : t);
  const lighter = (c, t) => mix(c, '#ffffff', t == null ? 0.55 : t);
  /* The tones every drawing uses: fill, light (bellies, highlights), mid
     (second tone) and line (the outline). */
  function tone(col, fallback) {
    const c = HEX.test(col || '') ? col : (HEX.test(fallback || '') ? fallback : '#94A3B8');
    return { fill: c, light: lighter(c), mid: darker(c, 0.18), line: darker(c) };
  }

  const INK = '#1E293B';
  const WHITE = '#FFFFFF';
  const PINK = '#FB7185';
  const GOLD = '#FACC15', GOLD_LINE = '#A16207';

  /* ---------- drawing helpers (pet coordinates, stroke-width 3) ---------- */
  // A thick stroked path with an outline: tails, tentacles, arms.
  const tube = (d, w, fill, line) =>
    `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w + 6}"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;

  /* Eyes: happy = open round eyes with a shine, sleepy = closed lines.
     opts.ink colours the eye (screens use a glow colour), opts.sclera puts a
     white ring round it (for eyes on a dark patch). */
  function eyes(x1, x2, y, r, mood, opts) {
    const o = opts || {};
    const ink = o.ink || INK;
    return [x1, x2].map(x => {
      if (mood === 'sleepy') {
        const c = o.sclera ? WHITE : ink;
        return `<path d="M${x - r} ${y} Q${x} ${y + r * 0.9} ${x + r} ${y}" fill="none" stroke="${c}" stroke-width="${o.sclera ? 3 : 3.5}"/>`;
      }
      let s = '';
      if (o.sclera) s += `<circle cx="${x}" cy="${y}" r="${r + 2.5}" fill="${WHITE}" stroke="none"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}" stroke="none"/>`;
      if (!o.noShine) s += `<circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="${WHITE}" stroke="none"/>`;
      return s;
    }).join('');
  }
  const blush = (x1, x2, y, rx) =>
    [x1, x2].map(x => `<ellipse cx="${x}" cy="${y}" rx="${rx || 7}" ry="${(rx || 7) * 0.58}" fill="${PINK}" opacity=".45" stroke="none"/>`).join('');
  const smile = (x, y, w, c) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" fill="none" stroke="${c || INK}" stroke-width="3"/>`;
  const catMouth = (x, y) => `<path d="M${x - 8} ${y} q4 5 8 0 q4 5 8 0" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  const zz = (x, y, c) => `<path d="M${x} ${y} h8 l-8 9 h8 M${x + 12} ${y - 12} h6 l-6 7 h6" fill="none" stroke="${c || '#94A3B8'}" stroke-width="2.5" opacity=".85"/>`;
  const wrap = body => `<g stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
  const A = (x, y, s, r) => ({ x, y, s, r: r || 0 });

  /* A shaggy outline round an ellipse, for the yeti. */
  function shag(cx, cy, rx, ry, n, amp) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
      const m = a - Math.PI / n;
      const qx = cx + Math.cos(m) * (rx + amp), qy = cy + Math.sin(m) * (ry + amp);
      d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + ' Z';
  }

  /* ---------- pets ---------- */
  const PET_ART = {
    cat(t, mood) {
      const { fill: f, light: l, line: o } = t;
      return wrap(
        tube('M128 172 C160 176 174 150 162 118', 12, f, o) +
        `<ellipse cx="100" cy="160" rx="40" ry="30" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="166" rx="22" ry="17" fill="${l}" stroke="none"/>` +
        `<ellipse cx="82" cy="187" rx="12" ry="7" fill="${l}" stroke="${o}"/><ellipse cx="118" cy="187" rx="12" ry="7" fill="${l}" stroke="${o}"/>` +
        `<path d="M56 86 L60 44 L92 64 Z" fill="${f}" stroke="${o}"/><path d="M144 86 L140 44 L108 64 Z" fill="${f}" stroke="${o}"/>` +
        `<path d="M65 76 L66 56 L82 66 Z" fill="#FDA4AF" stroke="none"/><path d="M135 76 L134 56 L118 66 Z" fill="#FDA4AF" stroke="none"/>` +
        `<ellipse cx="100" cy="98" rx="50" ry="42" fill="${f}" stroke="${o}"/>` +
        `<path d="M100 59 v11 M89 61 l3 9 M111 61 l-3 9" fill="none" stroke="${o}" stroke-width="3.5"/>` +
        `<ellipse cx="100" cy="115" rx="20" ry="13" fill="${l}" stroke="none"/>` +
        eyes(80, 120, 98, 8, mood) + blush(68, 132, 112) +
        `<path d="M95 107 h10 l-5 6 z" fill="${PINK}" stroke="${o}" stroke-width="2"/>` + catMouth(100, 116) +
        `<path d="M58 106 h16 M58 116 l16 -4 M142 106 h-16 M142 116 l-16 -4" fill="none" stroke="${o}" stroke-width="2"/>` +
        `<ellipse cx="137" cy="163" rx="10" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    dog(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      return wrap(
        tube('M134 162 Q162 154 160 128', 10, f, o) +
        `<ellipse cx="100" cy="160" rx="40" ry="30" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="166" rx="22" ry="17" fill="${l}" stroke="none"/>` +
        `<ellipse cx="82" cy="187" rx="12" ry="7" fill="${l}" stroke="${o}"/><ellipse cx="118" cy="187" rx="12" ry="7" fill="${l}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="100" rx="48" ry="42" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="119" cy="94" rx="14" ry="13" fill="${m}" stroke="none"/>` +
        `<path d="M60 72 Q38 78 42 118 Q48 134 62 120 Q66 98 72 80 Z" fill="${m}" stroke="${o}"/>` +
        `<path d="M140 72 Q162 78 158 118 Q152 134 138 120 Q134 98 128 80 Z" fill="${m}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="119" rx="22" ry="15" fill="${l}" stroke="none"/>` +
        eyes(81, 119, 96, 8, mood) + blush(70, 130, 114) +
        `<ellipse cx="100" cy="110" rx="8" ry="6" fill="${INK}" stroke="none"/>` +
        `<path d="M96 122 q4 13 8 0 z" fill="${PINK}" stroke="${o}" stroke-width="2"/>` +
        `<path d="M91 120 q9 6 18 0" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
        `<ellipse cx="137" cy="163" rx="10" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    fox(t, mood) {
      const { fill: f, mid: m, line: o } = t;
      const w = '#FFF7ED';
      return wrap(
        `<ellipse cx="156" cy="140" rx="19" ry="40" transform="rotate(32 156 140)" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="171" cy="113" rx="11" ry="13" transform="rotate(32 171 113)" fill="${w}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="162" rx="36" ry="28" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="164" rx="18" ry="18" fill="${w}" stroke="none"/>` +
        `<ellipse cx="84" cy="187" rx="11" ry="7" fill="${darker(f, 0.5)}" stroke="${o}"/><ellipse cx="116" cy="187" rx="11" ry="7" fill="${darker(f, 0.5)}" stroke="${o}"/>` +
        `<path d="M52 90 L56 32 L94 64 Z" fill="${f}" stroke="${o}"/><path d="M148 90 L144 32 L106 64 Z" fill="${f}" stroke="${o}"/>` +
        `<path d="M62 76 L62 48 L82 64 Z" fill="${w}" stroke="none"/><path d="M138 76 L138 48 L118 64 Z" fill="${w}" stroke="none"/>` +
        `<path d="M56 33 L57 47 L66 41 Z M144 33 L143 47 L134 41 Z" fill="${darker(f, 0.5)}" stroke="${o}" stroke-width="2"/>` +
        `<path d="M50 92 Q52 60 100 58 Q148 60 150 92 Q150 118 124 132 Q100 142 76 132 Q50 118 50 92 Z" fill="${f}" stroke="${o}"/>` +
        `<path d="M53 102 Q72 104 84 118 Q92 132 100 132 Q108 132 116 118 Q128 104 147 102 Q144 120 124 131 Q100 141 76 131 Q56 120 53 102 Z" fill="${w}" stroke="none"/>` +
        eyes(79, 121, 96, 7.5, mood) + blush(66, 134, 112, 6) +
        `<ellipse cx="100" cy="121" rx="6.5" ry="5" fill="${INK}" stroke="none"/>` + smile(100, 127, 6) +
        `<ellipse cx="135" cy="164" rx="9" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    rabbit(t, mood) {
      const { fill: f, light: l, line: o } = t;
      return wrap(
        `<circle cx="138" cy="174" r="12" fill="${l}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="160" rx="38" ry="30" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="166" rx="20" ry="17" fill="${l}" stroke="none"/>` +
        `<ellipse cx="83" cy="187" rx="13" ry="7" fill="${l}" stroke="${o}"/><ellipse cx="117" cy="187" rx="13" ry="7" fill="${l}" stroke="${o}"/>` +
        `<ellipse cx="80" cy="48" rx="13" ry="34" transform="rotate(-10 80 48)" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="120" cy="48" rx="13" ry="34" transform="rotate(10 120 48)" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="80" cy="50" rx="6" ry="24" transform="rotate(-10 80 50)" fill="#FDA4AF" stroke="none"/>` +
        `<ellipse cx="120" cy="50" rx="6" ry="24" transform="rotate(10 120 50)" fill="#FDA4AF" stroke="none"/>` +
        `<ellipse cx="100" cy="102" rx="46" ry="40" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="118" rx="18" ry="12" fill="${l}" stroke="none"/>` +
        eyes(81, 119, 100, 8, mood) + blush(70, 130, 114) +
        `<path d="M96 110 h8 l-4 5 z" fill="${PINK}" stroke="${o}" stroke-width="2"/>` +
        `<path d="M92 118 q4 4 8 0 q4 4 8 0" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
        `<rect x="96" y="120" width="8" height="7" rx="1.5" fill="${WHITE}" stroke="${o}" stroke-width="1.5"/>` +
        `<ellipse cx="136" cy="163" rx="9" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    owl(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      return wrap(
        `<path d="M58 76 L50 38 L82 60 Z" fill="${m}" stroke="${o}"/><path d="M142 76 L150 38 L118 60 Z" fill="${m}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="120" rx="56" ry="64" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="150" rx="34" ry="32" fill="${l}" stroke="none"/>` +
        `<path d="M86 142 l6 5 l6 -5 M102 142 l6 5 l6 -5 M94 156 l6 5 l6 -5 M80 156 l4 4 M120 156 l-4 4" fill="none" stroke="${m}" stroke-width="2.5"/>` +
        `<path d="M46 112 Q32 142 56 170 Q64 140 58 114 Z" fill="${m}" stroke="${o}"/>` +
        `<path d="M154 112 Q168 142 144 170 Q136 140 142 114 Z" fill="${m}" stroke="${o}"/>` +
        `<circle cx="78" cy="94" r="20" fill="${lighter(f, 0.75)}" stroke="${o}"/><circle cx="122" cy="94" r="20" fill="${lighter(f, 0.75)}" stroke="${o}"/>` +
        eyes(78, 122, 94, 9, mood) +
        `<path d="M93 108 L107 108 L100 121 Z" fill="#F59E0B" stroke="#B45309"/>` +
        `<ellipse cx="86" cy="185" rx="9" ry="5" fill="#F59E0B" stroke="#B45309"/><ellipse cx="114" cy="185" rx="9" ry="5" fill="#F59E0B" stroke="#B45309"/>`);
    },
    penguin(t, mood) {
      const { fill: f, line: o } = t;
      const w = '#F8FAFC';
      return wrap(
        `<path d="M54 110 Q30 136 40 162 Q54 146 60 122 Z" fill="${f}" stroke="${o}"/>` +
        `<path d="M146 110 Q170 136 160 162 Q146 146 140 122 Z" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="84" cy="186" rx="12" ry="6" fill="#F59E0B" stroke="#B45309"/><ellipse cx="116" cy="186" rx="12" ry="6" fill="#F59E0B" stroke="#B45309"/>` +
        `<ellipse cx="100" cy="118" rx="50" ry="66" fill="${f}" stroke="${o}"/>` +
        `<path d="M100 80 C88 64 62 72 64 100 C66 118 76 126 72 150 C76 178 124 178 128 150 C124 126 134 118 136 100 C138 72 112 64 100 80 Z" fill="${w}" stroke="none"/>` +
        eyes(84, 116, 98, 7.5, mood) + blush(76, 124, 112, 6) +
        `<path d="M92 107 L108 107 L100 118 Z" fill="#F59E0B" stroke="#B45309"/>`);
    },
    frog(t, mood) {
      const { fill: f, light: l, line: o } = t;
      const eye = x => mood === 'sleepy'
        ? `<path d="M${x - 10} 80 Q${x} 89 ${x + 10} 80" fill="none" stroke="${INK}" stroke-width="3.5"/>`
        : `<circle cx="${x}" cy="80" r="11" fill="${WHITE}" stroke="${o}" stroke-width="2"/><circle cx="${x}" cy="81" r="6.5" fill="${INK}" stroke="none"/><circle cx="${x + 2.5}" cy="78" r="2.4" fill="${WHITE}" stroke="none"/>`;
      return wrap(
        `<ellipse cx="56" cy="178" rx="24" ry="12" fill="${f}" stroke="${o}"/><ellipse cx="144" cy="178" rx="24" ry="12" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="158" rx="42" ry="30" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="166" rx="28" ry="18" fill="${l}" stroke="none"/>` +
        `<circle cx="72" cy="82" r="19" fill="${f}" stroke="${o}"/><circle cx="128" cy="82" r="19" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="110" rx="60" ry="36" fill="${f}" stroke="${o}"/>` +
        `<circle cx="72" cy="82" r="17.4" fill="${f}" stroke="none"/><circle cx="128" cy="82" r="17.4" fill="${f}" stroke="none"/>` +
        eye(72) + eye(128) + blush(62, 138, 116, 8) +
        `<path d="M70 116 Q100 138 130 116" fill="none" stroke="${INK}" stroke-width="3"/>` +
        `<circle cx="94" cy="104" r="1.8" fill="${INK}" stroke="none"/><circle cx="106" cy="104" r="1.8" fill="${INK}" stroke="none"/>` +
        `<ellipse cx="82" cy="186" rx="11" ry="6" fill="${f}" stroke="${o}"/><ellipse cx="118" cy="186" rx="11" ry="6" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="138" cy="160" rx="9" ry="8" fill="${f}" stroke="${o}"/>`);
    },
    panda(t, mood) {
      const { fill: c, line: o } = t;
      const w = '#F8FAFC';
      return wrap(
        `<ellipse cx="100" cy="160" rx="42" ry="30" fill="${w}" stroke="${o}"/>` +
        `<ellipse cx="80" cy="185" rx="15" ry="9" fill="${c}" stroke="${o}"/><ellipse cx="120" cy="185" rx="15" ry="9" fill="${c}" stroke="${o}"/>` +
        `<ellipse cx="64" cy="158" rx="11" ry="16" fill="${c}" stroke="${o}"/>` +
        `<circle cx="60" cy="64" r="15" fill="${c}" stroke="${o}"/><circle cx="140" cy="64" r="15" fill="${c}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="100" rx="52" ry="44" fill="${w}" stroke="${o}"/>` +
        `<ellipse cx="80" cy="98" rx="13" ry="16" transform="rotate(30 80 98)" fill="${c}" stroke="none"/>` +
        `<ellipse cx="120" cy="98" rx="13" ry="16" transform="rotate(-30 120 98)" fill="${c}" stroke="none"/>` +
        eyes(81, 119, 97, 5, mood, { sclera: true }) + blush(66, 134, 116) +
        `<ellipse cx="100" cy="114" rx="7" ry="5" fill="${INK}" stroke="none"/>` + catMouth(100, 120) +
        `<ellipse cx="137" cy="160" rx="11" ry="12" fill="${c}" stroke="${o}"/>`);
    },
    hamster(t, mood) {
      const { fill: f, light: l, line: o } = t;
      return wrap(
        `<circle cx="70" cy="106" r="11" fill="${f}" stroke="${o}"/><circle cx="130" cy="106" r="11" fill="${f}" stroke="${o}"/>` +
        `<circle cx="70" cy="107" r="5" fill="#FDA4AF" stroke="none"/><circle cx="130" cy="107" r="5" fill="#FDA4AF" stroke="none"/>` +
        `<ellipse cx="100" cy="142" rx="48" ry="40" fill="${f}" stroke="${o}"/>` +
        `<path d="M62 150 Q64 124 100 124 Q136 124 138 150 Q136 178 100 180 Q64 178 62 150 Z" fill="${l}" stroke="none"/>` +
        eyes(86, 114, 130, 6, mood) + blush(72, 128, 142, 9) +
        `<ellipse cx="100" cy="139" rx="4" ry="3" fill="${PINK}" stroke="none"/>` + catMouth(100, 143) +
        `<ellipse cx="90" cy="163" rx="7" ry="5" fill="${f}" stroke="${o}" stroke-width="2.5"/><ellipse cx="110" cy="163" rx="7" ry="5" fill="${f}" stroke="${o}" stroke-width="2.5"/>` +
        `<ellipse cx="82" cy="182" rx="9" ry="5" fill="${l}" stroke="${o}" stroke-width="2.5"/><ellipse cx="118" cy="182" rx="9" ry="5" fill="${l}" stroke="${o}" stroke-width="2.5"/>`);
    },
    robot(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      const glow = '#67E8F9';
      return wrap(
        `<path d="M100 54 V34" stroke="${o}" stroke-width="4" fill="none"/><circle cx="100" cy="30" r="7" fill="#F43F5E" stroke="#9F1239"/>` +
        `<rect x="72" y="178" width="18" height="12" rx="3" fill="${m}" stroke="${o}"/><rect x="110" y="178" width="18" height="12" rx="3" fill="${m}" stroke="${o}"/>` +
        `<rect x="44" y="140" width="16" height="32" rx="8" fill="${m}" stroke="${o}"/><rect x="140" y="138" width="16" height="28" rx="8" fill="${m}" stroke="${o}"/>` +
        `<rect x="62" y="134" width="76" height="48" rx="10" fill="${f}" stroke="${o}"/>` +
        `<rect x="82" y="146" width="36" height="22" rx="4" fill="${l}" stroke="${o}" stroke-width="2"/>` +
        `<circle cx="92" cy="157" r="4" fill="#4ADE80" stroke="none"/><circle cx="108" cy="157" r="4" fill="#FBBF24" stroke="none"/>` +
        `<rect x="90" y="126" width="20" height="10" fill="${m}" stroke="${o}"/>` +
        `<rect x="43" y="80" width="12" height="24" rx="4" fill="${m}" stroke="${o}"/><rect x="145" y="80" width="12" height="24" rx="4" fill="${m}" stroke="${o}"/>` +
        `<rect x="52" y="54" width="96" height="76" rx="18" fill="${f}" stroke="${o}"/>` +
        `<rect x="64" y="67" width="72" height="50" rx="12" fill="${INK}" stroke="${o}" stroke-width="2"/>` +
        eyes(84, 116, 89, 8, mood, { ink: glow, noShine: true }) +
        `<path d="M90 104 Q100 111 110 104" fill="none" stroke="${glow}" stroke-width="3"/>` +
        `<circle cx="148" cy="164" r="9" fill="${m}" stroke="${o}"/>`);
    },
    computer(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      const glow = '#4ADE80';
      return wrap(
        `<rect x="54" y="166" width="92" height="20" rx="6" fill="${l}" stroke="${o}"/>` +
        `<path d="M64 173 h8 M78 173 h8 M92 173 h8 M106 173 h8 M120 173 h14 M70 180 h60" stroke="${o}" stroke-width="2.5" fill="none"/>` +
        `<rect x="84" y="138" width="32" height="20" fill="${m}" stroke="${o}"/>` +
        tube('M150 112 Q168 124 160 142', 7, f, o) + `<circle cx="160" cy="145" r="8" fill="${f}" stroke="${o}"/>` +
        tube('M50 112 Q34 124 40 142', 7, f, o) + `<circle cx="40" cy="145" r="8" fill="${f}" stroke="${o}"/>` +
        `<rect x="46" y="48" width="108" height="94" rx="16" fill="${f}" stroke="${o}"/>` +
        `<rect x="60" y="60" width="80" height="62" rx="10" fill="#0F172A" stroke="${o}" stroke-width="2"/>` +
        eyes(84, 116, 86, 7, mood, { ink: glow, noShine: true }) +
        `<path d="M90 101 Q100 109 110 101" fill="none" stroke="${glow}" stroke-width="3"/>` +
        `<path d="M68 70 l8 -4" stroke="${WHITE}" stroke-width="2.5" opacity=".5" fill="none"/>` +
        `<circle cx="140" cy="132" r="3.5" fill="#4ADE80" stroke="none"/><path d="M60 132 h22" stroke="${o}" stroke-width="2.5" fill="none"/>`);
    },
    drone(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      const glow = '#67E8F9';
      const rotor = x => `<ellipse cx="${x}" cy="62" rx="27" ry="5" fill="${lighter(f, 0.75)}" stroke="${o}" stroke-width="2" opacity=".9"/><rect x="${x - 4}" y="60" width="8" height="12" rx="2" fill="${m}" stroke="${o}" stroke-width="2"/>`;
      return wrap(
        `<path d="M70 146 L60 170 M130 146 L140 170 M44 171 H78 M122 171 H156" fill="none" stroke="${o}" stroke-width="5"/>` +
        tube('M62 100 L38 74', 6, m, o) + tube('M138 100 L162 74', 6, m, o) +
        rotor(36) + rotor(164) +
        tube('M126 138 Q136 146 136 156', 4, m, o) + `<circle cx="136" cy="158" r="6" fill="${m}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="112" rx="52" ry="38" fill="${f}" stroke="${o}"/>` +
        `<path d="M54 122 Q100 152 146 122 Q140 146 100 150 Q60 146 54 122 Z" fill="${m}" stroke="none"/>` +
        `<ellipse cx="100" cy="106" rx="34" ry="22" fill="${INK}" stroke="${o}" stroke-width="2"/>` +
        eyes(88, 112, 104, 6, mood, { ink: glow, noShine: true }) +
        `<path d="M94 115 Q100 119 106 115" fill="none" stroke="${glow}" stroke-width="2.5"/>` +
        `<circle cx="100" cy="148" r="4" fill="#F43F5E" stroke="none"/><path d="M82 82 l10 -3" stroke="${l}" stroke-width="3" fill="none"/>`);
    },
    floppy(t, mood) {
      const { fill: f, mid: m, line: o } = t;
      return wrap(
        `<path d="M84 176 v10 M116 176 v10" stroke="${o}" stroke-width="4" fill="none"/>` +
        `<ellipse cx="80" cy="188" rx="9" ry="5" fill="${m}" stroke="${o}"/><ellipse cx="120" cy="188" rx="9" ry="5" fill="${m}" stroke="${o}"/>` +
        tube('M52 122 Q36 130 38 148', 6, f, o) + `<circle cx="38" cy="150" r="7" fill="${f}" stroke="${o}"/>` +
        tube('M148 122 Q164 130 162 148', 6, f, o) + `<circle cx="162" cy="150" r="7" fill="${f}" stroke="${o}"/>` +
        `<path d="M50 54 Q50 50 54 50 H138 L150 62 V172 Q150 176 146 176 H54 Q50 176 50 172 Z" fill="${f}" stroke="${o}"/>` +
        `<rect x="74" y="50" width="52" height="34" rx="3" fill="#CBD5E1" stroke="#475569"/>` +
        `<rect x="104" y="56" width="11" height="22" rx="2" fill="#475569" stroke="none"/>` +
        `<rect x="62" y="98" width="76" height="68" rx="6" fill="#F8FAFC" stroke="${o}"/>` +
        `<path d="M70 108 h60" stroke="${lighter(f, 0.4)}" stroke-width="2.5" fill="none"/>` +
        eyes(86, 114, 128, 7, mood) + blush(76, 124, 140, 6) + smile(100, 142, 7) +
        `<rect x="56" y="160" width="6" height="8" fill="${m}" stroke="none"/>`);
    },
    dragon(t, mood) {
      const { fill: f, light: l, mid: m, line: o } = t;
      const horn = '#FDE68A', hornLine = '#B45309';
      return wrap(
        `<path d="M78 128 L26 66 Q42 70 48 84 Q52 64 64 70 Q64 88 86 106 Z" fill="${m}" stroke="${o}"/>` +
        `<path d="M122 128 L174 66 Q158 70 152 84 Q148 64 136 70 Q136 88 114 106 Z" fill="${m}" stroke="${o}"/>` +
        tube('M128 176 Q168 184 176 148', 13, f, o) +
        `<path d="M168 150 L182 128 L190 154 Z" fill="${m}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="160" rx="40" ry="30" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="166" rx="22" ry="19" fill="${l}" stroke="none"/>` +
        `<path d="M84 160 h32 M82 170 h36 M86 180 h28" stroke="${lighter(f, 0.25)}" stroke-width="2.5" fill="none"/>` +
        `<ellipse cx="82" cy="187" rx="12" ry="7" fill="${m}" stroke="${o}"/><ellipse cx="118" cy="187" rx="12" ry="7" fill="${m}" stroke="${o}"/>` +
        `<path d="M70 70 L60 38 L86 60 Z" fill="${horn}" stroke="${hornLine}"/><path d="M130 70 L140 38 L114 60 Z" fill="${horn}" stroke="${hornLine}"/>` +
        `<ellipse cx="100" cy="98" rx="48" ry="40" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="119" rx="27" ry="16" fill="${l}" stroke="none"/>` +
        `<circle cx="93" cy="113" r="2.2" fill="${o}" stroke="none"/><circle cx="107" cy="113" r="2.2" fill="${o}" stroke="none"/>` +
        eyes(80, 120, 94, 8, mood) + blush(68, 132, 108) +
        `<path d="M86 123 Q100 133 114 123" fill="none" stroke="${INK}" stroke-width="3"/>` +
        `<path d="M92 126 l3 5 l3 -4 Z" fill="${WHITE}" stroke="${INK}" stroke-width="1.5"/>` +
        `<ellipse cx="137" cy="163" rx="10" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    unicorn(t, mood) {
      const { fill: c, line: o } = t;
      const body = lighter(c, 0.85), snout = lighter(c, 0.65), lineB = darker(c, 0.3);
      return wrap(
        `<path d="M134 158 Q170 150 168 178 Q160 190 150 182 Q160 172 140 170 Z" fill="${c}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="160" rx="40" ry="28" fill="${body}" stroke="${lineB}"/>` +
        `<rect x="76" y="168" width="14" height="20" rx="5" fill="${body}" stroke="${lineB}"/><rect x="110" y="168" width="14" height="20" rx="5" fill="${body}" stroke="${lineB}"/>` +
        `<path d="M76 184 h14 v4 q0 3 -3 3 h-8 q-3 0 -3 -3 Z M110 184 h14 v4 q0 3 -3 3 h-8 q-3 0 -3 -3 Z" fill="${c}" stroke="${o}" stroke-width="2"/>` +
        `<path d="M64 80 L62 52 L84 66 Z" fill="${body}" stroke="${lineB}"/><path d="M136 80 L138 52 L116 66 Z" fill="${body}" stroke="${lineB}"/>` +
        `<ellipse cx="100" cy="100" rx="46" ry="40" fill="${body}" stroke="${lineB}"/>` +
        `<path d="M92 64 L100 20 L108 64 Z" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
        `<path d="M95 52 l10 -3 M96 42 l8 -3 M98 32 l5 -2" stroke="${GOLD_LINE}" stroke-width="2" fill="none"/>` +
        `<path d="M58 104 Q46 70 72 60 Q90 54 110 62 Q94 66 88 78 Q80 72 74 84 Q66 92 70 112 Z" fill="${c}" stroke="${o}"/>` +
        `<ellipse cx="102" cy="120" rx="22" ry="14" fill="${snout}" stroke="none"/>` +
        `<circle cx="95" cy="119" r="2" fill="${lineB}" stroke="none"/><circle cx="109" cy="119" r="2" fill="${lineB}" stroke="none"/>` +
        eyes(84, 120, 98, 7.5, mood) +
        (mood === 'sleepy' ? '' : `<path d="M76 91 l-4 -4 M128 91 l4 -4" stroke="${INK}" stroke-width="2.5" fill="none"/>`) +
        blush(74, 130, 110) + smile(102, 126, 6) +
        `<ellipse cx="137" cy="160" rx="9" ry="9" fill="${body}" stroke="${lineB}"/>`);
    },
    phoenix(t, mood) {
      const { fill: f, line: o } = t;
      const flame = mix(f, '#FDE047', 0.6), deep = darker(f, 0.2);
      return wrap(
        `<path d="M118 160 Q166 162 184 194 Q160 182 140 184 Q148 192 146 198 Q126 186 114 176 Z" fill="${deep}" stroke="${o}"/>` +
        `<path d="M122 164 Q156 170 168 188 Q150 180 132 178 Z" fill="${flame}" stroke="none"/>` +
        `<path d="M66 126 Q22 110 20 70 Q34 88 44 86 Q36 70 44 52 Q58 80 70 96 Q66 76 74 64 Q80 92 82 112 Z" fill="${deep}" stroke="${o}"/>` +
        `<path d="M134 126 Q178 110 180 70 Q166 88 156 86 Q164 70 156 52 Q142 80 130 96 Q134 76 126 64 Q120 92 118 112 Z" fill="${deep}" stroke="${o}"/>` +
        `<path d="M70 118 Q44 104 40 84 Q56 98 72 104 Z M130 118 Q156 104 160 84 Q144 98 128 104 Z" fill="${flame}" stroke="none"/>` +
        `<ellipse cx="100" cy="152" rx="38" ry="34" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="160" rx="22" ry="22" fill="${flame}" stroke="none"/>` +
        `<path d="M84 72 Q76 46 92 28 Q92 46 100 48 Q102 30 118 20 Q112 44 116 70 Z" fill="${flame}" stroke="${o}"/>` +
        `<circle cx="100" cy="100" r="38" fill="${f}" stroke="${o}"/>` +
        eyes(86, 114, 96, 7.5, mood) + blush(76, 124, 110, 6) +
        `<path d="M93 106 L107 106 L100 118 Z" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
        `<path d="M88 184 v6 M112 184 v6" stroke="${GOLD_LINE}" stroke-width="4" fill="none"/>` +
        `<ellipse cx="134" cy="152" rx="9" ry="10" fill="${deep}" stroke="${o}"/>`);
    },
    griffin(t, mood) {
      const { fill: f, mid: m, line: o } = t;
      const head = '#F8FAFC', wing = lighter(f, 0.45);
      return wrap(
        tube('M132 172 Q170 174 166 140', 7, f, o) + `<ellipse cx="166" cy="136" rx="8" ry="10" fill="${m}" stroke="${o}"/>` +
        `<path d="M76 130 Q34 122 28 84 Q42 94 50 90 Q40 80 42 66 Q56 84 64 82 Q60 96 84 114 Z" fill="${wing}" stroke="${o}"/>` +
        `<path d="M124 130 Q166 122 172 84 Q158 94 150 90 Q160 80 158 66 Q144 84 136 82 Q140 96 116 114 Z" fill="${wing}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="162" rx="40" ry="28" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="82" cy="187" rx="12" ry="7" fill="${m}" stroke="${o}"/><ellipse cx="118" cy="187" rx="12" ry="7" fill="${m}" stroke="${o}"/>` +
        `<path d="M58 108 L44 102 L58 96 Z M142 108 L156 102 L142 96 Z" fill="${head}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="98" rx="44" ry="40" fill="${head}" stroke="${o}"/>` +
        `<path d="M86 60 L92 50 L100 58 L108 50 L114 60" fill="${head}" stroke="${o}"/>` +
        eyes(82, 118, 94, 7.5, mood) +
        `<path d="M72 82 l12 4 M128 82 l-12 4" stroke="${o}" stroke-width="3" fill="none"/>` +
        `<path d="M88 106 Q100 100 112 106 Q114 122 101 130 Q103 119 94 114 Q88 112 88 106 Z" fill="#F59E0B" stroke="#B45309"/>` +
        blush(70, 130, 110) +
        `<ellipse cx="137" cy="163" rx="10" ry="9" fill="${f}" stroke="${o}"/>`);
    },
    kraken(t, mood) {
      const { fill: f, light: l, line: o } = t;
      const arms = [
        'M66 128 Q30 122 16 140 Q8 152 20 156',
        'M134 128 Q170 122 180 136 Q186 146 176 150',
        'M72 140 Q42 152 34 176 Q30 190 44 186',
        'M128 140 Q158 152 166 176 Q170 190 156 186',
        'M86 150 Q72 174 64 192',
        'M114 150 Q128 174 136 192',
        'M100 152 Q100 174 98 192'
      ];
      const suckers = [[24, 146], [40, 182], [68, 182], [132, 182], [160, 182], [99, 182], [174, 140]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${l}" stroke="none"/>`).join('');
      return wrap(
        arms.map(d => tube(d, 13, f, o)).join('') + suckers +
        `<ellipse cx="100" cy="104" rx="64" ry="52" fill="${f}" stroke="${o}"/>` +
        `<circle cx="72" cy="70" r="7" fill="${l}" stroke="none"/><circle cx="130" cy="66" r="5" fill="${l}" stroke="none"/><circle cx="146" cy="88" r="4" fill="${l}" stroke="none"/>` +
        eyes(78, 122, 106, 10, mood) + blush(62, 138, 122, 8) +
        `<path d="M88 126 Q100 136 112 126" fill="none" stroke="${INK}" stroke-width="3"/>`);
    },
    yeti(t, mood) {
      const { fill: f, line: o } = t;
      const face = mix(f, '#334155', 0.28);
      return wrap(
        `<path d="${shag(46, 138, 15, 30, 10, 5)}" fill="${f}" stroke="${o}"/>` +
        `<path d="${shag(154, 134, 15, 28, 10, 5)}" fill="${f}" stroke="${o}"/>` +
        `<path d="M64 68 Q48 54 54 34 Q62 52 76 58 Z M136 68 Q152 54 146 34 Q138 52 124 58 Z" fill="#E7E5E4" stroke="#78716C"/>` +
        `<path d="${shag(100, 120, 56, 64, 22, 6)}" fill="${f}" stroke="${o}"/>` +
        `<ellipse cx="80" cy="186" rx="18" ry="8" fill="${face}" stroke="${o}"/><ellipse cx="120" cy="186" rx="18" ry="8" fill="${face}" stroke="${o}"/>` +
        `<ellipse cx="100" cy="102" rx="36" ry="30" fill="${face}" stroke="${o}"/>` +
        eyes(86, 114, 96, 7, mood) + blush(76, 124, 110, 6) +
        `<path d="M88 114 Q100 124 112 114" fill="none" stroke="${INK}" stroke-width="3"/>` +
        `<path d="M93 117 l2 5 l3 -3 Z M107 117 l-2 5 l-3 -3 Z" fill="${WHITE}" stroke="${INK}" stroke-width="1.2"/>`);
    },
    slime(t, mood) {
      const { fill: f, light: l, line: o } = t;
      return wrap(
        `<ellipse cx="100" cy="184" rx="66" ry="7" fill="${darker(f, 0.12)}" stroke="${o}" opacity=".6"/>` +
        `<path d="M42 178 Q30 176 34 160 Q36 120 60 94 Q80 72 100 72 Q120 72 140 94 Q164 120 166 160 Q170 176 158 178 Q150 188 138 180 Q124 186 112 180 Q100 190 88 180 Q76 186 64 180 Q54 186 42 178 Z" fill="${f}" stroke="${o}"/>` +
        `<path d="M56 160 Q58 118 84 96 Q100 86 116 96 Q90 104 78 130 Q70 150 74 170 Z" fill="${l}" opacity=".55" stroke="none"/>` +
        `<ellipse cx="72" cy="108" rx="7" ry="13" transform="rotate(32 72 108)" fill="${WHITE}" opacity=".8" stroke="none"/>` +
        eyes(84, 116, 128, 9, mood) + blush(72, 128, 142, 7) + smile(100, 142, 9) +
        `<circle cx="142" cy="106" r="3" fill="${WHITE}" opacity=".7" stroke="none"/>`);
    }
  };

  const STARTER_PRICE = 150;   // a second starter is bought like an everyday pet

  /* id, name, kind, price, starter, default colour, anchors. Anchors are tuned
     on the contact sheet: head = where a hat brim's centre sits, s = hat
     scale (1 = a 56-wide brim); eyes = between the eyes, s = eye gap / 34;
     neck, back and hand likewise in pet coordinates. */
  const PET_LIST = [
    ['cat', 'Cat', 'everyday', 0, true, '#F59E0B', { head: A(100, 60, 1.04), eyes: A(100, 98, 1.18), neck: A(100, 140, 0.8), back: A(100, 132, 1.2), hand: A(140, 160, 0.7, 10) }],
    ['dog', 'Dog', 'everyday', 0, true, '#B07A4F', { head: A(100, 62, 1.04), eyes: A(100, 96, 1.12), neck: A(100, 142, 0.8), back: A(100, 132, 1.2), hand: A(140, 160, 0.7, 10) }],
    ['fox', 'Fox', 'everyday', 200, false, '#F97316', { head: A(100, 62, 0.99), eyes: A(100, 96, 1.24), neck: A(100, 138, 0.75), back: A(100, 134, 1.14), hand: A(138, 161, 0.7, 10) }],
    ['rabbit', 'Rabbit', 'everyday', 150, false, '#C8B6A6', { head: A(100, 66, 0.99), eyes: A(100, 100, 1.12), neck: A(100, 142, 0.75), back: A(100, 134, 1.14), hand: A(139, 160, 0.7, 10) }],
    ['owl', 'Owl', 'everyday', 250, false, '#8B5E3C', { head: A(100, 58, 1.04), eyes: A(100, 94, 1.3), neck: A(100, 126, 0.8), back: A(100, 116, 1.26), hand: A(150, 156, 0.7, 10) }],
    ['penguin', 'Penguin', 'everyday', 200, false, '#334155', { head: A(100, 56, 0.99), eyes: A(100, 98, 0.94), neck: A(100, 124, 0.8), back: A(100, 116, 1.26), hand: A(156, 152, 0.7, 14) }],
    ['frog', 'Frog', 'everyday', 150, false, '#22C55E', { head: A(100, 76, 0.94), eyes: A(100, 80, 1.65), neck: A(100, 140, 0.85), back: A(100, 134, 1.2), hand: A(140, 157, 0.7, 10) }],
    ['panda', 'Panda', 'everyday', 300, false, '#374151', { head: A(100, 60, 1.1), eyes: A(100, 97, 1.12), neck: A(100, 141, 0.85), back: A(100, 132, 1.26), hand: A(139, 156, 0.7, 10) }],
    ['hamster', 'Hamster', 'everyday', 150, false, '#F4B183', { head: A(100, 104, 0.68), eyes: A(100, 130, 0.82), neck: A(100, 154, 0.62), back: A(100, 136, 0.9), hand: A(122, 160, 0.5, 10) }],
    ['robot', 'Robot', 'tech', 0, true, '#60A5FA', { head: A(100, 56, 1.16), eyes: A(100, 89, 0.94), neck: A(100, 134, 0.8), back: A(100, 136, 1.2), hand: A(150, 160, 0.7, 10) }],
    ['computer', 'Little computer', 'tech', 0, true, '#CBD5E1', { head: A(100, 50, 1.21), eyes: A(100, 86, 0.94), neck: A(100, 146, 0.75), back: A(100, 112, 1.38), hand: A(162, 142, 0.7, 10) }],
    ['drone', 'Drone', 'tech', 400, false, '#F43F5E', { head: A(100, 76, 0.94), eyes: A(100, 104, 0.72), neck: A(100, 140, 0.8), back: A(100, 110, 1.32), hand: A(138, 156, 0.6, 10) }],
    ['floppy', 'Floppy-disk buddy', 'tech', 350, false, '#3B82F6', { head: A(100, 52, 1.16), eyes: A(100, 128, 0.84), neck: A(100, 170, 0.8), back: A(100, 112, 1.38), hand: A(163, 148, 0.65, 10) }],
    ['dragon', 'Dragon', 'mythical', 1500, false, '#10B981', { head: A(100, 62, 1.04), eyes: A(100, 94, 1.18), neck: A(100, 138, 0.8), back: A(100, 130, 1.2), hand: A(140, 160, 0.7, 10) }],
    ['unicorn', 'Unicorn', 'mythical', 1200, false, '#F0ABFC', { head: A(118, 68, 0.88, 18), eyes: A(102, 98, 1.06), neck: A(100, 140, 0.8), back: A(100, 132, 1.2), hand: A(139, 158, 0.7, 10) }],
    ['phoenix', 'Phoenix', 'mythical', 1300, false, '#F97316', { head: A(100, 66, 0.94), eyes: A(100, 96, 0.84), neck: A(100, 136, 0.75), back: A(100, 128, 1.14), hand: A(137, 150, 0.65, 10) }],
    ['griffin', 'Griffin', 'mythical', 1100, false, '#D97706', { head: A(100, 60, 1.04), eyes: A(100, 94, 1.06), neck: A(100, 140, 0.8), back: A(100, 132, 1.2), hand: A(140, 160, 0.7, 10) }],
    ['kraken', 'Kraken', 'mythical', 1000, false, '#A855F7', { head: A(100, 56, 1.32), eyes: A(100, 106, 1.3), neck: A(100, 150, 1.05), back: A(100, 112, 1.56), hand: A(178, 146, 0.7, 24) }],
    ['yeti', 'Yeti', 'mythical', 800, false, '#E0F2FE', { head: A(100, 58, 1.16), eyes: A(100, 96, 0.84), neck: A(100, 134, 0.95), back: A(100, 124, 1.38), hand: A(156, 158, 0.75, 10) }],
    ['slime', 'Slime', 'mythical', 600, false, '#84CC16', { head: A(100, 76, 0.99), eyes: A(100, 128, 0.94), neck: A(100, 158, 0.9), back: A(100, 128, 1.1), hand: A(162, 150, 0.7, 14) }]
  ];

  const MOODS = ['happy', 'sleepy'];
  const PETS = PET_LIST.map(([id, name, kind, price, starter, col, anchors]) => ({
    id, name, kind, price, starter, col, anchors,
    svg(c, mood) {
      const m = MOODS.includes(mood) ? mood : 'happy';
      const art = PET_ART[id](tone(c, col), m);
      // Sleepy pets get a little "z z" beside the head.
      return m === 'sleepy' ? art.slice(0, -4) + zz(Math.min(anchors.head.x + 44, 176), anchors.head.y + 6) + '</g>' : art;
    }
  }));

  /* The avatar: emoji or photo filling the middle ~120px of a 200px circle. */
  const AVATAR_ANCHORS = {
    head: A(100, 48, 1.2), eyes: A(100, 84, 1.3), neck: A(100, 160, 1.05),
    back: A(100, 118, 1.7), hand: A(158, 158, 1, 12), full: A(100, 100, 2)
  };

  /* ---------- accessories (100x100 grid, anchor at 50,50) ---------- */
  const star = (cx, cy, r, fill, line) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return `<path d="${d} Z" fill="${fill}" stroke="${line || 'none'}"/>`;
  };
  const sparkle = (x, y, r, fill) =>
    `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${fill}" stroke="none"/>`;
  const flower = (x, y, c) =>
    [0, 72, 144, 216, 288].map(a => {
      const r = (a * Math.PI) / 180;
      return `<circle cx="${(x + Math.cos(r) * 4.2).toFixed(1)}" cy="${(y + Math.sin(r) * 4.2).toFixed(1)}" r="3.6" fill="${c}" stroke="none"/>`;
    }).join('') + `<circle cx="${x}" cy="${y}" r="2.6" fill="#FDE047" stroke="none"/>`;
  // Mirror left-to-right art (no <g>, so each worn item stays one group).
  // Elements passed in must not carry their own transform.
  /* Grow a path (absolute M/L/Q/Z pairs only) by k about (cx,cy): lets wings
     reach well past the body from the same shoulder anchor as the cape. */
  const grow = (d, k, cx, cy) => {
    let i = 0;
    return d.replace(/-?\d+(\.\d+)?/g, n => {
      const v = +n, out = (i % 2 ? cy + (v - cy) * k : cx + (v - cx) * k);
      i++;
      return +out.toFixed(1);
    });
  };
  const mirror = s => s.replace(/<(path|ellipse|circle|rect)\b/g, '<$1 transform="matrix(-1 0 0 1 100 0)"');

  const ITEM_ART = {
    /* hats: brim centred on (50,50), drawn upward */
    'top-hat': t => `<ellipse cx="50" cy="51" rx="30" ry="6" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M34 51 L36 16 Q50 12 64 16 L66 51 Q50 55 34 51 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M35.2 40 Q50 43 64.8 40 L65.4 47 Q50 50 34.6 47 Z" fill="#F43F5E" stroke="none"/>` +
      `<path d="M41 20 V36" stroke="${t.light}" stroke-width="3" opacity=".6" fill="none"/>`,
    'party-hat': t => `<path d="M30 53 L50 10 L70 53 Q50 58 30 53 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M39 34 L61 34 M35 44 L65 44 M44 23 L56 23" stroke="${t.light}" stroke-width="3.5" fill="none"/>` +
      `<circle cx="50" cy="9" r="6" fill="#FDE047" stroke="#CA8A04"/>`,
    'wizard-hat': t => `<ellipse cx="50" cy="51" rx="31" ry="6.5" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M30 51 Q40 40 44 24 Q48 8 70 4 Q58 14 58 28 Q60 42 70 51 Q50 56 30 51 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      star(48, 36, 6, '#FDE047') + star(58, 20, 3.5, '#FDE047') + `<circle cx="40" cy="45" r="1.8" fill="#FDE047" stroke="none"/>`,
    beanie: t => `<path d="M24 50 Q24 20 50 18 Q76 20 76 50 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<rect x="21" y="43" width="58" height="13" rx="6.5" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M30 46 v7 M38 46 v7 M46 46 v7 M54 46 v7 M62 46 v7 M70 46 v7" stroke="${t.line}" stroke-width="1.8" opacity=".5" fill="none"/>` +
      `<circle cx="50" cy="16" r="7" fill="${t.light}" stroke="${t.line}"/>`,
    cap: t => `<path d="M60 50 Q86 46 94 53 Q84 59 60 56 Z" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M26 52 Q24 22 50 20 Q76 22 74 52 Q50 56 26 52 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M50 21 V52 M37 24 Q34 38 36 52 M63 24 Q66 38 64 52" stroke="${t.line}" stroke-width="1.8" opacity=".45" fill="none"/>` +
      `<circle cx="50" cy="20" r="3.2" fill="${t.mid}" stroke="${t.line}" stroke-width="1.5"/>`,
    headphones: t => `<path d="M20 58 Q18 14 50 14 Q82 14 80 58" fill="none" stroke="${t.line}" stroke-width="10"/>` +
      `<path d="M20 58 Q18 14 50 14 Q82 14 80 58" fill="none" stroke="${t.fill}" stroke-width="5"/>` +
      `<rect x="10" y="46" width="17" height="26" rx="8" fill="${t.fill}" stroke="${t.line}"/><rect x="73" y="46" width="17" height="26" rx="8" fill="${t.fill}" stroke="${t.line}"/>` +
      `<rect x="15" y="51" width="7" height="16" rx="3.5" fill="${t.light}" stroke="none"/><rect x="78" y="51" width="7" height="16" rx="3.5" fill="${t.light}" stroke="none"/>`,
    'flower-crown': t => `<path d="M18 52 Q50 38 82 52" fill="none" stroke="#15803D" stroke-width="4"/>` +
      `<ellipse cx="28" cy="45" rx="5" ry="2.6" transform="rotate(-30 28 45)" fill="#4ADE80" stroke="none"/><ellipse cx="72" cy="45" rx="5" ry="2.6" transform="rotate(30 72 45)" fill="#4ADE80" stroke="none"/>` +
      flower(22, 50, t.fill) + flower(36, 44, '#FDE68A') + flower(50, 42, t.fill) + flower(64, 44, '#A5B4FC') + flower(78, 50, t.fill),
    'gold-crown': () => `<path d="M26 54 L23 24 L37 38 L50 16 L63 38 L77 24 L74 54 Q50 58 26 54 Z" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<path d="M26 46 Q50 50 74 46" stroke="${GOLD_LINE}" stroke-width="2" fill="none"/>` +
      `<circle cx="50" cy="40" r="4.5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5"/><circle cx="36" cy="44" r="3" fill="#3B82F6" stroke="none"/><circle cx="64" cy="44" r="3" fill="#3B82F6" stroke="none"/>` +
      `<circle cx="23" cy="23" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/><circle cx="50" cy="15" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/><circle cx="77" cy="23" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/>`,
    'streak-headband': () => `<path d="M20 46 Q50 38 80 46 L80 56 Q50 48 20 56 Z" fill="#F97316" stroke="#9A3412"/>` +
      `<path d="M80 48 L92 44 L88 52 L94 58 L80 54 Z" fill="#F97316" stroke="#9A3412"/>` +
      `<path d="M50 50 Q42 44 46 36 Q48 42 51 40 Q50 34 55 30 Q54 38 58 42 Q60 48 50 50 Z" fill="#FDE047" stroke="#C2410C" stroke-width="2"/>`,
    'golden-laurel': () => {
      const leaves = side => [0, 1, 2, 3, 4].map(i => {
        const a = Math.PI * (0.95 - i * 0.11), x = 50 + side * Math.cos(a) * 30, y = 56 - Math.sin(a) * 18;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="3" transform="rotate(${(side * (-40 + i * 16)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/>`;
      }).join('');
      return `<path d="M22 56 Q30 38 46 36 M78 56 Q70 38 54 36" fill="none" stroke="${GOLD_LINE}" stroke-width="2.5"/>` + leaves(1) + leaves(-1);
    },
    'grad-cap': () => `<path d="M32 40 V52 Q50 58 68 52 V40 Z" fill="#0C4A6E" stroke="#082F49"/>` +
      `<path d="M12 34 L50 22 L88 34 L50 46 Z" fill="#0EA5E9" stroke="#075985"/>` +
      `<path d="M50 34 L76 40 V52" fill="none" stroke="#FDE047" stroke-width="2"/><path d="M73 52 h6 l-1 9 h-4 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1.5"/>` +
      `<circle cx="50" cy="34" r="2.5" fill="#FDE047" stroke="none"/>`,
    'cyber-halo': () => `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#22D3EE" stroke-width="9" opacity=".3"/>` +
      `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#22D3EE" stroke-width="3.5"/>` +
      `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#E0F2FE" stroke-width="1.2"/>` +
      `<path d="M50 4 L55 10 L50 16 L45 10 Z" fill="#A855F7" stroke="#6B21A8" stroke-width="1.5"/>`,

    /* face: lens centres at (33,50) and (67,50) */
    'round-glasses': t => `<path d="M21 48 L10 45 M79 48 L90 45" stroke="${t.fill}" stroke-width="3" fill="none"/>` +
      `<circle cx="33" cy="50" r="12" fill="#E0F2FE" fill-opacity=".35" stroke="${t.light}" stroke-width="6.5"/>` +
      `<circle cx="67" cy="50" r="12" fill="#E0F2FE" fill-opacity=".35" stroke="${t.light}" stroke-width="6.5"/>` +
      `<circle cx="33" cy="50" r="12" fill="none" stroke="${t.fill}" stroke-width="3.5"/>` +
      `<circle cx="67" cy="50" r="12" fill="none" stroke="${t.fill}" stroke-width="3.5"/>` +
      `<path d="M45 48 Q50 44 55 48" stroke="${t.fill}" stroke-width="3" fill="none"/>`,
    sunglasses: t => `<path d="M17 44 L8 41 M83 44 L92 41" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      `<path d="M17 42 H47 Q47 62 32 62 Q17 62 17 42 Z M53 42 H83 Q83 62 68 62 Q53 62 53 42 Z" fill="none" stroke="${lighter(t.fill, 0.45)}" stroke-width="6"/>` +
      `<path d="M17 42 H47 Q47 62 32 62 Q17 62 17 42 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M53 42 H83 Q83 62 68 62 Q53 62 53 42 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M47 45 Q50 42 53 45" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      `<path d="M23 47 l6 0 M59 47 l6 0" stroke="${WHITE}" stroke-width="2.5" opacity=".7" fill="none"/>`,
    'star-glasses': t => `<path d="M19 47 L9 44 M81 47 L91 44" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      star(33, 50, 16, t.fill, t.line) + star(67, 50, 16, t.fill, t.line) +
      `<circle cx="33" cy="51" r="6" fill="${t.light}" stroke="${t.line}" stroke-width="1.5"/><circle cx="67" cy="51" r="6" fill="${t.light}" stroke="${t.line}" stroke-width="1.5"/>` +
      `<path d="M46 49 Q50 46 54 49" stroke="${t.line}" stroke-width="3" fill="none"/>`,
    'pixel-shades': () => `<path d="M12 42 H88 V48 H82 V54 H76 V60 H58 V54 H54 V48 H46 V54 H42 V60 H24 V54 H18 V48 H12 Z" fill="none" stroke="#94A3B8" stroke-width="4"/><path d="M12 42 H88 V48 H82 V54 H76 V60 H58 V54 H54 V48 H46 V54 H42 V60 H24 V54 H18 V48 H12 Z" fill="#0F172A" stroke="#0F172A" stroke-width="1"/>` +
      `<path d="M24 48 h6 v6 h-6 Z M30 54 h6 v-0 M58 48 h6 v6 h-6 Z" fill="${WHITE}" stroke="none"/>`,
    'hero-mask': t => `<path fill-rule="evenodd" d="M12 47 Q18 36 34 40 Q50 44 66 40 Q82 36 88 47 Q86 62 68 62 Q56 62 50 55 Q44 62 32 62 Q14 62 12 47 Z M24 50 Q33 42 42 50 Q33 56 24 50 Z M58 50 Q67 42 76 50 Q67 56 58 50 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M88 47 L96 42 M88 49 L95 54" stroke="${t.line}" stroke-width="3" fill="none"/>`,
    'silver-shades': () => `<path d="M18 44 L9 41 M82 44 L91 41" stroke="#475569" stroke-width="3" fill="none"/>` +
      `<path d="M18 42 Q32 38 46 42 Q46 60 33 61 Q20 60 18 42 Z" fill="#CBD5E1" stroke="#475569"/>` +
      `<path d="M54 42 Q68 38 82 42 Q80 60 67 61 Q54 60 54 42 Z" fill="#CBD5E1" stroke="#475569"/>` +
      `<path d="M46 43 Q50 40 54 43" stroke="#475569" stroke-width="3" fill="none"/>` +
      `<path d="M24 48 l8 -3 M60 48 l8 -3" stroke="${WHITE}" stroke-width="3" fill="none"/>`,

    /* neck: centred on (50,50) */
    'bow-tie': t => `<path d="M50 50 L26 38 Q20 50 26 62 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M50 50 L74 38 Q80 50 74 62 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M30 44 L36 47 M30 56 L36 53 M70 44 L64 47 M70 56 L64 53" stroke="${t.light}" stroke-width="2" fill="none"/>` +
      `<rect x="43" y="43" width="14" height="14" rx="4" fill="${t.mid}" stroke="${t.line}"/>`,
    scarf: t => `<path d="M60 54 L70 88 L57 90 L52 58 Z" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M58 70 l10 -2 M60 80 l10 -2" stroke="${t.light}" stroke-width="3" fill="none"/>` +
      `<path d="M16 42 Q50 58 84 42 L86 53 Q50 70 14 53 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M30 51 l2 8 M44 54 l1 9 M58 54 l-1 9 M72 50 l-2 8" stroke="${t.light}" stroke-width="3" fill="none"/>`,
    'gold-chain': () => {
      let s = '';
      for (let i = 0; i <= 8; i++) {
        const u = i / 8, x = 22 + u * 56, y = 40 + Math.sin(u * Math.PI) * 18;
        s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.6" fill="none" stroke="${GOLD_LINE}" stroke-width="4.2"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.6" fill="none" stroke="${GOLD}" stroke-width="2"/>`;
      }
      return s + `<circle cx="50" cy="67" r="8.5" fill="${GOLD}" stroke="${GOLD_LINE}"/>` + star(50, 67, 4.5, '#FEF9C3');
    },
    'bronze-medal': () => `<path d="M36 28 L46 58 L54 58 L64 28 L56 28 L50 46 L44 28 Z" fill="#2563EB" stroke="#1E3A8A"/>` +
      `<circle cx="50" cy="64" r="11" fill="#D97706" stroke="#78350F"/>` + star(50, 64, 6, '#FCD34D'),

    /* back: hangs from the shoulders at (50,50); drawn behind the body */
    cape: t => `<path d="M32 40 Q50 47 68 40 Q84 64 102 96 Q76 104 50 101 Q24 104 -2 96 Q16 64 32 40 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M38 48 Q30 72 18 96 M62 48 Q70 72 82 96" stroke="${t.mid}" stroke-width="3" fill="none"/>`,
    'star-robe': () => `<path d="M32 40 Q50 47 68 40 Q84 64 102 96 Q76 104 50 101 Q24 104 -2 96 Q16 64 32 40 Z" fill="#6D28D9" stroke="#3B0764"/>` +
      star(20, 88, 4, '#FDE047') + star(80, 88, 4, '#FDE047') + star(30, 72, 3, '#FDE047') + star(70, 72, 3, '#FDE047') + star(50, 92, 3, '#FDE047'),
    'angel-wings': () => {
      const w = `<path d="${grow('M46 52 Q22 18 4 30 Q6 40 14 44 Q4 50 8 58 Q18 60 24 58 Q16 66 24 72 Q38 70 48 58 Z', 1.5, 50, 56)}" fill="#F8FAFC" stroke="#94A3B8"/>` +
        `<path d="${grow('M14 44 Q28 46 40 52 M24 58 Q34 58 44 56', 1.5, 50, 56)}" stroke="#CBD5E1" stroke-width="2" fill="none"/>`;
      return w + mirror(w);
    },
    'bat-wings': t => {
      const w = `<path d="${grow('M46 52 L6 26 Q10 42 2 54 Q14 52 18 62 Q26 56 32 66 Q36 56 48 58 Z', 1.5, 50, 56)}" fill="${t.fill}" stroke="${t.line}"/>` +
        `<path d="${grow('M44 54 L10 34 M40 56 L18 58 M42 58 L30 64', 1.5, 50, 56)}" stroke="${t.light}" stroke-width="1.8" fill="none"/>`;
      return w + mirror(w);
    },
    'fairy-wings': t => {
      const w = `<path d="${grow('M48 50 Q24 18 8 26 Q4 44 46 54 Z', 1.5, 50, 56)}" fill="${t.light}" fill-opacity=".85" stroke="${t.line}"/>` +
        `<path d="${grow('M48 56 Q22 60 18 76 Q30 84 48 60 Z', 1.5, 50, 56)}" fill="${t.fill}" fill-opacity=".85" stroke="${t.line}"/>`;
      return w + mirror(w);
    },
    jetpack: t => {
      const tank = x => `<path d="M${x + 4} 92 Q${x + 10} 106 ${x + 16} 92 Q${x + 10} 98 ${x + 4} 92 Z" fill="#FDE047" stroke="#EA580C" stroke-width="2"/>` +
        `<path d="M${x + 6} 88 Q${x + 10} 100 ${x + 14} 88 Z" fill="#F97316" stroke="none"/>` +
        `<rect x="${x}" y="34" width="20" height="54" rx="10" fill="${t.fill}" stroke="${t.line}"/>` +
        `<rect x="${x + 4}" y="40" width="5" height="30" rx="2.5" fill="${t.light}" stroke="none"/>` +
        `<rect x="${x + 3}" y="82" width="14" height="8" rx="2" fill="${t.mid}" stroke="${t.line}"/>`;
      return `<rect x="20" y="44" width="60" height="30" rx="6" fill="${t.mid}" stroke="${t.line}"/>` + tank(4) + tank(76);
    },

    /* held: the grip is at (50,50) */
    wand: () => `<path d="M48 64 L62 22" stroke="#1E293B" stroke-width="7"/><path d="M48 64 L62 22" stroke="#7C3AED" stroke-width="3.5"/>` +
      star(64, 16, 11, '#FDE047', '#CA8A04') + sparkle(80, 22, 4, '#FDE047') + sparkle(52, 8, 3, '#FDE047'),
    sword: () => `<path d="M46 46 L46 10 L50 2 L54 10 L54 46 Z" fill="#E2E8F0" stroke="#475569"/>` +
      `<path d="M50 8 V44" stroke="#94A3B8" stroke-width="1.5" fill="none"/>` +
      `<rect x="36" y="45" width="28" height="7" rx="3.5" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<rect x="46" y="52" width="8" height="14" rx="2" fill="#92400E" stroke="#451A03"/><circle cx="50" cy="69" r="4" fill="${GOLD}" stroke="${GOLD_LINE}"/>`,
    book: t => `<path d="M30 30 H66 Q70 30 70 34 V64 H34 Q30 64 30 60 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M34 60 H70 V66 H34 Q31 66 31 63 Q31 60 34 60 Z" fill="#F8FAFC" stroke="${t.line}" stroke-width="2"/>` +
      `<path d="M38 30 V60" stroke="${t.mid}" stroke-width="3" fill="none"/>` + star(54, 45, 7, '#FDE047'),
    balloon: t => `<path d="M50 54 Q46 42 56 32" fill="none" stroke="#64748B" stroke-width="1.8"/>` +
      `<ellipse cx="58" cy="17" rx="13" ry="15" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M55 32 L61 32 L58 28 Z" fill="${t.fill}" stroke="${t.line}" stroke-width="1.5"/>` +
      `<ellipse cx="53" cy="11" rx="3" ry="5" transform="rotate(-20 53 11)" fill="${WHITE}" opacity=".6" stroke="none"/>`,
    'u2-trophy': () => `<path d="M36 26 Q22 26 26 38 Q30 46 40 44 M64 26 Q78 26 74 38 Q70 46 60 44" fill="none" stroke="${GOLD_LINE}" stroke-width="3.5"/>` +
      `<path d="M34 20 H66 Q66 46 50 48 Q34 46 34 20 Z" fill="#EF4444" stroke="#991B1B"/>` +
      `<rect x="46" y="47" width="8" height="10" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<rect x="37" y="56" width="26" height="9" rx="2" fill="${GOLD}" stroke="${GOLD_LINE}"/>` + star(50, 31, 6, '#FEF9C3'),

    /* bg (avatar only): fills the circle */
    'bg-sky': () => `<circle cx="50" cy="50" r="50" fill="#BAE6FD" stroke="none"/>` +
      `<circle cx="76" cy="24" r="9" fill="#FDE047" stroke="none"/>` +
      `<path d="M10 70 Q12 62 20 64 Q24 56 32 62 Q40 60 38 70 Z M60 84 Q62 78 68 79 Q72 72 80 78 Q88 78 86 86 Z M18 32 Q20 27 25 28 Q28 23 34 28 Q38 28 37 33 Z" fill="${WHITE}" stroke="none"/>`,
    'bg-space': () => `<circle cx="50" cy="50" r="50" fill="#1E1B4B" stroke="none"/>` +
      [[18, 30], [30, 14], [72, 18], [86, 40], [14, 62], [80, 74], [44, 88], [62, 8], [24, 82]]
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.6}" fill="${WHITE}" stroke="none"/>`).join('') +
      `<circle cx="78" cy="26" r="7" fill="#F472B6" stroke="none"/><ellipse cx="78" cy="26" rx="12" ry="3" transform="rotate(-20 78 26)" fill="none" stroke="#FBCFE8" stroke-width="1.5"/>`,
    'bg-circuit': () => `<circle cx="50" cy="50" r="50" fill="#064E3B" stroke="none"/>` +
      `<path d="M4 40 H22 L30 32 H44 M96 60 H78 L70 68 H56 M30 96 V80 L38 72 M70 4 V20 L62 28 M10 70 H24 M90 30 H76" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".8"/>` +
      [[44, 32], [56, 68], [38, 72], [62, 28], [24, 70], [76, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#6EE7B7" stroke="none"/>`).join(''),

    /* frame (avatar only): a ring on the circle's edge */
    'frame-rainbow': () => ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7']
      .map((c, i) => `<circle cx="50" cy="50" r="${49 - i * 1.6}" fill="none" stroke="${c}" stroke-width="1.8"/>`).join(''),
    'platinum-frame': () => `<circle cx="50" cy="50" r="47" fill="none" stroke="#64748B" stroke-width="6.5"/>` +
      `<circle cx="50" cy="50" r="47" fill="none" stroke="#E2E8F0" stroke-width="4"/>` +
      [[50, 3], [97, 50], [50, 97], [3, 50]].map(([x, y]) => `<path d="M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1"/>`).join(''),

    /* effects: over the whole box */
    sparkles: () => sparkle(14, 20, 7, '#FDE047') + sparkle(86, 16, 5, '#FDE047') + sparkle(90, 62, 6, '#FDE047') +
      sparkle(10, 70, 4, '#FDE047') + sparkle(24, 8, 3, WHITE) + sparkle(76, 88, 4, '#FEF08A'),
    glitch: () => `<rect x="2" y="30" width="16" height="4" fill="#22D3EE" opacity=".8" stroke="none"/><rect x="84" y="44" width="14" height="3" fill="#F472B6" opacity=".8" stroke="none"/>` +
      `<rect x="6" y="62" width="10" height="3" fill="#F472B6" opacity=".8" stroke="none"/><rect x="80" y="70" width="16" height="4" fill="#22D3EE" opacity=".8" stroke="none"/>` +
      `<rect x="10" y="16" width="4" height="4" fill="#A3E635" stroke="none"/><rect x="88" y="22" width="4" height="4" fill="#22D3EE" stroke="none"/><rect x="18" y="86" width="4" height="4" fill="#F472B6" stroke="none"/>`,
    flames: () => {
      const fl = (x, h) => `<path d="M${x - 7} 98 Q${x - 9} ${98 - h * 0.6} ${x} ${98 - h} Q${x + 2} ${98 - h * 0.6} ${x + 7} ${98 - h * 0.7} Q${x + 9} ${98 - h * 0.3} ${x + 7} 98 Z" fill="#F97316" stroke="#C2410C" stroke-width="1.2" opacity=".92"/>` +
        `<path d="M${x - 3} 98 Q${x - 4} ${98 - h * 0.4} ${x} ${98 - h * 0.6} Q${x + 4} ${98 - h * 0.35} ${x + 3} 98 Z" fill="#FDE047" stroke="none"/>`;
      return fl(10, 30) + fl(22, 18) + fl(90, 30) + fl(78, 18);
    },
    'diamond-sparkle': () => [[14, 22, 5], [86, 18, 4], [90, 60, 5], [10, 66, 4], [50, 4, 3]]
      .map(([x, y, r]) => `<path d="M${x} ${y - r * 1.4} L${x + r} ${y} L${x} ${y + r * 1.4} L${x - r} ${y} Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1"/>`).join('') +
      sparkle(24, 40, 3, WHITE) + sparkle(78, 36, 3, WHITE)
  };

  const v = (id, name, col) => ({ id, name, col, price: 50 });
  // [id, name, slot, price | { unlock }, default colour, variants]
  const ITEM_LIST = [
    ['top-hat', 'Top hat', 'hat', 150, '#374151', [v('top-hat-plum', 'Plum top hat', '#7E22CE'), v('top-hat-red', 'Red top hat', '#B91C1C')]],
    ['party-hat', 'Party hat', 'hat', 80, '#EC4899', [v('party-hat-blue', 'Blue party hat', '#3B82F6'), v('party-hat-green', 'Green party hat', '#22C55E')]],
    ['wizard-hat', 'Wizard hat', 'hat', 200, '#6366F1', [v('wizard-hat-teal', 'Teal wizard hat', '#0D9488'), v('wizard-hat-red', 'Red wizard hat', '#DC2626')]],
    ['beanie', 'Beanie', 'hat', 60, '#14B8A6', [v('beanie-orange', 'Orange beanie', '#F97316'), v('beanie-purple', 'Purple beanie', '#8B5CF6')]],
    ['cap', 'Cap', 'hat', 100, '#3B82F6', [v('cap-red', 'Red cap', '#EF4444'), v('cap-black', 'Black cap', '#334155')]],
    ['headphones', 'Headphones', 'hat', 300, '#F43F5E', [v('headphones-white', 'White headphones', '#E2E8F0'), v('headphones-lime', 'Lime headphones', '#84CC16')]],
    ['flower-crown', 'Flower crown', 'hat', 180, '#F472B6', null],
    ['round-glasses', 'Round glasses', 'face', 60, '#1E293B', [v('round-glasses-red', 'Red round glasses', '#DC2626'), v('round-glasses-gold', 'Gold round glasses', '#CA8A04')]],
    ['sunglasses', 'Sunglasses', 'face', 120, '#0F172A', null],
    ['star-glasses', 'Star glasses', 'face', 180, '#FACC15', [v('star-glasses-pink', 'Pink star glasses', '#F472B6')]],
    ['pixel-shades', 'Pixel shades', 'face', 250, '#0F172A', null],
    ['hero-mask', 'Hero mask', 'face', 200, '#DC2626', [v('hero-mask-black', 'Black hero mask', '#1E293B'), v('hero-mask-blue', 'Blue hero mask', '#2563EB')]],
    ['bow-tie', 'Bow tie', 'neck', 50, '#E11D48', [v('bow-tie-blue', 'Blue bow tie', '#2563EB'), v('bow-tie-gold', 'Gold bow tie', '#EAB308')]],
    ['scarf', 'Scarf', 'neck', 90, '#EF4444', [v('scarf-green', 'Green scarf', '#16A34A'), v('scarf-blue', 'Blue scarf', '#0284C7')]],
    ['gold-chain', 'Gold chain', 'neck', 300, GOLD, null],
    ['cape', 'Cape', 'back', 200, '#DC2626', [v('cape-blue', 'Blue cape', '#2563EB'), v('cape-black', 'Black cape', '#1E293B')]],
    ['angel-wings', 'Angel wings', 'back', 450, '#F8FAFC', null],
    ['bat-wings', 'Bat wings', 'back', 400, '#6D28D9', null],
    ['fairy-wings', 'Fairy wings', 'back', 250, '#5EEAD4', [v('fairy-wings-pink', 'Pink fairy wings', '#F9A8D4')]],
    ['jetpack', 'Jetpack', 'back', 800, '#64748B', null],
    ['wand', 'Magic wand', 'held', 150, '#7C3AED', null],
    ['sword', 'Sword', 'held', 250, '#E2E8F0', null],
    ['book', 'Book', 'held', 80, '#2563EB', [v('book-red', 'Red book', '#DC2626'), v('book-green', 'Green book', '#16A34A')]],
    ['balloon', 'Balloon', 'held', 60, '#F43F5E', [v('balloon-yellow', 'Yellow balloon', '#FACC15'), v('balloon-blue', 'Blue balloon', '#38BDF8')]],
    ['bg-sky', 'Sunny sky', 'bg', 100, '#BAE6FD', null],
    ['bg-space', 'Deep space', 'bg', 300, '#1E1B4B', null],
    ['bg-circuit', 'Circuit board', 'bg', 250, '#064E3B', null],
    ['frame-rainbow', 'Rainbow ring', 'frame', 400, '#A855F7', null],
    ['sparkles', 'Sparkles', 'effect', 300, '#FDE047', null],
    ['glitch', 'Glitch', 'effect', 500, '#22D3EE', null],
    // Not for sale: unlocked at milestones.
    ['bronze-medal', 'Bronze medal', 'neck', { type: 'league', value: 0 }, '#D97706', null],
    ['silver-shades', 'Silver shades', 'face', { type: 'league', value: 1 }, '#CBD5E1', null],
    ['gold-crown', 'Gold crown', 'hat', { type: 'league', value: 2 }, GOLD, null],
    ['platinum-frame', 'Platinum ring', 'frame', { type: 'league', value: 3 }, '#E2E8F0', null],
    ['diamond-sparkle', 'Diamond sparkle', 'effect', { type: 'league', value: 4 }, '#7DD3FC', null],
    ['star-robe', 'Master’s robe', 'back', { type: 'league', value: 5 }, '#6D28D9', null],
    ['cyber-halo', 'Cyber halo', 'hat', { type: 'league', value: 6 }, '#22D3EE', null],
    ['streak-headband', 'Streak headband', 'hat', { type: 'streak', value: 7 }, '#F97316', null],
    ['flames', 'Flames', 'effect', { type: 'streak', value: 30 }, '#F97316', null],
    ['golden-laurel', 'Golden laurel', 'hat', { type: 'streak', value: 100 }, GOLD, null],
    ['grad-cap', 'Unit 1 graduation cap', 'hat', { type: 'mastery', value: 'u1' }, '#0EA5E9', null],
    ['u2-trophy', 'Unit 2 trophy', 'held', { type: 'mastery', value: 'u2' }, '#EF4444', null]
  ];

  const SLOTS = ['hat', 'face', 'neck', 'back', 'held', 'bg', 'frame', 'effect'];
  const AVATAR_ONLY = ['bg', 'frame'];
  const SLOT_ANCHOR = { hat: 'head', face: 'eyes', neck: 'neck', back: 'back', held: 'hand', bg: 'full', frame: 'full', effect: 'full' };
  const BEHIND = ['bg', 'back'];
  const FRONT = ['neck', 'face', 'hat', 'held', 'frame', 'effect'];
  const FULL = A(100, 100, 2);

  const ITEMS = ITEM_LIST.map(([id, name, slot, cost, col, variants]) => {
    const it = { id, name, slot, col, svg: c => ITEM_ART[id](tone(c, col)) };
    if (typeof cost === 'number') it.price = cost; else it.unlock = cost;
    if (variants) it.variants = variants;
    if (AVATAR_ONLY.includes(slot)) it.avatarOnly = true;
    return it;
  });

  const petById = {}; PETS.forEach(p => { petById[p.id] = p; });
  const itemById = {};
  ITEMS.forEach(it => {
    itemById[it.id] = { item: it, variant: null, col: it.col };
    (it.variants || []).forEach(vr => { itemById[vr.id] = { item: it, variant: vr, col: vr.col }; });
  });
  const pet = id => (Object.prototype.hasOwnProperty.call(petById, id) ? petById[id] : null);
  /* item(id) resolves an item or a colour variant id to { item, variant, col }. */
  const item = id => (Object.prototype.hasOwnProperty.call(itemById, id) ? itemById[id] : null);

  /* ---------- composing ---------- */
  const num = n => +(+n).toFixed(3);
  function placed(slot, art, anchor) {
    const a = anchor || FULL;
    const s = a.s > 0 ? a.s : 1;
    return `<g data-slot="${slot}" transform="translate(${num(a.x)} ${num(a.y)}) rotate(${num(a.r || 0)}) scale(${num(s)}) translate(-50 -50)" stroke-width="${num(3 / s)}" stroke-linejoin="round" stroke-linecap="round">${art}</g>`;
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* compose(baseSvg, anchors, outfit, opts) -> one <svg viewBox="0 0 200 200">.
     outfit is { slot: itemId or variantId }; unknown ids and items worn in the
     wrong slot are skipped. bg and back go behind the base, the rest in front
     (neck, face, hat, held, frame), effect last. opts: { size, title, cls }. */
  function compose(baseSvg, anchors, outfit, opts) {
    const o = opts || {};
    const an = anchors || {};
    const fit = outfit || {};
    const layer = slots => slots.map(slot => {
      const r = fit[slot] != null ? item(fit[slot]) : null;
      if (!r || r.item.slot !== slot) return '';
      return placed(slot, r.item.svg(r.col), an[SLOT_ANCHOR[slot]] || (SLOT_ANCHOR[slot] === 'full' ? FULL : null));
    }).join('');
    const size = o.size ? ` width="${num(o.size)}" height="${num(o.size)}"` : '';
    const cls = o.cls ? ` class="${esc(o.cls)}"` : '';
    const label = o.title ? ` role="img" aria-label="${esc(o.title)}"` : ' aria-hidden="true"';
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"${size}${cls}${label} style="overflow:visible">` +
      layer(BEHIND) + (baseSvg || '') + layer(FRONT) + '</svg>';
  }

  /* A pet with its outfit. opts: { col, mood, size, title, cls }. */
  function petSvg(id, outfit, opts) {
    const p = pet(id);
    if (!p) return '';
    const o = opts || {};
    const fit = {};
    Object.keys(outfit || {}).forEach(k => { if (!AVATAR_ONLY.includes(k)) fit[k] = outfit[k]; });
    return compose(p.svg(o.col || p.col, o.mood), p.anchors, fit, o);
  }

  let clipN = 0;
  /* The avatar's own drawing: a colour circle (left out when a bg is worn)
     holding the emoji, or the photo clipped to the circle. */
  function avatarBase(profile, hasBg) {
    const pr = profile || {};
    const col = HEX.test(pr.col || '') ? pr.col : '#38BDF8';
    let s = hasBg ? '' : `<circle cx="100" cy="100" r="100" fill="${col}"/>`;
    if (pr.photo) {
      const id = 'shop-av-clip-' + (++clipN);
      s += `<clipPath id="${id}"><circle cx="100" cy="100" r="100"/></clipPath><image href="${esc(pr.photo)}" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
    } else {
      s += `<text x="100" y="104" text-anchor="middle" dominant-baseline="central" font-size="112">${esc(pr.emoji || '\u{1F642}')}</text>`;
    }
    return s;
  }
  function avatarSvg(profile, outfit, opts) {
    const fit = outfit || {};
    return compose(avatarBase(profile, !!fit.bg && !!item(fit.bg)), AVATAR_ANCHORS, fit, opts);
  }

  /* ---------- buying ---------- */
  const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Cyber Legend'];

  /* progress = { leagueTier: 0..6, bestStreak: int, masteredUnits: ['u1'|'u2'] } */
  function isUnlocked(it, progress) {
    if (!it || !it.unlock) return true;
    const p = progress || {};
    const u = it.unlock;
    if (u.type === 'league') return typeof p.leagueTier === 'number' && p.leagueTier >= u.value;
    if (u.type === 'streak') return typeof p.bestStreak === 'number' && p.bestStreak >= u.value;
    if (u.type === 'mastery') return Array.isArray(p.masteredUnits) && p.masteredUnits.includes(u.value);
    return false;
  }
  function unlockText(it) {
    if (!it || !it.unlock) return '';
    const u = it.unlock;
    if (u.type === 'league') return `Reach the ${TIER_NAMES[u.value] || 'top'} League`;
    if (u.type === 'streak') return `Reach a ${u.value}-day streak`;
    if (u.type === 'mastery') return `Master every step in Unit ${String(u.value).replace(/\D/g, '')}`;
    return '';
  }
  /* What a pet, item or variant costs now. The first starter is free; once you
     own a starter, the others cost STARTER_PRICE. */
  function priceOf(it, owned) {
    if (!it || it.unlock) return 0;
    if (it.starter) {
      const own = owned || {};
      return PETS.some(p => p.starter && own[p.id]) ? STARTER_PRICE : 0;
    }
    return typeof it.price === 'number' ? it.price : 0;
  }
  /* canBuy(petOrItemOrVariant, wallet, owned, progress) -> { ok, reason, price }
     reason: 'ok' | 'unlocked' (a milestone item, free to claim) | 'owned' |
     'short' (not enough coins) | 'locked' (milestone not reached) | 'unknown'. */
  function canBuy(it, wallet, owned, progress) {
    if (!it || typeof it !== 'object' || !it.id) return { ok: false, reason: 'unknown', price: 0 };
    const own = owned || {};
    if (own[it.id]) return { ok: false, reason: 'owned', price: 0 };
    if (it.unlock) return isUnlocked(it, progress) ? { ok: true, reason: 'unlocked', price: 0 } : { ok: false, reason: 'locked', price: 0 };
    const price = priceOf(it, own);
    const coins = wallet && typeof wallet.coins === 'number' ? wallet.coins : 0;
    return coins >= price ? { ok: true, reason: 'ok', price } : { ok: false, reason: 'short', price };
  }

  /* ---------- saved state (Task 13) ----------
     The store's pets and wardrobe come from localStorage or a shared backup,
     so every id is checked against the lists above and anything else dropped. */
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const NAME_MAX = 20;

  /* A pet's name: trimmed, at most 20 characters, else the fallback. Kept as
     text; every place that shows it escapes it. */
  function cleanName(name, fallback) {
    const s = typeof name === 'string' ? Array.from(name.trim()).slice(0, NAME_MAX).join('').trim() : '';
    return s || fallback;
  }

  /* { owned: { petId: { name } }, active: petId | null }. An active pet that
     isn't owned becomes the first owned pet. */
  function coercePets(raw) {
    const out = { owned: {}, active: null };
    if (!isObj(raw) || !isObj(raw.owned)) return out;
    Object.keys(raw.owned).forEach(id => {
      const p = own(petById, id) ? petById[id] : null;
      if (!p) return;
      const rec = raw.owned[id];
      out.owned[id] = { name: cleanName(isObj(rec) ? rec.name : '', p.name) };
    });
    const ids = Object.keys(out.owned);
    out.active = typeof raw.active === 'string' && own(out.owned, raw.active) ? raw.active : (ids[0] || null);
    return out;
  }

  /* One wearer's outfit: { slot: id }, only owned items in their own slot. */
  function coerceOutfit(raw, owned, allowAvatarOnly) {
    const out = {};
    if (!isObj(raw)) return out;
    SLOTS.forEach(slot => {
      const id = raw[slot];
      if (typeof id !== 'string' || !own(owned, id) || !own(itemById, id)) return;
      const r = itemById[id];
      if (r.item.slot !== slot) return;
      if (!allowAvatarOnly && AVATAR_ONLY.includes(slot)) return;
      out[slot] = id;
    });
    return out;
  }

  /* { owned: { itemId: true }, avatar: { slot: id }, pet: { petId: { slot: id } } }.
     pets is the coerced pets record: outfits of pets not owned are dropped. */
  function coerceWardrobe(raw, pets) {
    const out = { owned: {}, avatar: {}, pet: {} };
    if (!isObj(raw)) return out;
    if (isObj(raw.owned)) {
      Object.keys(raw.owned).forEach(id => { if (raw.owned[id] === true && own(itemById, id)) out.owned[id] = true; });
    }
    out.avatar = coerceOutfit(raw.avatar, out.owned, true);
    const petsOwned = pets && isObj(pets.owned) ? pets.owned : {};
    if (isObj(raw.pet)) {
      Object.keys(raw.pet).forEach(id => {
        if (!own(petById, id) || !own(petsOwned, id)) return;
        const fit = coerceOutfit(raw.pet[id], out.owned, false);
        if (Object.keys(fit).length) out.pet[id] = fit;
      });
    }
    return out;
  }

  /* The longest run of consecutive calendar days among 'YYYY-MM-DD' keys. */
  function longestRun(days) {
    const DAY = 86400000;
    const t = [...new Set((days || []).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))]
      .map(d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    let best = 0, run = 0;
    t.forEach((v, i) => {
      run = i && v - t[i - 1] === DAY ? run + 1 : 1;
      if (run > best) best = run;
    });
    return best;
  }

  /* The progress the unlocks read, from the store's units: the best league
     tier reached in either unit, the best streak (saved count or a run in the
     activity history) and the units whose every path step is mastered
     (isMastered(unitId) is supplied by the app, which knows the path). */
  function buildProgress(units, isMastered) {
    const out = { leagueTier: 0, bestStreak: 0, masteredUnits: [] };
    if (!isObj(units)) return out;
    const n = v => (typeof v === 'number' && isFinite(v) ? v : 0);
    Object.keys(units).forEach(id => {
      const u = units[id];
      if (!isObj(u)) return;
      const lg = isObj(u.league) ? u.league : {};
      out.leagueTier = Math.max(out.leagueTier, n(lg.tier), n(lg.best));
      const act = isObj(u.activity) ? u.activity : {};
      const days = Object.keys(act).filter(d => n(act[d]) > 0);
      out.bestStreak = Math.max(out.bestStreak, n(isObj(u.streak) ? u.streak.count : 0), longestRun(days));
      if (typeof isMastered === 'function' && isMastered(id)) out.masteredUnits.push(id);
    });
    out.leagueTier = Math.min(out.leagueTier, TIER_NAMES.length - 1);
    return out;
  }

  const api = {
    PETS, ITEMS, MOODS, SLOTS, AVATAR_ONLY, SLOT_ANCHOR, AVATAR_ANCHORS, TIER_NAMES, STARTER_PRICE, NAME_MAX,
    pet, item, tone, compose, petSvg, avatarBase, avatarSvg, isUnlocked, unlockText, priceOf, canBuy,
    cleanName, coercePets, coerceWardrobe, longestRun, buildProgress
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();
