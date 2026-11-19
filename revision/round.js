/* ===== ROUNDS: ENGINE AND QUESTION FORMATS =====
   A round is up to 11 cards, one per term, picked by MEMORY.buildRound. The
   question format depends on how well the term is known:
     new / learning / forgotten -> multiple choice, options hidden at first
                                   (written scenario questions first)
     mastered                   -> typed answer or typed fill-the-gap where the
                                   term is short enough to type, else MC
     hard mode                  -> typed where typeable, else MC with no hint
   The style setting (MC only, typing preferred, flashcards only) overrides it.
   One true/false and one multi-select are mixed in where the data allows.

   New terms are taught first, in batches of TEACH_BATCH: the first card of a
   batch's questions carries `teach: [items]`, shown before its question.

   This file has no DOM access at the top level. Everything above the
   "browser hooks" line is pure and is tested in Node by tests/round.test.js;
   app globals (state, today, recordTermResult, ...) are only touched by the
   browser hooks at the bottom, at call time.

   The question helpers (termParts ... questionsForItem) moved here from the
   old lessons.js. pathNodes() and lessonBank() come from learn.js. */

const RMEM = (typeof MEMORY !== 'undefined') ? MEMORY : require('./memory.js');

const TEACH_BATCH = 3;        // terms taught together before any of them is asked
const TYPE_MAX_LEN = 28;      // longest answer we'll ask anyone to type
const ROUND_MAX = 11;         // term cards in a round
const ROUND_XP = 5;           // per card right first time, times the combo
const MIN_ROUND = 4;          // a smaller round is topped up with earlier mastered terms
const ROUND_SETTINGS_KEY = 'rev_round_settings';
const ROUND_STYLES = ['mixed', 'mcq', 'typing', 'flash'];

function roundEscape(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- question helpers ---------- */

/* Recap entries such as "C1.1.1-C1.1.3 Cloud Deployment Models Compared" sum
   up a range of terms. They belong in the notes, not in a quiz as a "term".
   The rule is structural: a recap's code is a full range, with a letter after
   the hyphen ("C1.1.1-C1.1.3"). A merged item such as "B3.1.2-3 Ports &
   Packets" has a digit there and is a real term.
   app.js isPathTerm() repeats this rule (it runs before this file loads);
   tests/round.test.js checks the two agree on every item of both units. */
function isRecapItem(it) {
  return !!it && /-[A-Z]/.test(String(it.code));
}
function isLessonItem(it) { return !!(it && it.term && it.definition && !isRecapItem(it)); }

/* ---------- names for a term ----------
   The spec audits found the generator marking right answers wrong and wrong
   ones right. The rules now:
   - "X (Y)": X is always a name. Y is a name only when one abbreviates the
     other ("(IaaS)", "(MFA)", "(VoIP)", "BYOD (Bring Your Own Device)").
     Qualifiers such as "(UK)" or "(deliberate & accidental)" are not answers.
   - Slash lists: "Passwords / Multi-Factor Authentication" accepts each side,
     "Stealing/Leaking Information" accepts "Stealing Information" and
     "Leaking Information", "TCP/IP" accepts only "TCP/IP".
   - " – ": the head before the dash ("Unauthorised Access – Hackers").
   - Never split on "and": "Voice" is not "Voice and Video Calls".
   - The item's own `accepts` / `aka` lists add spec wording and synonyms. */

const INITIAL_STOP = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'over', 'the', 'to', 'with', 'via']);
// Words that carry no meaning in a prompt.
const PROMPT_STOP = new Set([...INITIAL_STOP, 'vs', 'etc', 'its', 'it', 'into', 'how', 'other', 'use', 'used', 'uses',
  'using', 'different', 'between', 'affect', 'affects', 'impact', 'implications', 'type', 'types', 'their', 'your', 'own',
  'what', 'why', 'when', 'who', 'which', 'that', 'this', 'these', 'those', 'from', 'are', 'is', 'be', 'can', 'not', 'more',
  'has', 'have', 'been', 'was', 'were']);
// ...and words too vague to show what a term or definition is about.
const CONTENT_STOP = new Set([...PROMPT_STOP,
  'than', 'often', 'one', 'being', 'usually', 'through', 'rather', 'including', 'include', 'includes', 'making', 'make',
  'made', 'such', 'also', 'them', 'they', 'there', 'where', 'all', 'any', 'each', 'only', 'some', 'without', 'within',
  'after', 'before', 'about', 'will', 'but', 'so', 'if', 'then', 'you']);
// Left visible in a prompt even when they are part of the term.
const MASK_KEEP = new Set(['system', 'systems', 'data', 'information']);
// Too common to show that two terms overlap.
const GENERIC_WORDS = new Set([...MASK_KEEP, 'online', 'digital', 'device', 'devices', 'network', 'networks', 'computer',
  'computers', 'security', 'cyber', 'user', 'users', 'service', 'services', 'technology', 'technologies', 'software',
  'hardware', 'internet', 'organisation', 'organisations', 'people', 'needs', 'personal', 'business']);

const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const asItem = x => (typeof x === 'string' ? { term: x } : (x || { term: '' }));
const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];

function splitTerm(term) {
  const m = String(term).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { outer: m[1].trim(), inner: m[2].trim() } : { outer: String(term).trim(), inner: null };
}

/* "IaaS", "PCs", "VoIP", "CDPA 1988": a short token with two or more capitals. */
function isAcronymToken(s) {
  const t = String(s).trim().replace(/\s+(19|20)\d\d$/, '');
  return /^[A-Z0-9][A-Za-z0-9]{1,7}$/.test(t) && /[A-Z]/.test(t) && (t.match(/[A-Z0-9]/g) || []).length >= 2;
}

/* "PCs" -> "PC", "IaaS" -> "IAAS", "CDPA 1988" -> "CDPA" */
function acronymKey(s) {
  let t = String(s).trim().replace(/\s+(19|20)\d\d$/, '');
  if (/[A-Z]s$/.test(t)) t = t.slice(0, -1);
  return t.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/* Does `short` abbreviate `long`? Each word of `long` gives a prefix (small
   words may give nothing): MFA = Multi-Factor Authentication, IaaS =
   Infrastructure as a Service, Codec = Coder-Decoder. */
function isAbbrevOf(short, long) {
  const s0 = String(short).trim().replace(/\s+(19|20)\d\d$/, '');
  if (!s0 || /\s/.test(s0) || s0.replace(/[^A-Za-z0-9]/g, '').length > 8) return false;
  const words = String(long).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length < 2) return false;
  const base = s0.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fits = (t, i) => {
    if (i === words.length) return t === '';
    const w = words[i];
    if (INITIAL_STOP.has(w) && fits(t, i + 1)) return true;
    for (let k = 1; k <= Math.min(w.length, t.length); k++) {
      if (t.slice(0, k) !== w.slice(0, k)) break;
      if (fits(t.slice(k), i + 1)) return true;
    }
    return false;
  };
  return fits(base, 0) || (base.length > 2 && base.endsWith('s') && fits(base.slice(0, -1), 0));
}

/* The sides of a slash or dash list, as written. */
function listSides(outer) {
  return String(outer).replace(/\s+and\/or\s+/i, '/').split(/\s*\/\s*|\s+[–—-]\s+/).map(s => s.trim()).filter(Boolean);
}

