import { type View } from "@/types/music";

interface TrackListHeaderProps {
  trackCount: number;
  onImport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  view: View;
  isScanning: boolean;
}

const viewLabels: Record<View, string> = {
  library: "Library",
  tracks: "Tracks",
  albums: "Albums",
  artists: "Artists",
  settings: "Settings",
};

export default function TrackListHeader({
  trackCount,
  onImport,
  searchQuery,
  onSearchChange,
  view,
  isScanning,
}: TrackListHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-3">
      <div>
        <h1 className="text-base font-semibold text-text">{viewLabels[view]}</h1>
        {trackCount > 0 && (
          <p className="text-xs text-muted">{trackCount} track{trackCount === 1 ? "" : "s"}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search tracks, artists, albums…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-56 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent"
        />

        {/* Import button */}
        <button
          onClick={onImport}
          disabled={isScanning}
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {isScanning ? "Scanning…" : "Import"}
        </button>
      </div>
    </div>
  );
}
