export function PaneHeader({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-canvas-inset px-3">
      <span className="truncate text-[13px] font-medium text-fg">{title}</span>
      <span className="shrink-0 text-[11px] text-fg-subtle">{meta}</span>
    </div>
  );
}