/* Is the bracket in "X (Y)" another name for X? */
function isBracketAlias(outer, inner) {
  const heads = [outer, ...listSides(outer)];
  if (heads.some(h => isAbbrevOf(inner, h)) || isAbbrevOf(outer, inner)) return true;
  // "Voice and Video Calls over the Internet (VoIP)", "User Experience (UX)": an
  // acronym starting with the same letter. "NCSC (UK)" and "NIST (USA)" do not.
  return isAcronymToken(inner) && heads.some(h => h.charAt(0).toUpperCase() === inner.charAt(0).toUpperCase());
}

/* Names made from slash and dash lists (see the rules above). */
function nameFragments(outer) {
  const out = [];
  const dash = String(outer).split(/\s+[–—-]\s+/);
  if (dash.length > 1) {
    out.push(dash[0]);
    dash.slice(1).forEach(d => { if (d.trim().split(/\s+/).length >= 2) out.push(d); });
  }
  const main = dash[0].replace(/\s+and\/or\s+/i, '/');
  if (!main.includes('/')) return out;
  const spaced = /\s\/\s/.test(main);
  const sides = main.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
  const words = sides.map(s => s.split(/\s+/));
  const caps = s => /^[A-Z0-9]+$/.test(s);
  if (words.every(w => w.length === 1)) {            // Blog/Vlog yes, TCP/IP no
    if (!sides.some(caps)) out.push(...sides);
    return out;
  }
  if (spaced && !sides.some(s => !/\s/.test(s) && caps(s))) {   // Passwords / Multi-Factor Authentication
    out.push(...sides);
    return out;
  }
  const first = words[0], last = words[words.length - 1];
  if (last.length > 1 && words.slice(0, -1).every(w => w.length === 1)) {
    const tail = last.slice(1).join(' ');            // Stealing/Leaking Information, OS / GUI / CLI Vulnerabilities
    sides.slice(0, -1).forEach(s => out.push(`${s} ${tail}`));
    out.push(sides[sides.length - 1]);
  } else if (first.length > 1 && words.slice(1).every(w => w.length === 1)) {
    const head = first.slice(0, -1).join(' ');       // Network Features/Requirements
    out.push(sides[0]);
    sides.slice(1).forEach(s => out.push(`${head} ${s}`));
  }
  return out;
}

function termParts(term) {
  // "Infrastructure as a Service (IaaS)" -> ["Infrastructure as a Service (IaaS)", "Infrastructure as a Service", "IaaS"]
  // "NCSC (UK)" -> ["NCSC (UK)", "NCSC"]
  const { outer, inner } = splitTerm(term);
  const parts = [String(term)];
  if (inner !== null) {
    parts.push(outer);
    if (isBracketAlias(outer, inner)) parts.push(inner);
  }
  return parts.filter(p => p && p.trim().length > 1);
}

/* ---------- typed answers ----------
   Like Gizmo's "Mixed" style: once a term has been met in a multiple-choice
   question, it comes back later as one you have to type. Small spelling
   mistakes are forgiven, and any accepted name for the term counts
   (e.g. "IaaS" or "Infrastructure as a Service"). "and", "&", commas,
   slashes and years are ignored, so "Passwords, MFA" = "Passwords and MFA"
   and "Computer Misuse Act 1990" = "Computer Misuse Act". */

const answerCache = new Map();
function acceptedAnswers(itemOrTerm) {
  const item = asItem(itemOrTerm);
  const key = [item.term, ...(item.accepts || []), '|', ...(item.aka || [])].join('\u0001');
  if (!answerCache.has(key)) {
    const all = [...termParts(item.term), ...nameFragments(splitTerm(item.term).outer), ...(item.accepts || []), ...(item.aka || [])];
    const seen = new Set(), out = [];
    all.map(x => String(x).trim()).filter(x => x.length > 1).forEach(x => {
      const k = normAnswer(x);
      if (k && !seen.has(k)) { seen.add(k); out.push(x); }
    });
    answerCache.set(key, out);
  }
  return answerCache.get(key).slice();
}

