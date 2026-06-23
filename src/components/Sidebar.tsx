import { type View } from "@/types/music";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  trackCount: number;
  albumCount: number;
  artistCount: number;
  playlistCount: number;
}

const navItems: { view: View; label: string; icon: string }[] = [
  { view: "library", label: "Library", icon: "♩" },
  { view: "tracks", label: "Tracks", icon: "♪" },
  { view: "albums", label: "Albums", icon: "♫" },
  { view: "artists", label: "Artists", icon: "♬" },
  { view: "playlists", label: "Playlists", icon: "≡" },
];

export default function Sidebar({
  currentView,
  onNavigate,
  trackCount,
  albumCount,
  artistCount,
  playlistCount,
}: SidebarProps) {
  const countMap: Partial<Record<View, number>> = {
    tracks: trackCount,
    albums: albumCount,
    artists: artistCount,
    playlists: playlistCount,
  };

  return (
   <aside aria-label="Sidebar navigation" className="flex w-56 flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <svg viewBox="0 0 64 64" className="h-6 w-6 text-accent" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="#1c1917" />
          <circle cx="32" cy="34" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="34" r="4" fill="currentColor" />
          <line x1="32" y1="22" x2="32" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="12" x2="38" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="12" x2="26" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold tracking-wide text-text">OpenTone</span>
      </div>

      {/* Navigation */}
     <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
       {navItems.map((item) => {
         const count = countMap[item.view];
         return (
           <button type="button" key={item.view}
             onClick={() => onNavigate(item.view)}
             aria-current={currentView === item.view ? "page" : undefined}
             className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
               currentView === item.view
                 ? "bg-surface-hover text-text"
                 : "text-muted hover:bg-surface-raised hover:text-subtle"
             }`}
           >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className="rounded-md bg-surface-hover px-1.5 py-0.5 text-[11px] tabular-nums text-muted">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Track count + legal note */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-xs text-muted">
          {trackCount > 0
            ? `${trackCount} track${trackCount === 1 ? "" : "s"}`
            : "No tracks imported"}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted/60">
          OpenTone does not provide music.
        </p>
      </div>
    </aside>
  );
}
