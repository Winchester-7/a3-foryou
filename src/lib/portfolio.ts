/**
 * Portfolio projects — read from the data store (portfolio.json), edited in the admin panel.
 * @author Erbol king
 */
import { readData } from './store';

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

export function getPortfolio(): PortfolioProject[] {
  return readData<PortfolioProject[]>('portfolio');
}

export function getProject(slug: string): PortfolioProject | undefined {
  return getPortfolio().find((p) => p.slug === slug);
}