function normAnswer(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')    // "&", commas, slashes, hyphens -> spaces
    .replace(/\b(19|20)\d\d\b/g, ' ') // "Computer Misuse Act 1990" = "Computer Misuse Act"
    .replace(/\b(the|a|an|and)\b/g, ' ')
    .replace(/s\b/g, '')            // "VPNs" = "VPN", "Viruses" ~ "Virus"
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/* normAnswer drops a final "s", which leaves "Viruses" ("viruse") apart from
   "Virus" ("viru"). Words ending s, x, z, ch or sh take "-es" plurals, so the
   form without that "es" is a second key: "viruses" -> "virus" -> "viru". */
function answerKeys(s) {
  const keys = new Set([normAnswer(s), normAnswer(String(s).replace(/(s|x|z|ch|sh)es\b/gi, '$1'))]);
  keys.delete('');
  return keys;
}

/* 'exact' | 'close' (right, but misspelt) | false */
function checkTyped(typed, accepts) {
  const t = normAnswer(typed);
  if (!t) return false;
  const tKeys = answerKeys(typed);
  let best = false;
  accepts.forEach(a => {
    const n = normAnswer(a);
    if (!n) return;
    if ([...answerKeys(a)].some(k => tKeys.has(k))) { best = 'exact'; return; }
    const tol = n.length <= 4 ? 0 : n.length <= 9 ? 1 : 2;
    if (!best && editDistance(t, n) <= tol) best = 'close';
  });
  return best;
}

/* Takes an item (its accepts / aka count) or a bare term. */
function isTypeable(itemOrTerm) {
  return acceptedAnswers(itemOrTerm).some(a => a.length <= TYPE_MAX_LEN);
}

/* ---------- hiding the answer ---------- */

/* A name as a whole word (never inside "Wikipedia" or "USB-C"). `exact` (for
   gaps) also refuses plurals, so the verb "costs" is never blanked. */
function nameRegex(name, exact, flags = 'gi') {
  return new RegExp(`(?<![\\w-])${reEsc(name)}${exact ? '' : '(?:e?s)?'}(?![\\w-])`, flags);
}

function stemWord(w) {
  let s = String(w).toLowerCase();
  for (const suf of ['ations', 'ation', 'ities', 'ity', 'ings', 'ing', 'ions', 'ion', 'ies', 'es', 'ed', 'al', 's']) {
    if (s.endsWith(suf) && s.length - suf.length >= 4) { s = s.slice(0, -suf.length); break; }
  }
  if (s.length >= 6 && s.endsWith('er')) s = s.slice(0, -2);   // readers ~ reads, printer ~ printing
  return s;
}

/* The content words of a phrase, as stems: "Signs of System Compromise" ->
   sign, system, compromise. Acronyms stay whole words. */
function wordStems(phrase, skip) {
  const out = [], seen = new Set();
  (String(phrase).match(/[A-Za-z0-9]+/g) || []).forEach(tok => {
    const low = tok.toLowerCase();
    if (CONTENT_STOP.has(low) || (skip && skip.has(low))) return;
    let st;
    if (isAcronymToken(tok)) st = { w: acronymKey(tok), acr: true };
    else if (tok.length >= 3 && /[a-z]/i.test(tok)) st = { w: stemWord(tok), acr: false };
    if (st && !seen.has(st.w.toLowerCase())) { seen.add(st.w.toLowerCase()); out.push(st); }
  });
  return out;
}

/* Compound words a stem must also catch when they are written another way:
   "Mail" in "email" or "e-mail", "Backup" as "backed up" or "back-up". */
const STEM_FORMS = {
  mail: '(?:e-?)?mail', email: '(?:e-?)?mail',
  backup: 'back(?:ed|ing|s)?[\\s-]?up', login: 'log(?:ged|ging|s)?[\\s-]?in', setup: 'set(?:ting|s)?[\\s-]?up'
};

function stemRegex(st, flags = 'i') {
  if (st.acr) return new RegExp(`(?<![A-Za-z0-9])${reEsc(st.w)}s?(?![A-Za-z0-9])`, flags);
  const form = STEM_FORMS[st.w.toLowerCase()] || reEsc(st.w);
  return new RegExp(`(?<![A-Za-z0-9])${form}[A-Za-z0-9]*`, flags);
}

function wordSpans(text) {
  const out = [], re = /[A-Za-z0-9]+/g;
  let m;
  while ((m = re.exec(text))) out.push({ w: m[0], s: m.index, e: m.index + m[0].length });
  return out;
}

/* Runs of words whose initials spell the acronym: "National Cyber Security
   Centre" for NCSC, "National Institute of Standards and Technology" for NIST. */
function expansionRanges(text, acro) {
  const key = acronymKey(acro);
  if (key.length < 3) return [];
  const ws = wordSpans(String(text)), out = [];
  for (let i = 0; i < ws.length; i++) {
    if (INITIAL_STOP.has(ws[i].w.toLowerCase())) continue;
    let all = '', content = '';
    for (let j = i; j < ws.length; j++) {
      const w = ws[j].w, stop = INITIAL_STOP.has(w.toLowerCase());
      all += w[0].toUpperCase();
      if (!stop) content += w[0].toUpperCase();
      if (j > i && !stop && (all === key || content === key)) { out.push([ws[i].s, ws[j].e]); i = j; break; }
      if (all.length >= key.length && content.length >= key.length) break;
    }
  }
  return out;
}

/* Acronyms a multi-word name would be shortened to: "Internet of Things" -> IOT. */
function derivedAcronyms(names) {
  const out = new Set();
  names.forEach(n => {
    const ws = String(n).split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (ws.length < 2) return;
    const all = ws.map(w => w[0].toUpperCase()).join('');
    const content = ws.filter(w => !INITIAL_STOP.has(w.toLowerCase())).map(w => w[0].toUpperCase()).join('');
    [all, content].forEach(k => { if (k.length >= 3) out.add(k); });
  });
  return out;
}

function acronymNames(item) { return acceptedAnswers(item).filter(isAcronymToken); }

/* Hide the answer if the prompt text gives it away: every name for the term,
   the spelt-out form of its acronym (and the acronym of a spelt-out name), and
   the term's own content words ("Signs that a system has been compromised"
   -> "___ that a system has been ___"). opts.exact: names only, exact form. */
function maskTerm(text, itemOrTerm, opts = {}) {
  const item = asItem(itemOrTerm);
  let out = String(text);
  const names = acceptedAnswers(item).sort((a, b) => b.length - a.length);
  names.forEach(p => { out = out.replace(nameRegex(p, !!opts.exact), '___'); });
  if (opts.exact) return out;
  acronymNames(item).forEach(a => {
    expansionRanges(out, a).reverse().forEach(([s, e]) => { out = out.slice(0, s) + '___' + out.slice(e); });
  });
  const derived = derivedAcronyms(names);
  out = out.replace(/(?<![\w-])[A-Za-z0-9]+(?![\w-])/g, tok => (isAcronymToken(tok) && derived.has(acronymKey(tok)) ? '___' : tok));
  wordStems(splitTerm(item.term).outer, MASK_KEEP).forEach(st => { out = out.replace(stemRegex(st, 'gi'), '___'); });
  return out.replace(/___(?:(?:[\s\-–—,&/]|\b(?:and|or)\b)+___)+/g, '___');
}

/* Enough left to answer from: two or more content words besides the blanks. */
function promptHasContent(text) {
  const words = String(text).replace(/___/g, ' ').match(/[A-Za-z0-9]+/g) || [];
  return words.filter(w => w.length >= 3 && !PROMPT_STOP.has(w.toLowerCase())).length >= 2;
}

/* "Private Cloud" -> "P______ C____". Spells the main name (never a bracketed
   qualifier) when it is short enough to type, else the shortest other name. */
function typeHint(answer, accepts) {
  const main = splitTerm(answer).outer;
  const pool = [...(accepts || []), ...acceptedAnswers(answer)].filter(x => x.length <= TYPE_MAX_LEN).sort((x, y) => x.length - y.length);
  const a = main.length <= TYPE_MAX_LEN ? main : (pool[0] || answer);
  return a.split(' ').map(w => w.charAt(0) + w.slice(1).replace(/[A-Za-z0-9]/g, '_')).join(' ');
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Items near this one: same subtopic, then topic, then section. */
function nearbyItems(node) {
  if (!node) return [[]];
  const lists = [node.items || []];
  if (node.topic) lists.push((node.topic.subtopics || []).flatMap(s => s.items || []).filter(isLessonItem));
  if (node.section) lists.push((node.section.topics || []).flatMap(t => (t.subtopics || []).flatMap(s => s.items || [])).filter(isLessonItem));
  return lists;
}

/* ---------- terms that overlap ----------
   A wrong option must really be wrong. Items listed in each other's
   `confusable`, items in different `group`s (cloud deployment vs service
   models) and items whose text names the other are kept apart. */

const isOverview = it => !!(it && it.overview);
function listedConfusable(a, b) {
  return (a.confusable || []).includes(b.code) || (b.confusable || []).includes(a.code);
}
const otherGroup = (a, b) => !!(a.group && b.group && a.group !== b.group);
const itemText = it => [it.term, it.definition, ...(it.keyFacts || []), it.examTip, it.examples].filter(Boolean).join(' ');
const notesText = it => [it.term, it.definition, ...(it.keyFacts || []), it.examTip].filter(Boolean).join(' ');
const keyStems = it => wordStems(splitTerm(it.term).outer, GENERIC_WORDS);

/* Does the text name the item (any name, or its acronym spelt out)? */
function namesItem(text, it) {
  const t = String(text || '');
  if (!t) return false;
  return acceptedAnswers(it).some(n => nameRegex(n, false, 'i').test(t)) || acronymNames(it).some(a => expansionRanges(t, a).length > 0);
}

/* ...or uses one of its key words ("Damage caused by insiders" for
   "Accidental or Deliberate Damage"). */
function touchesItem(text, it) {
  return namesItem(text, it) || keyStems(it).some(st => stemRegex(st).test(String(text || '')));
}

/* Two definitions that say nearly the same thing: two or more key words in
   common ("Weaknesses ... outdated" in both), or most of their words. */
function nearParaphrase(d1, d2) {
  const a = [...new Set(wordStems(d1, GENERIC_WORDS).map(s => s.w.toLowerCase()))];
  const b = [...new Set(wordStems(d2, GENERIC_WORDS).map(s => s.w.toLowerCase()))];
  if (!a.length || !b.length) return false;
  const same = (x, y) => x === y || (Math.min(x.length, y.length) >= 4 && (x.startsWith(y) || y.startsWith(x)));
  const both = a.filter(x => b.some(y => same(x, y))).length;
  return both >= 2 || both / (a.length + b.length - both) >= 0.4;
}

/* True/false: the partner's definition must be plainly NOT about the item. */
function tfClash(a, b) {
  return listedConfusable(a, b) || isOverview(b) || otherGroup(a, b)
    || touchesItem(a.definition, b) || touchesItem(b.definition, a)
    || nearParaphrase(a.definition, b.definition);
}

/* Multi-select and multiple choice: the other item's examples or term must
   not also fit this one. */
function relatedItems(a, b) {
  if (listedConfusable(a, b) || otherGroup(a, b)) return true;
  if (namesItem(itemText(a), b) || namesItem(itemText(b), a)) return true;
  if (nearParaphrase(a.definition, b.definition)) return true;
  const head = it => keyStems(it)[0];
  const ha = head(a), hb = head(b);
  if ((hb && stemRegex(hb).test(a.definition || '')) || (ha && stemRegex(ha).test(b.definition || ''))) return true;
  // One's examples named in the other's notes ("VPNs" in "Protecting a WLAN").
  const exIn = (x, y) => exampleParts(x).some(p => p.length >= 3 && nameRegex(p, false, 'i').test(notesText(y)));
  return exIn(a, b) || exIn(b, a);
}

/* Does another item's own text already cover this example? ("A DDoS taking a
   website offline" is also about Bots, whose definition mentions DDoS.) */
function exampleFits(example, it) {
  if (namesItem(example, it)) return true;
  const text = itemText(it);
  const st = wordStems(example, GENERIC_WORDS);
  if (st.some(s => s.acr && s.w.length >= 3 && stemRegex(s).test(text))) return true;
  const hits = st.filter(s => stemRegex(s).test(text)).length;
  return st.length >= 2 && hits * 2 >= st.length + 1;
}

/* Other terms to use as wrong answers: same subtopic, then topic, then section.
   With `example`, terms whose own text covers that example are left out. */
function distractorTerms(item, node, n, example) {
  const seen = new Set([normAnswer(item.term)]);
  const out = [];
  const take = list => shuffled(list).forEach(it => {
    if (out.length >= n || !it || !it.term || it.code === item.code) return;
    const k = normAnswer(it.term);
    if (seen.has(k) || relatedItems(item, it) || (example && exampleFits(example, it))) return;
    seen.add(k);
    out.push(it.term);
  });
  nearbyItems(node).forEach(list => { if (out.length < n) take(list); });
  return out;
}

function firstSentence(text) {
  const s = String(text || '').split(/(?<=[.!?])\s/)[0];
  return s.length > 220 ? s.slice(0, 217) + '…' : s;
}

function itemWhy(item) {
  return item.examTip || (item.keyFacts && item.keyFacts[0]) || firstSentence(item.definition);
}

/* opts.forPrompt: only examples that do not name the term ("BBC podcasts"
   would ask "Which is this an example of? BBC ___"). */
function exampleParts(item, opts = {}) {
  const parts = item && item.examples
    ? String(item.examples).split(/;\s*/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean)
    : [];
  return opts.forPrompt ? parts.filter(p => maskTerm(p, item) === p) : parts;
}

/* The questions for one term on a path node. */
function questionsForItem(item, node, bank) {
  const qs = [];
  const why = itemWhy(item);
  const lessonQs = bank || (typeof lessonBank === 'function' ? lessonBank() : {});

  // Written scenario questions come first: they are the point of the lesson.
  (lessonQs[item.code] || []).forEach((q, i) => {
    if (!q || !Array.isArray(q.options) || !q.options[q.answer]) return;
    qs.push({
      id: `${item.code}#s${i}`, code: item.code, kind: q.type === 'gap' ? 'Fill the gap' : 'Scenario',
      q: q.q, answer: q.options[q.answer], options: q.options.slice(), why: q.why || why
    });
  });

  const wrong = distractorTerms(item, node, 3);
  const def = maskTerm(item.definition, item);
  const defText = `<span class="lq-quote">${roundEscape(def)}</span>`;
  if (isTypeable(item) && promptHasContent(def)) {
    // The hardest check: no options to pick from, you have to recall it.
    qs.push({
      id: `${item.code}#t`, code: item.code, kind: 'Type the term', typed: true,
      q: `Which term matches this description?${defText}`, html: true,
      answer: item.term, accepts: acceptedAnswers(item), why
    });
  } else if (wrong.length >= 2) {
    qs.push({
      id: `${item.code}#d`, code: item.code, kind: 'Definition',
      q: `Which term matches this description?${defText}`,
      html: true, answer: item.term, options: [item.term, ...wrong], why
    });
  }
  const ex = exampleParts(item, { forPrompt: true });
  if (ex.length) {
    const pick = pickOne(ex);
    const exWrong = distractorTerms(item, node, 2, pick);
    if (exWrong.length >= 2) {
      qs.push({
        id: `${item.code}#e`, code: item.code, kind: 'Example',
        q: `<span class="lq-quote">${roundEscape(pick)}</span>Which of these is this an example of?`,
        html: true, answer: item.term, options: [item.term, ...exWrong],
        why: `${item.term}: ${firstSentence(item.definition)}`
      });
    }
  }
  return qs;
}

/* ---------- round settings ---------- */

function defaultRoundSettings() {
  return { style: 'mixed', hideOptions: true, spelling: true };
}

function coerceRoundSettings(raw) {
  const d = defaultRoundSettings();
  if (!raw || typeof raw !== 'object') return d;
  return {
    style: ROUND_STYLES.includes(raw.style) ? raw.style : d.style,
    hideOptions: typeof raw.hideOptions === 'boolean' ? raw.hideOptions : d.hideOptions,
    spelling: typeof raw.spelling === 'boolean' ? raw.spelling : d.spelling
  };
}

function roundStorage(storage) {
  if (storage) return storage;
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
}

function loadRoundSettings(storage) {
  try {
    const s = roundStorage(storage);
    const raw = s && s.getItem(ROUND_SETTINGS_KEY);
    return coerceRoundSettings(raw ? JSON.parse(raw) : null);
  } catch (e) {
    return defaultRoundSettings();
  }
}

function saveRoundSettings(settings, storage) {
  const clean = coerceRoundSettings(settings);
  try {
    const s = roundStorage(storage);
    if (s) s.setItem(ROUND_SETTINGS_KEY, JSON.stringify(clean));
  } catch (e) { /* private window or full storage: settings last this visit only */ }
  return clean;
}

/* ---------- question formats ----------
   Every q has: kind, code, label, prompt (HTML, already escaped), answer, why.
     mcq    options[] (shuffled), hidden (options start hidden), noHint
     type   accepts[]           gap   accepts[] (a sentence with the term blanked)
     tf     answer is a boolean  multi answers[] and options[] (shuffled)
     flip   front, back (self-marked)                                       */

function mcqQuestion(item, node, bank, settings) {
  const why = itemWhy(item);
  const written = ((bank || {})[item.code] || []).filter(q => q && Array.isArray(q.options) && q.options[q.answer]);
  if (written.length) {
    const w = pickOne(written);
    return {
      kind: 'mcq', code: item.code, label: w.type === 'gap' ? 'Fill the gap' : 'Scenario',
      prompt: roundEscape(w.q), answer: w.options[w.answer], options: shuffled(w.options),
      hidden: settings.hideOptions, why: w.why || why
    };
  }
  const def = maskTerm(item.definition, item);
  const ex = exampleParts(item, { forPrompt: true });
  if (ex.length && (Math.random() < 0.35 || !promptHasContent(def))) {
    const pick = pickOne(ex);
    const exWrong = distractorTerms(item, node, 3, pick);
    if (exWrong.length >= 2) {
      return {
        kind: 'mcq', code: item.code, label: 'Example',
        prompt: `<span class="lq-quote">${roundEscape(pick)}</span>Which of these is this an example of?`,
        answer: item.term, options: shuffled([item.term, ...exWrong]), hidden: settings.hideOptions,
        why: `${item.term}: ${firstSentence(item.definition)}`
      };
    }
  }
  const wrong = distractorTerms(item, node, 3);
  if (wrong.length < 2) return null;
  return {
    kind: 'mcq', code: item.code, label: 'Definition',
    prompt: `Which term matches this description?<span class="lq-quote">${roundEscape(def)}</span>`,
    answer: item.term, options: shuffled([item.term, ...wrong]), hidden: settings.hideOptions, why
  };
}

/* What a gap's blank accepts: the name that was blanked and names that mean
   the same ("MFA" = "Multi-Factor Authentication"), not the other half of a
   compound term ("Passwords"). A blank that stands for the whole term
   accepts every name for it. */
function gapAnswer(item, hit) {
  const all = acceptedAnswers(item);
  const h = normAnswer(hit);
  const { outer } = splitTerm(item.term);
  const whole = [item.term, outer].some(x => normAnswer(x) === h || isAbbrevOf(hit, x) || isAbbrevOf(x, hit));
  if (whole) return { answer: item.term, accepts: all };
  const same = all.filter(a => normAnswer(a) === h || isAbbrevOf(a, hit) || isAbbrevOf(hit, a));
  const accepts = [hit, ...same.filter(a => a !== hit)];
  return { answer: same.find(a => normAnswer(a) === h) || hit, accepts };
}

/* Sentences from the notes that name the term once, as a whole word, for a
   typed fill-the-gap. A sentence is skipped when the rest of it gives the
   answer away: another name or a plural of it ("the interviewer", "costs"),
   the acronym spelt out ("NCSC = National Cyber Security Centre"), or a
   second blank. */
/* Exam advice says how to answer, not what the term is: "Link ___ to GDPR",
   "Use the term "___"", "___ is a key cloud benefit in any suitability
   question". Its blank could be almost any term, so it is never a gap. */
const ADVICE_START = /^(?:always\s+)?(?:link|match|use the term|describe|mention|remember|explain|state|say)\b/i;
const ADVICE_WORDS = /\b(?:exam|examiner|question|questions|marks?)\b/i;
function isLowInfoGap(text) {
  return ADVICE_START.test(text.trim()) || /["“‘']___["”’']/.test(text) || ADVICE_WORDS.test(text);
}

function gapCandidates(item) {
  const pool = [...(item.keyFacts || []), item.examTip].filter(Boolean).map(String).filter(s => s.length <= 240);
  const names = acceptedAnswers(item).sort((a, b) => b.length - a.length);
  const out = [];
  pool.forEach(s => {
    const hits = [];
    let text = s;
    names.forEach(p => { text = text.replace(nameRegex(p, true), m => { hits.push(m); return '___'; }); });
    if (hits.length !== 1) return;
    const rest = text.replace('___', ' ');
    if (names.some(n => nameRegex(n, false, 'i').test(rest))) return;
    const { answer, accepts } = gapAnswer(item, hits[0]);
    if (acronymNames(item).some(a => expansionRanges(rest, a).length)) return;
    const derived = derivedAcronyms(names);
    if ((rest.match(/[A-Za-z0-9]+/g) || []).some(t => isAcronymToken(t) && derived.has(acronymKey(t)))) return;
    // The answer's own word elsewhere, even inside another word ("antivirus").
    if (wordStems(hits[0], GENERIC_WORDS).some(st => stemRegex(st).test(rest)
      || (st.w.length >= 4 && rest.toLowerCase().includes(st.w.toLowerCase())))) return;
    if (!promptHasContent(text) || isLowInfoGap(text)) return;
    out.push({ text, answer, accepts });
  });
  return out;
}

/* A typed question: fill the gap, or type the term from its definition.
   preferGap: true = a gap when there is one, false = the definition,
   undefined = either. null when neither prompt is fair. */
function typedQuestion(item, preferGap) {
  const gaps = gapCandidates(item);
  const def = maskTerm(item.definition, item);
  const defOk = promptHasContent(def);
  const why = itemWhy(item);
  const useGap = gaps.length > 0 && (preferGap === true || !defOk || (preferGap === undefined && Math.random() < 0.5));
  if (useGap) {
    const g = pickOne(gaps);
    return {
      kind: 'gap', label: 'Fill the gap',
      prompt: `Type the missing term.<span class="lq-quote">${roundEscape(g.text)}</span>`,
      code: item.code, answer: g.answer, accepts: g.accepts, why
    };
  }
  if (!defOk) return null;
  return {
    kind: 'type', label: 'Type the term',
    prompt: `Which term matches this description?<span class="lq-quote">${roundEscape(def)}</span>`,
    code: item.code, answer: item.term, accepts: acceptedAnswers(item), why
  };
}

function flipQuestion(item) {
  return {
    kind: 'flip', code: item.code, label: 'Flashcard', answer: item.term,
    prompt: roundEscape(item.term), front: item.term, back: item.definition, why: itemWhy(item)
  };
}

/* "Router: <definition>": true, or the definition of a neighbouring term that
   is plainly not about this one (see tfClash). No safe partner, no question. */
function tfQuestion(item, node) {
  if (!item || !item.definition || isOverview(item)) return null;
  const mine = maskTerm(item.definition, item);
  if (!promptHasContent(mine)) return null;
  let partner = null;
  for (const list of nearbyItems(node)) {
    const others = list.filter(it => it && it.code !== item.code && it.definition && it.definition !== item.definition
      && normAnswer(it.term) !== normAnswer(item.term) && !tfClash(item, it)
      && promptHasContent(maskTerm(it.definition, it)));
    if (others.length) { partner = pickOne(others); break; }
  }
  if (!partner) return null;
  const truth = Math.random() < 0.5;
  const def = truth ? mine : maskTerm(maskTerm(partner.definition, partner), item);
  return {
    kind: 'tf', code: item.code, label: 'True or false',
    prompt: `Does this describe <strong>${roundEscape(item.term)}</strong>?<span class="lq-quote">${roundEscape(def)}</span>`,
    answer: truth,
    why: truth ? `${item.term}: ${firstSentence(item.definition)}` : `That describes ${partner.term}. ${item.term}: ${firstSentence(item.definition)}`
  };
}

/* "Which of these are examples of X?" for terms with three or more examples
   that do not name X. Wrong picks are examples of nearby terms (subtopic,
   then topic) that do not overlap X (see relatedItems) and that X's own
   notes do not mention. */
function multiQuestion(item, node) {
  if (!item || isOverview(item)) return null;
  const right = exampleParts(item, { forPrompt: true });
  if (right.length < 3) return null;
  const answers = right.slice(0, 4);
  const rightKeys = exampleParts(item).map(normAnswer).filter(Boolean);
  const taken = new Set(rightKeys);
  // "A school using Microsoft 365" is not a wrong pick when "Microsoft 365" is right.
  const overlaps = k => rightKeys.some(r => k.includes(r) || r.includes(k));
  const mine = itemText(item);
  const wrong = [];
  for (const list of nearbyItems(node).slice(0, 2)) {
    shuffled(list.filter(it => it && it.code !== item.code && !isOverview(it) && !relatedItems(item, it))).forEach(it => {
      exampleParts(it).forEach(p => {
        const k = normAnswer(p);
        if (wrong.length < 3 && k && !taken.has(k) && !overlaps(k) && maskTerm(p, item) === p
          && !nameRegex(p, false, 'i').test(mine)) { taken.add(k); wrong.push(p); }
      });
    });
    if (wrong.length >= 3) break;
  }
  if (wrong.length < 2) return null;
  return {
    kind: 'multi', code: item.code, label: 'Select all',
    prompt: `Which of these are examples of <strong>${roundEscape(item.term)}</strong>? Pick every one that fits.`,
    answers, answer: answers.join('; '), options: shuffled([...answers, ...wrong]),
    why: `${item.term}: ${firstSentence(item.definition)}`
  };
}

/* The question for one term, by its memory status, the round mode and the
   settings. ctx: { node, bank } (node supplies the distractors). */
function questionFor(item, status, mode, settings, ctx) {
  const s = coerceRoundSettings(settings);
  const c = ctx || {};
  if (s.style === 'flash') return flipQuestion(item);
  const typeable = isTypeable(item);
  const wantTyped = s.style !== 'mcq' && (mode === 'hard' || s.style === 'typing' || status === 'mastered');
  if (wantTyped && typeable) {
    const t = typedQuestion(item);
    if (t) return t;
  }
  const q = mcqQuestion(item, c.node, c.bank, s);
  if (q) {
    if (mode === 'hard') q.noHint = true;
    return q;
  }
  // Too few neighbours for multiple choice.
  const t = typeable && s.style !== 'mcq' ? typedQuestion(item) : null;
  return t || flipQuestion(item);
}

/* ---------- building a round ---------- */

function makeCard(item, status, mode, settings, ctx) {
  return {
    code: item.code, item, status, q: questionFor(item, status, mode, settings, ctx),
    outcome: null, retry: false, hinted: false, attempted: false, done: false,
    tried: [], greyed: [], teach: null
  };
}

/* Codes for a round, in MEMORY.buildRound order, topped up when small. */
function roundCodes({ node, nodes, memory, todayStr, mode, max }) {
  const all = nodes.flatMap(n => n.items.map(it => it.code));
  if (mode === 'review') {
    return all.filter(c => RMEM.status(memory[c], todayStr) === 'forgotten').slice(0, max);
  }
  const idx = nodes.findIndex(n => n.id === node.id);
  const earlierCodes = nodes.slice(0, Math.max(0, idx)).flatMap(n => n.items.map(it => it.code));
  const codes = RMEM.buildRound({ nodeCodes: node.items.map(it => it.code), earlierCodes, memory, todayStr, max });
  // A one- or two-term step would ask "the thing you just read". Borrow
  // earlier mastered terms, weakest first, as the old lessons did.
  if (codes.length < MIN_ROUND) {
    const have = new Set(codes);
    earlierCodes
      .filter(c => !have.has(c) && RMEM.status(memory[c], todayStr) === 'mastered')
      .sort((a, b) => (memory[a].s - memory[b].s) || String(memory[a].due).localeCompare(String(memory[b].due)))
      .slice(0, Math.min(MIN_ROUND, max) - codes.length)
      .forEach(c => codes.push(c));
  }
  return codes;
}

/* Cards in order: known terms first, then each batch of new terms (taught on
   the batch's first card), then the rest. A known card is moved between the
   first teach batch and its questions, so the first question is not simply
   what was just read. */
function orderCards(cards) {
  const firstNew = cards.findIndex(c => c.status === 'new');
  if (firstNew < 0) return cards;
  const before = cards.slice(0, firstNew);
  const fresh = cards.filter(c => c.status === 'new');
  const after = cards.slice(firstNew).filter(c => c.status !== 'new');
  const batches = [];
  for (let i = 0; i < fresh.length; i += TEACH_BATCH) batches.push(fresh.slice(i, i + TEACH_BATCH));
  // A lone term at the end would be asked straight after it was taught.
  if (batches.length > 1 && batches[batches.length - 1].length === 1) batches[batches.length - 2].push(...batches.pop());

  const out = before.slice();
  batches.forEach((batch, bi) => {
    const items = batch.map(c => c.item);
    let qs = shuffled(batch);
    const lastTaught = items[items.length - 1].code;
    if (qs.length > 1 && qs[0].code === lastTaught) qs.push(qs.shift());
    // The spacer comes from after the new terms, else (a lone new term with
    // nothing after it) from the known cards before them.
    if (bi === 0 && after.length) qs.unshift(after.shift());
    else if (bi === 0 && qs.length === 1 && out.length) qs.unshift(out.pop());
    qs[0].teach = items;
    out.push(...qs);
  });
  return out.concat(after);
}

/* One true/false and one multi-select, in place of a multiple-choice card. */
function mixInFormats(cards, mode, settings) {
  if (settings.style !== 'mixed' || mode === 'hard') return;
  const pool = shuffled(cards.filter(c => c.q && c.q.kind === 'mcq'));
  const known = pool.filter(c => c.status !== 'new');
  let tfCard = null;
  for (const c of [...known, ...pool]) {
    const q = tfQuestion(c.item, c.node);
    if (q) { c.q = q; tfCard = c; break; }
  }
  // Known terms first for both, so a just-taught term is not the one asked
  // as true/false or select-all when another card can take it.
  for (const c of [...known, ...pool]) {
    if (c === tfCard || exampleParts(c.item).length < 3) continue;
    const q = multiQuestion(c.item, c.node);
    if (q) { c.q = q; break; }
  }
}

/* opts: { node, nodes, memory, todayStr, mode, settings, bank, max, cards }
   `cards` skips building (tests use it for a hand-made round). */
function makeRound(opts) {
  const o = Object.assign({ mode: 'memorize', bank: {}, max: ROUND_MAX }, opts);
  const settings = coerceRoundSettings(o.settings);
  const nodeOf = {};
  o.nodes.forEach(n => n.items.forEach(it => { nodeOf[it.code] = { item: it, node: n }; }));
  let cards = o.cards;
  if (!cards) {
    const codes = roundCodes(o);
    cards = codes.filter(c => nodeOf[c]).map(code => {
      const { item, node } = nodeOf[code];
      const card = makeCard(item, RMEM.status(o.memory[code], o.todayStr), o.mode, settings, { node, bank: o.bank });
      card.node = node;
      return card;
    });
    mixInFormats(cards, o.mode, settings);
    cards = orderCards(cards);
  }
  const ringCodes = o.node ? o.node.items.map(it => it.code) : cards.map(c => c.code);
  return {
    nodeId: o.node ? o.node.id : null, mode: o.mode, settings,
    cards, pos: 0, xp: 0, coins: 0, run: 0,
    startRing: RMEM.ringPercent(ringCodes, o.memory)
  };
}

/* ---------- answering ----------
   Each function mutates `round` and returns what happened, so the screen
   only has to draw it. ctx: { recordTermResult, recordHinted, gainXP, settings }.
   gainXP(n) banks each card's XP as it is earned; round.xp is the running
   total for display only.  */

function currentRoundCard(r) { return r ? r.cards[r.pos] || null : null; }

/* { right, close } for a response: an option (mcq), typed text (type/gap),
   a boolean (tf, or flip's "I knew it"), or an array of options (multi). */
function checkResponse(q, response, settings) {
  const s = coerceRoundSettings(settings);
  switch (q.kind) {
    case 'type':
    case 'gap': {
      const res = checkTyped(response == null ? '' : response, q.accepts);
      return { right: res === 'exact' || (res === 'close' && s.spelling), close: res === 'close' };
    }
    case 'tf':
    case 'flip':
      return { right: response === (q.kind === 'flip' ? true : q.answer), close: false };
    case 'multi': {
      const picked = new Set(Array.isArray(response) ? response : []);
      const right = picked.size === q.answers.length && q.answers.every(a => picked.has(a));
      return { right, close: false };
    }
    default:
      return { right: response === q.answer, close: false };
  }
}

/* The question a Retry copy asks. Options come in a new order, so the place of
   the right one can't be remembered. A true/false was answered (and its answer
   shown) on the first copy, so the Retry asks it as multiple choice where the
   node has enough neighbours. */
function retryQuestion(card, settings) {
  const q = card.q;
  if (!q) return q;
  if (q.kind === 'tf') {
    const s = Object.assign(coerceRoundSettings(settings), { hideOptions: false });
    return (card.node && card.item && mcqQuestion(card.item, card.node, {}, s)) || q;
  }
  if (Array.isArray(q.options)) return Object.assign({}, q, { options: shuffled(q.options) });
  return q;
}

/* Wrong (or revealed): record it once, reset the run, send a Retry copy to the end.
   The memory record and run from before are kept (prevMem, prevRun) so
   "I was right" can undo it. */
function markWrong(r, card, ctx, ev) {
  const typed = card.q && (card.q.kind === 'type' || card.q.kind === 'gap');
  card.outcome = 'wrong';
  if (typed) card.prevRun = r.run;
  r.run = 0;
  if (!card.retry && ctx && ctx.recordTermResult) {
    // Kept only when it can be read back: without getMemory, "I was right"
    // would restore "no record" over the real one, so it is not offered.
    if (typed && ctx.getMemory) {
      const rec = ctx.getMemory(card.code);
      card.prevMem = rec ? JSON.parse(JSON.stringify(rec)) : null;
    }
    ev.days = ctx.recordTermResult(card.code, false);
  }
  const copy = Object.assign({}, card, {
    q: retryQuestion(card, r.settings), retry: true, outcome: null, hinted: false, attempted: false, done: false,
    tried: [], greyed: [], teach: null, retryCopy: null
  });
  delete copy.prevMem;
  delete copy.prevRun;
  card.retryCopy = copy;
  r.cards.push(copy);
  ev.requeued = true;
}

function answerCard(r, response, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done) return null;
  const c = ctx || {};
  const { right, close } = checkResponse(card.q, response, c.settings || r.settings);
  const first = !card.attempted;
  card.attempted = true;
  const ev = { right, close, first, xp: 0, days: null, requeued: false, hinted: card.hinted, answer: card.q.answer };

  if (right) {
    card.done = true;
    if (first && card.retry) {
      card.outcome = 'retry';
      r.run++;
    } else if (first && card.hinted) {
      card.outcome = 'right';
      if (c.recordHinted) c.recordHinted(card.code);
    } else if (first) {
      card.outcome = 'right';
      if (c.recordTermResult) ev.days = c.recordTermResult(card.code, true);
      ev.xp = Math.round(ROUND_XP * RMEM.combo(r.run));
      r.xp += ev.xp;
      // Banked now, so closing the round halfway keeps it.
      if (c.gainXP && ev.xp) c.gainXP(ev.xp);
      r.run++;
    }
  } else {
    if (response != null && !Array.isArray(response) && card.q.options) card.tried.push(response);
    // Select-all: the wrong picks grey out; the right ones stay picked.
    if (Array.isArray(response) && card.q.kind === 'multi') {
      response.filter(o => !card.q.answers.includes(o) && !card.tried.includes(o)).forEach(o => card.tried.push(o));
    }
    if (first) markWrong(r, card, c, ev);
    // Two-way questions can't be tried again on the same card.
    if (card.q.kind === 'tf' || card.q.kind === 'flip') card.done = true;
  }
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* "I was right" on a typed or gap card marked wrong first time: undo the
   wrong result in memory (restore the record from before, then record a
   right answer), bank the usual XP at the combo from before the miss, drop
   the Retry copy and count the card right first time. Once per card; not
   after a hint, Reveal or Explain, nor on a Retry copy.
   ctx: { restoreMemory(code, rec|null), recordTermResult, gainXP }.
   Returns { right, overridden, xp, days, combo, ... } or null. */
function canOverride(card) {
  return !!card && !!card.q && (card.q.kind === 'type' || card.q.kind === 'gap')
    && card.outcome === 'wrong' && card.attempted && !card.retry && !card.overridden
    && !card.hinted && !card.revealed && !card.explained && 'prevMem' in card;
}

function overrideRight(r, card, ctx) {
  if (!r || !canOverride(card)) return null;
  const c = ctx || {};
  if (c.restoreMemory) c.restoreMemory(card.code, card.prevMem);
  const ev = { right: true, overridden: true, close: false, first: true, xp: 0, days: null, requeued: false, answer: card.q.answer };
  if (c.recordTermResult) ev.days = c.recordTermResult(card.code, true);
  const run = card.prevRun || 0;
  ev.xp = Math.round(ROUND_XP * RMEM.combo(run));
  r.xp += ev.xp;
  if (c.gainXP && ev.xp) c.gainXP(ev.xp);
  r.run = run + 1;
  const i = r.cards.indexOf(card.retryCopy);
  if (i > r.pos) r.cards.splice(i, 1);
  card.retryCopy = null;
  card.outcome = 'right';
  card.overridden = true;
  card.done = true;
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* Grey out one wrong option (never the last one), or for typed cards give the
   first letters. Marks the card hinted: a hinted right answer earns no XP. */
function hintCard(r) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done || card.q.noHint) return null;
  const q = card.q;
  if (q.kind === 'type' || q.kind === 'gap') {
    card.hinted = true;
    return { hint: typeHint(q.answer, q.accepts) };
  }
  if (q.kind !== 'mcq' && q.kind !== 'multi') return null;
  const isRight = o => (q.kind === 'multi' ? q.answers.includes(o) : o === q.answer);
  const wrong = q.options.filter(o => !isRight(o) && !card.greyed.includes(o) && !card.tried.includes(o));
  if (wrong.length < 2) return null;
  const pick = wrong[Math.floor(Math.random() * wrong.length)];
  card.greyed.push(pick);
  card.hinted = true;
  return { greyed: pick };
}

/* Show the answer: counts as wrong. */
function revealCard(r, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done) return null;
  const ev = { right: false, first: !card.attempted, xp: 0, days: null, requeued: false, answer: card.q.answer };
  if (!card.attempted) { card.attempted = true; markWrong(r, card, ctx, ev); }
  card.revealed = true;
  card.done = true;
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* Open the notes. Before answering this counts as wrong (the card comes back
   as Retry) but the card can still be answered; afterwards it is free. */
function explainCard(r, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q) return null;
  const ev = { counted: false, xp: 0, days: null, requeued: false, item: card.item };
  if (!card.attempted && !card.done) {
    card.attempted = true;
    markWrong(r, card, ctx, ev);
    ev.counted = true;
  }
  card.explained = true;
  return ev;
}

/* Simpler (the short flashcard wording) asked for before answering counts as
   a hint: a right answer then earns no XP. */
function simplerCard(r) {
  const card = currentRoundCard(r);
  if (!card || card.done || card.attempted) return false;
  card.hinted = true;
  return true;
}

/* New settings mid-round: spelling counts from the next answer, and "hide
   options" applies to multiple-choice cards not yet tried. */
function setRoundSettings(r, settings) {
  if (!r) return;
  r.settings = coerceRoundSettings(settings);
  r.cards.slice(r.pos).forEach(c => { if (c.q && c.q.kind === 'mcq' && !c.attempted) c.q.hidden = r.settings.hideOptions; });
}

/* Move on; returns the next card, or null at the end of the round. */
function nextCard(r) {
  if (!r) return null;
  r.pos = Math.min(r.pos + 1, r.cards.length);
  return currentRoundCard(r);
}

function roundFinished(r) { return !!r && r.pos >= r.cards.length; }

/* ---------- end of round ----------
   Pure helpers for the screens after the last card. */

/* Did the round move the streak? before/after are { last, count } copies of
   state.streak taken at the start and at the end. */
function streakMoved(before, after) {
  return !!before && !!after && (before.last !== after.last || before.count !== after.count);
}

/* The week containing todayStr, Sunday to Saturday:
   [{ date, label, done (studied that day, from state.activity), today }]. */
function streakWeek(todayStr, activity) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const start = new Date(y, m - 1, d - new Date(y, m - 1, d).getDay());
  const pad = n => String(n).padStart(2, '0');
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label, i) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    return { date, label, done: !!(activity && activity[date] > 0), today: date === todayStr };
  });
}

