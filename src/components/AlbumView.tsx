import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type Track, type AlbumInfo } from "@/types/music";

interface AlbumViewProps {
  albums: AlbumInfo[];
  tracks: Track[];
  onPlayAlbum: (tracks: Track[], startIndex: number) => void;
  currentTrackId: string | null;
}

interface AlbumCardProps {
  album: AlbumInfo;
  tracks: Track[];
  onPlay: (tracks: Track[], startIndex: number) => void;
  isCurrentAlbum: boolean;
  artworkUri: string | null;
}

function AlbumCard({
  album,
  tracks,
  onPlay,
  isCurrentAlbum,
  artworkUri,
}: AlbumCardProps) {
  const durationStr = formatDuration(album.duration);

  return (
     <button type="button"
       className={`group rounded-lg border p-3 text-left transition-colors hover:bg-surface-raised ${
         isCurrentAlbum
           ? "border-accent bg-surface-raised"
           : "border-border bg-surface"
       }`}
       aria-label={`Play album ${album.title} by ${album.artist}`}
       onClick={() => onPlay(tracks, 0)}
     >
      {/* Artwork */}
      <div className="mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-surface-hover">
        {artworkUri ? (
          <img
            src={artworkUri}
            alt={`${album.title} cover`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted">
            <span className="text-2xl">♫</span>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute flex h-full w-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg">
            ▶
          </div>
        </div>
      </div>

      {/* Album info */}
      <h3 className="truncate text-sm font-medium text-text">{album.title}</h3>
      <p className="truncate text-xs text-muted">{album.artist}</p>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted/70">
        <span>{album.year > 0 ? album.year : "—"}</span>
        <span>•</span>
        <span>{album.track_count} tracks</span>
        <span>•</span>
        <span>{durationStr}</span>
    </div>
    </button>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m}m`;
}

export default function AlbumView({
  albums,
  tracks,
  onPlayAlbum,
  currentTrackId,
}: AlbumViewProps) {
  const [artworkCache, setArtworkCache] = useState<Record<string, string>>({});

  // Group tracks by album for quick lookup
  const tracksByAlbum = useMemo(() => {
    const map = new Map<string, Track[]>();
    for (const track of tracks) {
      const key = track.album;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(track);
    }
    // Sort tracks within each album by disc + track number
    for (const [, albumTracks] of map) {
      albumTracks.sort((a, b) => {
        if (a.disc_number !== b.disc_number) {
          return a.disc_number - b.disc_number;
        }
        return a.track_number - b.track_number;
      });
    }
    return map;
  }, [tracks]);

  // Load artwork for albums on mount — parallel with batched state update
  useEffect(() => {
    if (albums.length === 0) return;

    async function loadArtwork() {
      const uncached = albums.filter(
        (a) => a.has_artwork && !artworkCache[a.id]
      );
      if (uncached.length === 0) return;

      // Fire all artwork requests in parallel, then batch-update state once
      const results = await Promise.all(
        uncached.map(async (album) => {
          const albumTracks = tracksByAlbum.get(album.title);
          const firstTrack = albumTracks?.[0];
          if (!firstTrack) return null;
          try {
            const dataUri = await invoke<string | null>("get_album_artwork", {
              trackId: firstTrack.id,
            });
            return dataUri ? { id: album.id, uri: dataUri } : null;
          } catch {
            return null;
          }
        })
      );

      const batch: Record<string, string> = {};
      for (const r of results) {
        if (r) batch[r.id] = r.uri;
      }
      if (Object.keys(batch).length > 0) {
        setArtworkCache((prev) => ({ ...prev, ...batch }));
      }
    }
    loadArtwork();
  }, [albums, artworkCache, tracksByAlbum]);

  // Find current album from current track
  const currentAlbum = useMemo(() => {
    if (!currentTrackId) return null;
    const track = tracks.find((t) => t.id === currentTrackId);
    return track?.album ?? null;
  }, [currentTrackId, tracks]);

  if (albums.length === 0) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border px-6 py-3">
          <h1 className="text-base font-semibold text-text">Albums</h1>
        </div>
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted">No albums in your library yet.</p>
        </div>
      </div>
    );
  }

  // Sort albums: by year descending, then alphabetically
  const sortedAlbums = [...albums].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-base font-semibold text-text">Albums</h1>
        <p className="text-xs text-muted">
          {albums.length} album{albums.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sortedAlbums.map((album) => {
            const albumTracks = tracksByAlbum.get(album.title) ?? [];
            return (
              <AlbumCard
                key={album.id}
                album={album}
                tracks={albumTracks}
                onPlay={onPlayAlbum}
                isCurrentAlbum={currentAlbum === album.title}
                artworkUri={artworkCache[album.id] ?? null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
