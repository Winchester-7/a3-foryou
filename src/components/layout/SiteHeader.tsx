/** @author Erbol king */
import { Header } from './Header';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return <Header overlay={overlay} />;
}

