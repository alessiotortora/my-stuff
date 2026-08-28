const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://127.0.0.1:3000/callback";
const code = process.env.AUTH_CODE;

const getRefreshToken = async () => {
  const body = new URLSearchParams({
    client_id,
    client_secret,
    code,
    grant_type: "authorization_code",
    redirect_uri,
  });

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Your Refresh Token:", data.refresh_token);
    } else {
      console.error("Error getting refresh token:", data);
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
};

getRefreshToken();
