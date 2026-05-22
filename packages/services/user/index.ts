import { randomBytes, createHmac } from "node:crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { env } from "../env";
// import { googleOAuth2Client } from "../clients/google-oauth";
import {
  GetAuthenticationMethodOutputSchema,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
} from "./model";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
} from "./model";

import * as JWT from "jsonwebtoken";

class UserService {
  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    //validation
    const { full_name, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    //check for existing user
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User with email already exists");
    }

    // hashthe password
    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    // create the user in db
    const userInnerResult = await db
      .insert(usersTable)
      .values({ fullName: full_name, email, password: hash, salt })
      .returning({
        id: usersTable.id,
      });
    if (!userInnerResult || userInnerResult.length === 0 || !userInnerResult[0]?.id) {
      throw new Error("Something went wrong while creating user");
    }
    const userId = userInnerResult[0].id;
    const { token } = await this.generateUserToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  // public async getAuthenticationMethods(): Promise<
  //   ReadonlyArray<GetAuthenticationMethodOutputSchema>
  // > {
  //   const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

  //   const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

  //   if (isGoogleConfigured) {
  //     const url = googleOAuth2Client.generateAuthUrl();
  //     supportedAuthenticationProviders.push({
  //       provider: "GOOGLE_OAUTH",
  //       displayName: "Google",
  //       displayText: "Signin with Google",
  //       authUrl: url,
  //     });
  //   }

  //   return supportedAuthenticationProviders;
  // }
}

export default UserService;
