import { useMemo, useState } from "react";
import { type Track, type ArtistInfo } from "@/types/music";

interface ArtistViewProps {
  artists: ArtistInfo[];
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

export default function ArtistView({
  artists,
  tracks,
  onPlayTrack,
}: ArtistViewProps) {
  // Group tracks by artist
  const tracksByArtist = useMemo(() => {
    const map = new Map<string, Track[]>();
    for (const track of tracks) {
      const key = track.artist;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(track);
    }
    return map;
  }, [tracks]);

  // Count albums per artist from the tracks
  const albumCountByArtist = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const track of tracks) {
      if (!map.has(track.artist)) {
        map.set(track.artist, new Set());
      }
      map.get(track.artist)!.add(track.album);
    }
    return map;
  }, [tracks]);

  if (artists.length === 0) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border px-6 py-3">
          <h1 className="text-base font-semibold text-text">Artists</h1>
        </div>
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted">No artists in your library yet.</p>
        </div>
      </div>
    );
  }

  // Sort artists alphabetically
  const sortedArtists = [...artists].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-base font-semibold text-text">Artists</h1>
        <p className="text-xs text-muted">
          {artists.length} artist{artists.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-border/50">
          {sortedArtists.map((artist) => {
            const artistTracks = tracksByArtist.get(artist.name) ?? [];
            const artistAlbumCount =
              albumCountByArtist.get(artist.name)?.size ?? 0;

            return (
              <ArtistRow
                key={artist.id}
                artist={artist}
                tracks={artistTracks}
                albumCount={artistAlbumCount}
                onPlayTrack={onPlayTrack}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ArtistRowProps {
  artist: ArtistInfo;
  tracks: Track[];
  albumCount: number;
  onPlayTrack: (track: Track) => void;
}

function ArtistRow({
  artist,
  tracks,
  albumCount,
  onPlayTrack,
}: ArtistRowProps) {
  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const durationStr = formatDuration(totalDuration);
  const uniqueAlbums = [...new Set(tracks.map((t) => t.album))];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-6">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-surface-raised/50"
      >
        {/* Artist initial */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-medium text-muted">
          {artist.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-text">
            {artist.name}
          </h3>
          <p className="text-xs text-muted">
            {albumCount} album{albumCount === 1 ? "" : "s"} &middot;{" "}
            {tracks.length} track{tracks.length === 1 ? "" : "s"} &middot;{" "}
            {durationStr}
          </p>
        </div>
        <span
          className={`text-xs text-muted transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>

      {/* Expanded track list */}
      {expanded && (
        <div className="pb-3 pl-14">
          {uniqueAlbums.map((albumName) => {
            const albumTracks = tracks.filter((t) => t.album === albumName);
            return (
              <div key={albumName} className="mb-3">
                <h4 className="mb-1 text-xs font-medium text-muted">
                  {albumName || "Unknown Album"}
                </h4>
                <div className="space-y-0.5">
                  {albumTracks
                    .sort((a, b) => a.track_number - b.track_number)
                    .map((track) => (
                      <button
                        key={track.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTrack(track);
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-muted transition-colors hover:bg-surface-hover hover:text-text"
                      >
                        <span className="w-6 text-right text-[11px] text-muted/50 tabular-nums">
                          {track.track_number}
                        </span>
                        <span className="flex-1 truncate">{track.title}</span>
                        <span className="text-xs tabular-nums text-muted/60">
                          {formatTrackDuration(track.duration)}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTrackDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
