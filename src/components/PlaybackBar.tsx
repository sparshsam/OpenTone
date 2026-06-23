import { type Track } from "@/types/music";

interface PlaybackBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  artworkUri: string | null;
  queueLength: number;
  queueIndex: number;
  playbackError: string | null;
}

function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlaybackBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  artworkUri,
  queueLength,
  queueIndex,
  playbackError,
}: PlaybackBarProps) {
  const hasTrack = currentTrack !== null;
  const canPrevious = hasTrack && queueLength > 0;
  const canNext = hasTrack && queueLength > 0;
  const progress = duration > 0 ? (Math.min(currentTime, duration) / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasTrack || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div className={`flex h-20 items-center border-t border-border bg-surface px-4 ${
      !hasTrack ? "opacity-60" : ""
    }`}>
      {playbackError && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-b-lg bg-red-500/90 px-4 py-1.5 text-xs text-white shadow-lg">
          {playbackError}
        </div>
      )}
      {/* Track info with artwork */}
      <div className="flex w-72 items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-raised">
          {artworkUri ? (
            <img
              src={artworkUri}
              alt="Album artwork"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg text-muted">♪</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {currentTrack ? (
            <>
              <p className="truncate text-sm font-medium text-text">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-muted">
                {currentTrack.artist}
                {currentTrack.album ? ` — ${currentTrack.album}` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted/60">No track selected</p>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
         <button type="button" onClick={onPrevious}
           disabled={!canPrevious}
           aria-label="Previous track"
           className={`transition-colors ${
             canPrevious ? "text-muted hover:text-text" : "text-muted/20 cursor-not-allowed"
           }`}
            title="Previous"
          >
            ⏮
          </button>
         <button type="button" onClick={onPlayPause}
           disabled={!hasTrack}
           aria-label={hasTrack ? (isPlaying ? "Pause" : "Play") : "No track"}
           className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
             hasTrack
               ? "bg-text text-surface hover:bg-subtle"
               : "bg-surface-hover text-muted/30 cursor-not-allowed"
           }`}
            title={hasTrack ? (isPlaying ? "Pause" : "Play") : "No track"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
         <button type="button" onClick={onNext}
           disabled={!canNext}
           aria-label="Next track"
           className={`transition-colors ${
             canNext ? "text-muted hover:text-text" : "text-muted/20 cursor-not-allowed"
           }`}
            title="Next"
          >
            ⏭
          </button>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <span className="w-10 text-right text-xs tabular-nums text-muted">
            {formatTime(currentTime)}
          </span>
         <div
           className={`relative h-1 flex-1 rounded-full ${
             hasTrack ? "cursor-pointer bg-surface-hover" : "bg-surface-hover"
           }`}
           role="slider"
           aria-label="Seek"
           aria-valuemin={0}
           aria-valuemax={duration}
           aria-valuenow={currentTime}
           tabIndex={hasTrack ? 0 : -1}
           onClick={handleSeek}
         >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-xs tabular-nums text-muted">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right side — queue position + favorite */}
      <div className="flex w-72 items-center justify-end gap-3">
        {currentTrack && (
          <>
            {queueLength > 1 && (
              <span className="text-xs text-muted/50 tabular-nums">
                {queueIndex + 1} / {queueLength}
              </span>
            )}
            <span
              className={`text-sm transition-colors ${
                currentTrack.is_favorite ? "text-accent" : "text-muted/30"
              }`}
              title={currentTrack.is_favorite ? "Favorite" : ""}
            >
              {currentTrack.is_favorite ? "★" : "☆"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
