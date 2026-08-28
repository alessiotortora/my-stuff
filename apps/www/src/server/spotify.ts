import { createServerFn } from "@tanstack/react-start";
import { ENV } from "varlock/env";

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrack {
  album: { name: string; images?: { url: string }[] };
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
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

type TokenResult = { accessToken: string } | { error: "reauth" | "request" };

const getAccessToken = async (): Promise<TokenResult> => {
  const clientId = (ENV.SPOTIFY_CLIENT_ID ?? "").trim();
  const clientSecret = (ENV.SPOTIFY_CLIENT_SECRET ?? "").trim();
  const refreshToken = (ENV.SPOTIFY_REFRESH_TOKEN ?? "").trim();
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
    if (errorData.error === "invalid_grant") {
      console.error(
        "Spotify refresh token expired/revoked (they expire 6 months after authorization). Re-authorize via src/app/utils/get-refresh-token.mjs, then update SPOTIFY_REFRESH_TOKEN in .env.local and Bitwarden."
      );
      return { error: "reauth" };
    }
    console.error("Spotify token error:", res.status, errorData);
    return { error: "request" };
  }

  const data = await res.json();
  if (data.refresh_token) {
    console.warn(
      `Spotify rotated the refresh token. Persist the new value as SPOTIFY_REFRESH_TOKEN in .env.local and Bitwarden: ${data.refresh_token}`
    );
  }
  return { accessToken: data.access_token };
};

const toNowPlaying = (
  track: SpotifyTrack,
  isPlaying: boolean,
  playedAt?: string
): NowPlayingResponse => ({
  album: track.album.name,
  albumImageUrl: track.album.images?.[0]?.url,
  artist: track.artists.map((a) => a.name).join(", "),
  isPlaying,
  playedAt,
  songUrl: track.external_urls.spotify,
  title: track.name,
});

export const getNowPlaying = createServerFn({ method: "GET" }).handler(
  async (): Promise<NowPlayingResponse> => {
    try {
      const token = await getAccessToken();

      if ("error" in token) {
        return {
          error:
            token.error === "reauth"
              ? "Spotify re-authorization needed (refresh token expired)"
              : "Failed to get Spotify access token",
          isPlaying: false,
        };
      }

      const headers = { Authorization: `Bearer ${token.accessToken}` };

      const nowPlayingRes = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers }
      );

      if (nowPlayingRes.ok && nowPlayingRes.status !== 204) {
        const data = await nowPlayingRes.json();
        if (data?.item) {
          return toNowPlaying(data.item, true);
        }
      }

      const recentRes = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=1",
        { headers }
      );

      if (!recentRes.ok) {
        console.error("Spotify recently-played error:", recentRes.status);
        return { error: "Failed to fetch track", isPlaying: false };
      }

      const recentData = await recentRes.json();
      const item = recentData.items?.[0];

      if (!item?.track) {
        return { error: "No recently played track", isPlaying: false };
      }

      return toNowPlaying(item.track, false, item.played_at);
    } catch (error) {
      console.error("Spotify fetch error:", error);
      return { error: "Failed to fetch track", isPlaying: false };
    }
  }
);
