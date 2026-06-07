import { type Track } from "@/types/music";

interface TrackListProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  searchQuery: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TrackList({ tracks, onPlay, currentTrackId, searchQuery }: TrackListProps) {
  const filtered = searchQuery
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.album.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tracks;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted">
          {searchQuery ? "No tracks match your search." : "No tracks yet. Import a folder to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="w-8 px-3 py-2 font-medium">#</th>
            <th className="px-2 py-2 font-medium">Title</th>
            <th className="px-2 py-2 font-medium">Artist</th>
            <th className="px-2 py-2 font-medium">Album</th>
            <th className="w-20 px-2 py-2 font-medium text-right">Duration</th>
            <th className="w-24 px-3 py-2 font-medium text-right">Size</th>
            <th className="w-16 px-2 py-2 font-medium text-center">Format</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((track, i) => (
            <tr
              key={track.id}
              onClick={() => onPlay(track)}
              className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-surface-raised ${
                currentTrackId === track.id ? "bg-surface-raised text-accent" : ""
              }`}
            >
              <td className="px-3 py-2 text-center text-muted">{i + 1}</td>
              <td className="max-w-[280px] truncate px-2 py-2 font-medium">{track.title}</td>
              <td className="max-w-[180px] truncate px-2 py-2 text-muted">{track.artist}</td>
              <td className="max-w-[180px] truncate px-2 py-2 text-muted">{track.album}</td>
              <td className="px-2 py-2 text-right text-muted tabular-nums">{formatDuration(track.duration)}</td>
              <td className="px-3 py-2 text-right text-muted tabular-nums">{formatSize(track.file_size)}</td>
              <td className="px-2 py-2 text-center text-muted">{track.format.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
