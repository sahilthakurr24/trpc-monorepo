import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  full_name: z.string().describe("Name of the user"),
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});



export const createUserWithEmailAndPasswordOutput = z.object({
    id : z.string().describe('Id of the user')
  });

