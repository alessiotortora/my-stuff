import type { NowPlayingResponse } from "#/server/spotify";
import { AlbumWrapper } from "./album-wrapper";

export function SpotifyShowcase({ song }: { song: NowPlayingResponse }) {
  if (song.error || !song.title) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <p className="text-gray-500">
          {song.error || "Not playing anything right now"}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-14">
      <div className="relative block h-10 md:hidden">
        <img
          alt="handwritten arrow"
          className="absolute top-2 left-44 h-6"
          height={50}
          src="/arrow.svg"
          width={50}
        />
        <p className="absolute top-0 left-60 font-script text-lg tracking-wider">
          tap me and scratch!
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:gap-32">
        <div>
          {song.albumImageUrl && (
            <AlbumWrapper
              albumName={song.album}
              albumUrl={song.albumImageUrl}
            />
          )}
        </div>

        <div className="mt-4 flex items-center space-y-2 md:mt-0">
          {(() => {
            const prefix = song.isPlaying
              ? "Currently listening to"
              : "Recently played";
            return (
              <p>
                {prefix}{" "}
                {song.songUrl ? (
                  <>
                    <a
                      className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4"
                      href={song.songUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {song.title}
                    </a>{" "}
                    by{" "}
                    <a
                      className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4"
                      href={song.songUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {song.artist}
                    </a>{" "}
                    from the album{" "}
                    <a
                      className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4"
                      href={song.songUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {song.album}
                    </a>
                  </>
                ) : (
                  <>
                    <span className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4">
                      {song.title}
                    </span>{" "}
                    by{" "}
                    <span className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4">
                      {song.artist}
                    </span>{" "}
                    from the album{" "}
                    <span className="font-normal underline decoration-muted-foreground decoration-dashed underline-offset-4">
                      {song.album}
                    </span>
                  </>
                )}
                .
              </p>
            );
          })()}
        </div>
      </div>
      <div className="relative hidden md:block">
        <img
          alt="handwritten arrow"
          className="absolute top-0 left-52 h-6 rotate-180 scale-x-[-1] transform"
          height={50}
          src="/arrow.svg"
          width={50}
        />
        <p className="absolute top-[-15] left-68 my-6 font-script tracking-wider">
          scratch me
        </p>
      </div>
    </div>
  );
}
