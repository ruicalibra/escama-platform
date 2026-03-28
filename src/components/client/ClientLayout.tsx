import { TabBar } from "./TabBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-salt">
      <div className="app-shell">
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        <TabBar />
      </div>
    </div>
  );
}
