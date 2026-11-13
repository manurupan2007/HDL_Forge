export function StatusBanner({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        <span className="text-[11px] font-medium text-fg-muted">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-fg">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}