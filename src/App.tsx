import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  type Track,
  type AlbumInfo,
  type ArtistInfo,
  type View,
} from "@/types/music";
import Sidebar from "@/components/Sidebar";
import LibraryView from "@/components/LibraryView";
import AlbumView from "@/components/AlbumView";
import ArtistView from "@/components/ArtistView";
import SettingsView from "@/components/SettingsView";
import PlaybackBar from "@/components/PlaybackBar";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("library");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [libraryPath, setLibraryPath] = useState<string | null>(null);
  const [artworkCache, setArtworkCache] = useState<Record<string, string>>({});

  // Playback state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack =
    queueIndex >= 0 && queueIndex < queue.length
      ? queue[queueIndex]!
      : null;

  // Load library data on mount
  useEffect(() => {
    async function loadLibrary() {
      try {
        const [loadedTracks, loadedAlbums, loadedArtists, settings] =
          await Promise.all([
            invoke<Track[]>("get_library"),
            invoke<AlbumInfo[]>("get_albums"),
            invoke<ArtistInfo[]>("get_artists"),
            invoke<Record<string, string>>("get_settings"),
          ]);
        setTracks(loadedTracks);
        setAlbums(loadedAlbums);
        setArtists(loadedArtists);
        if (settings.library_path) {
          setLibraryPath(settings.library_path);
        }
      } catch (err) {
        console.error("Failed to load library:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLibrary();
  }, []);

  // Set up audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setQueueIndex((prev) => {
        const next = prev + 1;
        if (next < queue.length) {
          return next;
        }
        setIsPlaying(false);
        return prev;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load track when queue index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.path;
    if (isPlaying) {
      audio.play().catch(() => {
        console.warn("Playback unavailable — audio backend may not be connected");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueIndex, currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    setQueueIndex((prev) => Math.min(prev + 1, queue.length - 1));
  }, [queue]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setQueueIndex((prev) => Math.max(prev - 1, 0));
  }, [queue]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (currentTrack?.id === track.id) {
        if (isPlaying) return;
        setIsPlaying(true);
        return;
      }

      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
        setIsPlaying(true);
        return;
      }

      setQueue((prev) => [...prev, track]);
      setQueueIndex(queue.length);
      setIsPlaying(true);
    },
    [queue, currentTrack, isPlaying],
  );

  // Load artwork when a track is selected
  useEffect(() => {
    if (!currentTrack || !currentTrack.has_artwork) return;
    const trackId = currentTrack.id;
    if (artworkCache[trackId]) return;

    async function loadArtwork() {
      try {
        const dataUri = await invoke<string | null>(
          "get_album_artwork",
          { trackId },
        );
        if (dataUri) {
          setArtworkCache((prev) => ({
            ...prev,
            [trackId]: dataUri,
          }));
        }
      } catch (err) {
        console.warn("Failed to load artwork:", err);
      }
    }
    loadArtwork();
  }, [currentTrack?.id, currentTrack?.has_artwork, artworkCache]);

  const handleImport = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select music folder",
      });
      if (!selected) return;

      setIsScanning(true);
      try {
        await invoke<Track[]>("scan_folder", { path: selected });
        // Reload library data after scan
        const [newTracks, newAlbums, newArtists] = await Promise.all([
          invoke<Track[]>("get_library"),
          invoke<AlbumInfo[]>("get_albums"),
          invoke<ArtistInfo[]>("get_artists"),
        ]);
        setTracks(newTracks);
        setAlbums(newAlbums);
        setArtists(newArtists);
        setLibraryPath(selected);
      } finally {
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Import failed:", err);
      setIsScanning(false);
    }
  }, []);

  const handleRescan = useCallback(async () => {
    if (!libraryPath) return;
    setIsScanning(true);
    try {
      await invoke<Track[]>("rescan_library");
      const [newTracks, newAlbums, newArtists] = await Promise.all([
        invoke<Track[]>("get_library"),
        invoke<AlbumInfo[]>("get_albums"),
        invoke<ArtistInfo[]>("get_artists"),
      ]);
      setTracks(newTracks);
      setAlbums(newAlbums);
      setArtists(newArtists);
    } catch (err) {
      console.error("Rescan failed:", err);
    } finally {
      setIsScanning(false);
    }
  }, [libraryPath]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        // Reload original library
        try {
          const newTracks = await invoke<Track[]>("get_library");
          setTracks(newTracks);
        } catch (err) {
          console.error("Failed to reload library:", err);
        }
        return;
      }
      try {
        const results = await invoke<Track[]>("search_tracks", {
          query: query.trim(),
        });
        setTracks(results);
      } catch (err) {
        console.error("Search failed:", err);
      }
    },
    [],
  );

  const handleToggleFavorite = useCallback(
    async (trackId: string) => {
      try {
        const result = await invoke<boolean>("toggle_favorite", {
          trackId,
        });
        if (result) {
          setTracks((prev) =>
            prev.map((t) =>
              t.id === trackId ? { ...t, is_favorite: !t.is_favorite } : t,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to toggle favorite:", err);
      }
    },
    [],
  );

  const handlePlayAlbum = useCallback(
    (albumTracks: Track[], startIndex: number = 0) => {
      if (albumTracks.length === 0) return;
      setQueue(albumTracks);
      setQueueIndex(startIndex);
      setIsPlaying(true);
    },
    [],
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted">Loading library…</p>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "settings":
        return (
          <SettingsView
            libraryPath={libraryPath}
            tracks={tracks}
            albums={albums}
            artists={artists}
          />
        );
      case "albums":
        return (
          <AlbumView
            albums={albums}
            tracks={tracks}
            onPlayAlbum={handlePlayAlbum}
            currentTrackId={currentTrack?.id ?? null}
          />
        );
      case "artists":
        return (
          <ArtistView
            artists={artists}
            tracks={tracks}
            onPlayTrack={handlePlayTrack}
          />
        );
      default:
        return (
          <LibraryView
            tracks={tracks}
            onPlay={handlePlayTrack}
            onImport={handleImport}
            onRescan={handleRescan}
            currentTrackId={currentTrack?.id ?? null}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            view={currentView}
            isScanning={isScanning}
            isLoading={isLoading}
            onToggleFavorite={handleToggleFavorite}
            hasLibraryPath={!!libraryPath}
          />
        );
    }
  };

  const currentArtworkUri =
    currentTrack && currentTrack.has_artwork
      ? artworkCache[currentTrack.id] ?? null
      : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          trackCount={tracks.length}
          albumCount={albums.length}
          artistCount={artists.length}
        />

        {renderContent()}
      </div>

      <PlaybackBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={currentTrack?.duration ?? 0}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        artworkUri={currentArtworkUri}
      />
    </div>
  );
}
