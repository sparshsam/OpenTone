import { type Track, type View } from "@/types/music";
import TrackList from "./TrackList";
import TrackListHeader from "./TrackListHeader";

interface LibraryViewProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  onImport: () => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  view: View;
  isScanning: boolean;
}

export default function LibraryView({
  tracks,
  onPlay,
  onImport,
  currentTrackId,
  isPlaying,
  searchQuery,
  onSearchChange,
  view,
  isScanning,
}: LibraryViewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <TrackListHeader
        trackCount={tracks.length}
        onImport={onImport}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        view={view}
        isScanning={isScanning}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tracks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-raised">
              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="#1c1917"/>
                <circle cx="32" cy="34" r="12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="32" cy="34" r="4" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">Your music library is empty</h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Import a folder of music files to get started. OpenTone supports MP3, FLAC, WAV, AAC, M4A, and OGG.
              </p>
            </div>
            <button
              onClick={onImport}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Import music folder
            </button>
            <p className="mt-4 text-[11px] text-muted/50">
              OpenTone does not provide music. You are importing your own legally obtained files.
            </p>
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            onPlay={onPlay}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}
