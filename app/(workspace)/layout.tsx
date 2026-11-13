export default function WorkspaceLayout({ children }: LayoutProps<"/">) {
  return <div className="flex h-dvh flex-col">{children}</div>;
}