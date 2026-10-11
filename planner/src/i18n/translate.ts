/**
 * Russian -> Kyrgyz phrase translation for the planner UI.
 * Exact matches win; otherwise the longest known phrases are replaced word by
 * word and the text is only changed when most of it could be translated.
 * @author Erbol king
 */
import { ky } from './ky';

const CYR = /[А-Яа-яЁё]/;
const EDGE = /^([«"'(\[]*)(.*?)([»"')\].,;:!?…→←·—–-]*)$/;

const lowerIndex = new Map<string, string>();
for (const [k, v] of Object.entries(ky)) lowerIndex.set(k.toLowerCase(), v);

const lookup = (phrase: string): string | undefined => ky[phrase] ?? lowerIndex.get(phrase.toLowerCase());

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
  const core = input.trim().replace(/ /g, ' ');
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
        const c = slice.filter((w) => CYR.test(w)).length;
        cyrTotal += c;
        cyrDone += c;
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
