import { OAuth2Client } from "google-auth-library";
import { env } from "../env";

export const googleOAuth2Client = new OAuth2Client({
  clientId: env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
});

export const url = googleOAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["openid", "email", "profile"],
});
