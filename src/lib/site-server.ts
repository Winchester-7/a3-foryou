/**
 * Current site settings (server side): defaults + whatever was saved in the admin panel.
 * @author Erbol king
 */
import { mergeSite, type SiteInfo, type SiteSettings } from './site';
import { readData } from './store';

const memo = new WeakMap<object, SiteInfo>();

export function getSite(): SiteInfo {
  const raw = readData<SiteSettings>('settings') ?? {};
  let info = memo.get(raw);
  if (!info) {
    info = mergeSite(raw);
    memo.set(raw, info);
  }
  return info;
}