/* Round Complete's list: one row per term, in the order met. Retry copies
   fold into their card: 'right' first time, 'retry' (right on a retry) or
   'missed'. */
function answeredRows(cards) {
  const out = [];
  const seen = new Map();
  (cards || []).forEach(c => {
    if (!c.retry && !seen.has(c.code)) {
      const row = { card: c, result: c.outcome === 'right' ? 'right' : 'missed' };
      seen.set(c.code, row);
      out.push(row);
    } else if (c.retry && c.outcome === 'retry' && seen.has(c.code) && seen.get(c.code).result === 'missed') {
      seen.get(c.code).result = 'retry';
    }
  });
  return out;
}

/* The rival passed this round: placed above you in the league table when the
   round started and below you now. With several, the one highest on the table
   now. Rows are LEAGUE.standings rows ({ name, place, me, xp }). With XP in
   the rows, the XP you gained must cover the rival's lead from the start, so
   the table moving on its own (rivals earn XP through the day) never counts
   as you overtaking anyone. */
function overtakenRival(beforeRows, afterRows) {
  if (!beforeRows || !afterRows) return null;
  const meB = beforeRows.find(r => r.me), meA = afterRows.find(r => r.me);
  if (!meB || !meA || meA.place >= meB.place) return null;
  const hasXP = [meB, meA].every(r => typeof r.xp === 'number');
  const gain = hasXP ? meA.xp - meB.xp : 0;
  if (hasXP && gain <= 0) return null;
  const lead = name => {
    const b = beforeRows.find(r => r.name === name);
    return b && typeof b.xp === 'number' ? b.xp - meB.xp : 0;
  };
  const above = new Set(beforeRows.filter(r => !r.me && r.place < meB.place && (!hasXP || lead(r.name) < gain)).map(r => r.name));
  const passed = afterRows.filter(r => !r.me && r.place > meA.place && above.has(r.name))
    .sort((a, b) => a.place - b.place);
  return passed[0] || null;
}

