import { createServerFn } from "@tanstack/react-start";
import { ENV } from "varlock/env";

interface SpotifyArtist {
  name: string;
}

export interface NowPlayingResponse {
  album?: string;
  albumImageUrl?: string;
  artist?: string;
  error?: string;
  isPlaying: boolean;
  playedAt?: string;
  songUrl?: string;
  title?: string;
}

const getAccessToken = async () => {
  const clientId = ENV.SPOTIFY_CLIENT_ID ?? "";
  const clientSecret = ENV.SPOTIFY_CLIENT_SECRET ?? "";
  const refreshToken = ENV.SPOTIFY_REFRESH_TOKEN ?? "";
  const basic = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Spotify token error:", res.status, errorData);
    return null;
  }

  const data = await res.json();
  return data.access_token;
};

export const getNowPlaying = createServerFn({ method: "GET" }).handler(
  async (): Promise<NowPlayingResponse> => {
    try {
      const access_token = await getAccessToken();

      if (!access_token) {
        return {
          error: "Failed to get Spotify access token",
          isPlaying: false,
        };
      }

      const nowPlayingRes = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
        const recentRes = await fetch(
          "https://api.spotify.com/v1/me/player/recently-played?limit=1",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const recentData = await recentRes.json();
        const { track } = recentData.items[0];

        return {
          album: track.album.name,
          albumImageUrl: track.album.images[0].url,
          artist: track.artists.map((a: SpotifyArtist) => a.name).join(", "),
          isPlaying: false,
          playedAt: recentData.items[0].played_at,
          songUrl: track.external_urls.spotify,
          title: track.name,
        };
      }

      const data = await nowPlayingRes.json();
      const track = data.item;

      return {
        album: track.album.name,
        albumImageUrl: track.album.images[0].url,
        artist: track.artists.map((a: SpotifyArtist) => a.name).join(", "),
        isPlaying: true,
        songUrl: track.external_urls.spotify,
        title: track.name,
      };
    } catch (error) {
      console.error("Spotify fetch error:", error);
      return { error: "Failed to fetch track", isPlaying: false };
    }
  }
);
