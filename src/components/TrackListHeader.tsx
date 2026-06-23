import { type ReactNode } from "react";

interface TrackListHeaderProps {
  trackCount: number;
  onImport: () => void;
  onRescan: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isScanning: boolean;
  hasLibraryPath: boolean;
  children?: ReactNode;
}

export default function TrackListHeader({
  trackCount,
  onImport,
  onRescan,
  searchQuery,
  onSearchChange,
  isScanning,
  hasLibraryPath,
  children,
}: TrackListHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-2">
      <h1 className="text-base font-semibold text-text">Library</h1>
      <span className="text-xs text-muted">
        {trackCount} track{trackCount === 1 ? "" : "s"}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {children}

        {/* Search */}
        <div className="relative">
          <input
            id="library-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="w-48 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs text-text placeholder-muted/50 outline-none transition-colors focus:border-accent"
          />
          {searchQuery && (
       <button type="button" onClick={() => onSearchChange("")}
         aria-label="Clear search"
         className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text"
       >
              ✕
            </button>
          )}
        </div>

        <button type="button" onClick={onImport}
          disabled={isScanning}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {isScanning ? "Importing…" : "Import"}
        </button>

        {hasLibraryPath && (
          <button type="button" onClick={onRescan}
            disabled={isScanning}
            className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-text disabled:opacity-50"
          >
            Rescan
          </button>
        )}
      </div>
    </div>
  );
}
