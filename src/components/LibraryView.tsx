import { useState, useMemo } from "react";
import { type Track } from "@/types/music";
import TrackList from "./TrackList";
import TrackListHeader from "./TrackListHeader";

interface LibraryViewProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  onImport: () => void;
  onRescan: () => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isScanning: boolean;
  isLoading: boolean;
  onToggleFavorite: (trackId: string) => void;
  hasLibraryPath: boolean;
  importError: string | null;
}

export default function LibraryView({
  tracks,
  onPlay,
  onImport,
  onRescan,
  currentTrackId,
  isPlaying,
  searchQuery,
  onSearchChange,
  isScanning,
  isLoading,
  onToggleFavorite,
  hasLibraryPath,
  importError,
}: LibraryViewProps) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const displayedTracks = useMemo(() => {
    if (showFavoritesOnly) {
      return tracks.filter((t) => t.is_favorite);
    }
    return tracks;
  }, [tracks, showFavoritesOnly]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <TrackListHeader
          trackCount={0}
          onImport={onImport}
          onRescan={onRescan}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isScanning={false}
          hasLibraryPath={hasLibraryPath}
        />
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading library…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TrackListHeader
        trackCount={displayedTracks.length}
        onImport={onImport}
        onRescan={onRescan}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isScanning={isScanning}
        hasLibraryPath={hasLibraryPath}
      >
        <button type="button" onClick={() => setShowFavoritesOnly((p) => !p)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            showFavoritesOnly
              ? "bg-accent text-white"
              : "bg-surface-hover text-muted hover:text-text"
          }`}
          title="Show favorites only"
        >
          ★ Favorites
        </button>
      </TrackListHeader>

      {importError && (
        <div className="mx-4 mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {importError}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {displayedTracks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-raised">
              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="#1c1917" />
                <circle cx="32" cy="34" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="32" cy="34" r="4" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">
                {showFavoritesOnly
                  ? "No favorite tracks yet"
                  : "Your music library is empty"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {showFavoritesOnly
                  ? "Star tracks to add them to your favorites."
                  : "Import a folder of music files to get started. OpenTone supports MP3, FLAC, WAV, AAC, M4A, and OGG."}
              </p>
            </div>
            {!showFavoritesOnly && (
              <button type="button" onClick={onImport}
                disabled={isScanning}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {isScanning ? "Importing…" : "Import music folder"}
              </button>
            )}
            <p className="mt-4 text-[11px] text-muted/50">
              OpenTone does not provide music. You are importing your own legally obtained files.
            </p>
          </div>
        ) : (
          <TrackList
            tracks={displayedTracks}
            onPlay={onPlay}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </div>
    </div>
  );
}
