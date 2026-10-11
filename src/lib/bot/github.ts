/**
 * Minimal GitHub "Contents" API client. The site's editable data lives in the
 * repository as JSON, so a commit is how the bot changes the catalogue —
 * Netlify then redeploys the site automatically.
 * @author Erbol king
 */

const API = 'https://api.github.com';

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) throw new Error('GITHUB_TOKEN / GITHUB_REPO are not configured');
  return { token, repo, branch };
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'a3-foryou-bot',
  };
}

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

export interface RepoFile {
  sha: string;
  text: string;
}

export async function readFile(path: string): Promise<RepoFile | null> {
  const { token, repo, branch } = config();
  const res = await fetch(`${API}/repos/${repo}/contents/${encodePath(path)}?ref=${branch}`, {
    headers: headers(token),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read ${path}: ${res.status}`);
  const json = (await res.json()) as { sha: string; content?: string; download_url?: string };
  // files over 1 MB come back without inline content
  if (json.content) {
    return { sha: json.sha, text: Buffer.from(json.content, 'base64').toString('utf8') };
  }
  const raw = await fetch(json.download_url!, { headers: headers(token), cache: 'no-store' });
  return { sha: json.sha, text: await raw.text() };
}

export async function writeFile(path: string, content: string | Buffer, message: string, sha?: string): Promise<void> {
  const { token, repo, branch } = config();
  const body = {
    message,
    branch,
    sha,
    content: (typeof content === 'string' ? Buffer.from(content, 'utf8') : content).toString('base64'),
  };
  const res = await fetch(`${API}/repos/${repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub write ${path}: ${res.status} ${await res.text()}`);
}

export async function removeFile(path: string, message: string): Promise<void> {
  const { token, repo, branch } = config();
  const existing = await readFile(path);
  if (!existing) return;
  const res = await fetch(`${API}/repos/${repo}/contents/${encodePath(path)}`, {
    method: 'DELETE',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, branch, sha: existing.sha }),
  });
  if (!res.ok) throw new Error(`GitHub delete ${path}: ${res.status}`);
}

export async function readJson<T>(path: string): Promise<T | null> {
  const file = await readFile(path);
  return file ? (JSON.parse(file.text) as T) : null;
}

/** Read a JSON file, let `change` modify it, commit the result. Retries once on a stale sha. */
export async function updateJson<T>(path: string, message: string, change: (data: T) => T | void): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await readFile(path);
    if (!file) throw new Error(`${path} not found in the repository`);
    const data = JSON.parse(file.text) as T;
    const next = (change(data) ?? data) as T;
    try {
      await writeFile(path, JSON.stringify(next, null, 1) + '\n', message, file.sha);
      return next;
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
  throw new Error('unreachable');
}
