/**
 * Russian -> Kyrgyz phrase translation used by the language switcher.
 * Exact matches win; otherwise the longest known phrases are replaced word by
 * word, and the text is only changed when most of it could be translated
 * (half-translated sentences look worse than Russian ones).
 * @author Erbol king
 */
import { ky } from './ky';

const CYR = /[А-Яа-яЁё]/;
const EDGE = /^([«"'(\[]*)(.*?)([»"')\].,;:!?…→←·—–-]*)$/;

const lowerIndex = new Map<string, string>();
for (const [k, v] of Object.entries(ky)) lowerIndex.set(k.toLowerCase(), v);

function lookup(phrase: string): string | undefined {
  return ky[phrase] ?? lowerIndex.get(phrase.toLowerCase());
}

/** Keeps a leading capital letter when the dictionary entry is lower-case. */
function matchCase(source: string, target: string): string {
  const first = source[0];
  if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

export function translateToKy(input: string): string {
  const lead = input.match(/^\s*/)![0];
  const trail = input.match(/\s*$/)![0];
  const core = input.trim().replace(/\u00a0/g, ' ');
  if (!core || !CYR.test(core)) return input;

  const exact = lookup(core);
  if (exact) return lead + exact + trail;

  // «Collection names» stay as they are: translate only the text around them
  if (/«[^»]*»/.test(core)) {
    const parts = core.split(/(«[^»]*»)/);
    const joined = parts.map((p) => (p.startsWith('«') ? p : translateToKy(p))).join('');
    return joined === core ? input : lead + joined + trail;
  }

  const words = core.split(/\s+/);
  const out: string[] = [];
  let cyrTotal = 0;
  let cyrDone = 0;

  for (let i = 0; i < words.length; ) {
    let hit = false;
    for (let n = Math.min(8, words.length - i); n >= 1; n--) {
      const slice = words.slice(i, i + n);
      const m = slice.join(' ').match(EDGE);
      if (!m) continue;
      const [, pre, body, post] = m;
      const tr = body ? lookup(body) : undefined;
      if (tr) {
        out.push(`${pre}${matchCase(body, tr)}${post}`);
        cyrTotal += slice.filter((w) => CYR.test(w)).length;
        cyrDone += slice.filter((w) => CYR.test(w)).length;
        i += n;
        hit = true;
        break;
      }
    }
    if (!hit) {
      if (CYR.test(words[i])) cyrTotal += 1;
      out.push(words[i]);
      i += 1;
    }
  }

  if (cyrTotal === 0 || cyrDone / cyrTotal < 0.6) return input;
  return lead + out.join(' ') + trail;
}
