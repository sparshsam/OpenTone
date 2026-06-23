import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import {
  type Track,
  type AlbumInfo,
  type ArtistInfo,
  type PlaylistInfo,
  type View,
} from "@/types/music";
import Sidebar from "@/components/Sidebar";
import LibraryView from "@/components/LibraryView";
import AlbumView from "@/components/AlbumView";
import ArtistView from "@/components/ArtistView";
import SettingsView from "@/components/SettingsView";
import PlaylistListView from "@/components/PlaylistListView";
import PlaylistDetailView from "@/components/PlaylistDetailView";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import PlaybackBar from "@/components/PlaybackBar";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("library");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [libraryPath, setLibraryPath] = useState<string | null>(null);
  const [artworkCache, setArtworkCache] = useState<Record<string, string>>({});
  const [importError, setImportError] = useState<string | null>(null);

  // Playback state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const mimeTypeFor = (format: string): string => {
  const map: Record<string, string> = {
    mp3: "audio/mpeg", flac: "audio/flac", wav: "audio/wav",
    aac: "audio/aac", m4a: "audio/mp4", ogg: "audio/ogg",
    opus: "audio/ogg", wv: "audio/wavpack", aiff: "audio/aiff", aif: "audio/aiff",
  };
  return map[format] || "audio/mpeg";
  };

  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef<number>(-1);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  // Playlist state
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  const currentTrack =
    queueIndex >= 0 && queueIndex < queue.length
      ? queue[queueIndex]!
      : null;

  // Load library data on mount
  useEffect(() => {
    async function loadLibrary() {
      try {
        const [loadedTracks, loadedAlbums, loadedArtists, loadedPlaylists, settings] =
          await Promise.all([
            invoke<Track[]>("get_library"),
            invoke<AlbumInfo[]>("get_albums"),
            invoke<ArtistInfo[]>("get_artists"),
            invoke<PlaylistInfo[]>("get_playlists"),
            invoke<Record<string, string>>("get_settings"),
          ]);
        setTracks(loadedTracks);
        setAlbums(loadedAlbums);
        setArtists(loadedArtists);
        setPlaylists(loadedPlaylists);
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
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      if (idx < 0) return;
      const next = idx + 1;
      if (next < q.length) {
        setQueueIndex(next);
      } else {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      const err = audio.error;
      if (!err) return;
      let msg = "Playback failed.";
      switch (err.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          msg = "Playback was aborted.";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          msg = "A network error occurred while loading the audio file.";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          msg = "Could not decode this audio file. The format may not be supported.";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          msg = "The audio format is not supported or the file could not be found.";
          break;
      }
      setPlaybackError(msg);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
     
     

  }, []);
  // Load track when queue index changes — read file bytes via IPC, serve as Blob URL
  useEffect(() => {
    if (!currentTrack) return;
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackError(null);

    // Revoke previous object URL to avoid memory leaks
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    (async () => {
      try {
        const data = await readFile(currentTrack.path);
        const blob = new Blob([data], { type: mimeTypeFor(currentTrack.format) });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        audio.src = url;
        audio.load();

        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err: DOMException) => {
              console.warn("Playback failed:", err);
              setPlaybackError(
                `Could not play this file: ${err.message || "File may be missing or in an unsupported format."}`
              );
              setIsPlaying(false);
            });
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to read audio file:", msg);
        setPlaybackError(`Could not read file: ${msg}`);
        setIsPlaying(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueIndex, currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: DOMException) => {
          console.warn("Play failed:", err);
          setPlaybackError(`Playback failed: ${err.message || "Unknown error"}`);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!isInput && currentTrack) {
            setIsPlaying((p) => !p);
          }
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          if (!isInput) {
            e.preventDefault();
            handlePrevious();
          }
          break;
        case "ArrowRight":
        case "k":
        case "K":
          if (!isInput) {
            e.preventDefault();
            handleNext();
          }
          break;
        case "/":
          if (!isInput) {
            e.preventDefault();
            setCurrentView("library");
            // Focus search input after view switch
            setTimeout(() => {
              const input = document.getElementById("library-search") as HTMLInputElement;
              if (input) input.focus();
            }, 50);
          }
          break;
        case "Escape":
          if (searchQuery) {
            setSearchQuery("");
          } else if (isInput) {
            (target as HTMLInputElement).blur();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, searchQuery]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setPlaybackError(null);
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    setPlaybackError(null);
    setQueueIndex((prev) => Math.min(prev + 1, q.length - 1));
  }, []);

  const handlePrevious = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    setPlaybackError(null);
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setQueueIndex((prev) => Math.max(prev - 1, 0));
  }, []);

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
      setImportError(null);
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select music folder",
      });
      if (!selected) return;

      setIsScanning(true);
      try {
        await invoke<Track[]>("scan_folder", { path: selected });
        const [newTracks, newAlbums, newArtists] = await Promise.all([
          invoke<Track[]>("get_library"),
          invoke<AlbumInfo[]>("get_albums"),
          invoke<ArtistInfo[]>("get_artists"),
        ]);
        setTracks(newTracks);
        setAlbums(newAlbums);
        setArtists(newArtists);
        setLibraryPath(selected);
      } catch (err) {
        setImportError(`Import failed: ${err}`);
      } finally {
        setIsScanning(false);
      }
    } catch (err) {
      setImportError(`Folder selection failed: ${err}`);
      setIsScanning(false);
    }
  }, []);

  const handleRescan = useCallback(async () => {
    if (!libraryPath) return;
    setIsScanning(true);
    setImportError(null);
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
      setImportError(`Rescan failed: ${err}`);
    } finally {
      setIsScanning(false);
    }
  }, [libraryPath]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
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

  // Playlist handlers
  const loadPlaylists = useCallback(async () => {
    try {
      const result = await invoke<PlaylistInfo[]>("get_playlists");
      setPlaylists(result);
    } catch (err) {
      console.error("Failed to load playlists:", err);
    }
  }, []);

  const handlePlaylistClick = useCallback((id: string) => {
    setSelectedPlaylistId(id);
    setCurrentView("playlist-detail");
  }, []);

  const handleNavigate = useCallback((view: View) => {
    setCurrentView(view);
    if (view !== "playlist-detail") {
      setSelectedPlaylistId(null);
    }
  }, []);

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
      case "playlists":
        return (
          <PlaylistListView
            playlists={playlists}
            onPlaylistClick={handlePlaylistClick}
            onPlaylistsChanged={loadPlaylists}
            activePlaylistId={selectedPlaylistId}
          />
        );
      case "playlist-detail": {
        const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);
        if (!activePlaylist) {
          return (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted">Playlist not found.</p>
              </div>
            </div>
          );
        }
        return (
          <PlaylistDetailView
            playlist={activePlaylist}
            onPlay={handlePlayTrack}
            currentTrackId={currentTrack?.id ?? null}
            isPlaying={isPlaying}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => {
              setCurrentView("playlists");
              setSelectedPlaylistId(null);
              loadPlaylists();
            }}
            onPlaylistChanged={loadPlaylists}
          />
        );
      }
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
            isScanning={isScanning}
            isLoading={isLoading}
            onToggleFavorite={handleToggleFavorite}
            hasLibraryPath={!!libraryPath}
            importError={importError}
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
          onNavigate={handleNavigate}
          trackCount={tracks.length}
          albumCount={albums.length}
          artistCount={artists.length}
          playlistCount={playlists.length}
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
        queueLength={queue.length}
        queueIndex={queueIndex}
        playbackError={playbackError}
      />

      {/* Add to playlist modal */}
      {addToPlaylistTrack && (
        <AddToPlaylistModal
          trackId={addToPlaylistTrack.id}
          trackTitle={addToPlaylistTrack.title}
          onClose={() => setAddToPlaylistTrack(null)}
          onAdded={loadPlaylists}
        />
      )}
    </div>
  );
}
