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
}

function formatTime(seconds: number): string {
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
}: PlaybackBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    onSeek(pct * duration);
  };

  return (
    <div className="flex h-20 items-center border-t border-border bg-surface px-4">
      {/* Track info */}
      <div className="flex w-72 items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-raised text-lg text-muted">
          ♪
        </div>
        <div className="min-w-0 flex-1">
          {currentTrack ? (
            <>
              <p className="truncate text-sm font-medium text-text">{currentTrack.title}</p>
              <p className="truncate text-xs text-muted">{currentTrack.artist}</p>
            </>
          ) : (
            <p className="text-sm text-muted">No track selected</p>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button onClick={onPrevious} className="text-muted hover:text-text transition-colors" title="Previous">
            ⏮
          </button>
          <button
            onClick={onPlayPause}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-text text-surface hover:bg-subtle transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={onNext} className="text-muted hover:text-text transition-colors" title="Next">
            ⏭
          </button>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <span className="w-10 text-right text-xs tabular-nums text-muted">{formatTime(currentTime)}</span>
          <div
            className="relative h-1 flex-1 cursor-pointer rounded-full bg-surface-hover"
            onClick={handleSeek}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-xs tabular-nums text-muted">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Spacer for symmetry */}
      <div className="w-72" />
    </div>
  );
}
