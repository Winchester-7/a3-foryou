/**
 * Every page change: the new page rises into place and comes into focus.
 * (A template, unlike the layout, is re-created on each navigation, so the animation replays.)
 * @author Erbol king
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
