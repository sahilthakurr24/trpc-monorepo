import { db, sql } from "@repo/database";
import {
  createGoogleUserInput,
  findUserByEmailInput,
  generateGoogleUserTokenPayload,
  type CreateGoogleUserInput,
  type FindUserByEmailTypeInput,
  type GenerateGoogleUserTokenPayload,
} from "./model";
import { usersTable } from "@repo/database/models/user";
import { env } from "../env";
import * as JWT from "jsonwebtoken";

class GoogleLoginService {
  private async generateUserToken(payload: GenerateGoogleUserTokenPayload) {
    const { id } = await generateGoogleUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  public async findUserByEmail(payload: FindUserByEmailTypeInput) {
    const { email } = await findUserByEmailInput.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await db
      .select()
      .from(usersTable)
      .where(sql`lower(${usersTable.email}) = ${normalizedEmail}`);

    return user;
  }

  public async createUser(payload: CreateGoogleUserInput) {
    const { email, name, picture } = await createGoogleUserInput.parseAsync(payload);
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.findUserByEmail({ email: normalizedEmail });

    if (existingUser.length > 0) {
      throw new Error("User with email already exists");
    }

    const result = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        fullName: name,
        emailVerified: true,
        profileImageUrl: picture ?? null,
      })
      .returning({
        id: usersTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong while creating user");
    }

    const userId = result[0].id;
    const { token } = await this.generateUserToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  public async createTokenForUser(payload: GenerateGoogleUserTokenPayload) {
    const { id } = await generateGoogleUserTokenPayload.parseAsync(payload);
    return this.generateUserToken({ id });
  }
}

export default GoogleLoginService;
