import { randomBytes, createHmac } from "node:crypto";
import { db, sql, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { env } from "../env";
// import { googleOAuth2Client } from "../clients/google-oauth";
import {
  GetAuthenticationMethodOutputSchema,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  signinUserWithEmailAndPasswordInput,
} from "./model";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  SigninUserWithEmailAndPasswordInputType,
} from "./model";

import * as JWT from "jsonwebtoken";

class UserService {
  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }
  private async getUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db
      .select()
      .from(usersTable)
      .where(sql`lower(${usersTable.email}) = ${normalizedEmail}`);
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType;
      return verificationResult;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  public async getUserInfoById(id: string) {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        profileImageUrl: usersTable.profileImageUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      throw new Error(`User with ${id} does not exist`);
    }
    return user;
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    //validation
    const { full_name, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();

    //check for existing user
    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("User with email already exists");
    }

    // hashthe password
    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password);

    // create the user in db
    const userInnerResult = await db
      .insert(usersTable)
      .values({ fullName: full_name, email: normalizedEmail, password: hash, salt })
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

  public async signinUserWithEmailAndPassword(payload: SigninUserWithEmailAndPasswordInputType) {
    const { email, password } = await signinUserWithEmailAndPasswordInput.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();
    //check if email is there or not
    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (!existingUser) {
      throw new Error(`User with email ${email} does not exist`);
    }
    if (!existingUser.password || !existingUser.salt) {
      throw new Error("Invalid login method");
    }

    const hash = await this.generateHash(existingUser.salt, password);
    if (existingUser.password !== hash) {
      throw new Error("Invalid email or password");
    }

    const { token } = await this.generateUserToken({ id: existingUser.id });

    return { id: existingUser.id, token };
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await this.verifyUserToken(token);
    return { id };
  }
}

export default UserService;
