/**
 * Portfolio projects. The list lives in src/data/portfolio.json so it can be
 * edited without touching code (the Telegram bot writes to that file).
 * @author Erbol king
 */
import raw from '@/data/portfolio.json';

export interface PortfolioProject {
  slug: string;
  title: string;
  /** short line under the title, e.g. "Гостиная · 48 м²" */
  subtitle?: string;
  description?: string;
  /** room / object type used for filtering */
  kind: string;
  year?: number;
  /** collection slugs used in the project */
  collections?: string[];
  cover: string;
  gallery: string[];
}

export const portfolio: PortfolioProject[] = raw as PortfolioProject[];

export function getProject(slug: string): PortfolioProject | undefined {
  return portfolio.find((p) => p.slug === slug);
}

export const portfolioKinds: string[] = Array.from(new Set(portfolio.map((p) => p.kind)));
