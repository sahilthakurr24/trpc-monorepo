import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  full_name: z.string().describe("Name of the user"),
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutput = z.object({
  id: z.string().describe("Id of the user"),
});

export const signinUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const signinUserWithEmailAndPasswordOutput = z.object({
  id: z.string().describe("Id of the user"),
  token: z.string().describe("Access token of the user"),
});

export const getLoggedInUserInfoInput = z.undefined();

export const getLoggedInUserInfoOutput = z.object({
  id : z.string().describe('id of the user created'),
  email : z.email().describe('email of the user'),
  fullName : z.string().describe('name of the user'),
  profileImageUrl : z.string().describe('image url of the user').optional().nullable()
})