/* ---------- browser hooks ----------
   startRound builds the global `round`; round-view.js draws it and calls the
   engine functions above with roundContext().                              */

let round = null;

function roundContext() {
  return {
    recordTermResult, recordHinted,
    getMemory: code => state.memory[code] || null,
    restoreMemory: restoreTermMemory,
    gainXP: n => awardXP(n, true),   // league XP, activity and save; no toast per card
    settings: round ? round.settings : loadRoundSettings()
  };
}

/* The settings one round runs with: the saved ones, with this round's style
   swapped in when opts.styleOverride names a valid style (the Study dialog's
   Flashcards). Never writes the saved settings. */
function roundSettingsFor(opts, storage) {
  const saved = loadRoundSettings(storage);
  const o = opts && opts.styleOverride;
  return ROUND_STYLES.includes(o) ? Object.assign({}, saved, { style: o }) : saved;
}

function startRound(nodeId, mode, opts) {
  const m = mode || 'memorize';
  const nodes = pathNodes();
  const node = nodes.find(n => n.id === nodeId) || null;
  if (!node && m !== 'review') return null;
  round = makeRound({
    node, nodes, memory: state.memory, todayStr: today(), mode: m,
    settings: roundSettingsFor(opts), bank: lessonBank()
  });
  return round;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEACH_BATCH, TYPE_MAX_LEN, ROUND_MAX, ROUND_XP, MIN_ROUND, ROUND_SETTINGS_KEY,
    isLessonItem, termParts, acceptedAnswers, normAnswer, editDistance, checkTyped, isTypeable,
    maskTerm, typeHint, shuffled, distractorTerms, firstSentence, questionsForItem,
    isRecapItem, isAbbrevOf, exampleParts, gapCandidates, typedQuestion, mcqQuestion, tfClash, relatedItems,
    defaultRoundSettings, coerceRoundSettings, loadRoundSettings, saveRoundSettings, roundSettingsFor,
    questionFor, tfQuestion, multiQuestion, makeCard, makeRound, checkResponse,
    currentRoundCard, answerCard, canOverride, overrideRight, hintCard, revealCard, explainCard, nextCard, roundFinished,
    simplerCard, setRoundSettings, retryQuestion, answeredRows, streakMoved, streakWeek, overtakenRival
  };
}
