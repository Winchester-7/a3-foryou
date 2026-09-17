export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-[var(--header-h)]">
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/20" />
        <span className="relative inline-flex h-10 w-10 rounded-full border border-line" />
      </span>
    </div>
  );
}
