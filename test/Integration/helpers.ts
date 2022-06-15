/*
 * This file contains all sorts of helpers for integration tests
 */

import { db } from '../../src/services';
import { migrations } from '../../src/migrations/migrations';
import { pool } from '../../src/services/database/db';
import { z } from 'zod';

/*
 * The functions below are used to setup database at the beginning of the test
 * and to close connection after the test (so that jest finished correctly)
 */

export const resetDatabase = async () => {
  const allMigrations: Array<string> = migrations.reduce((prev: Array<string>, curr) => {
    return prev.concat(curr.id);
  }, []);
  expect(await db.revertMigrations(migrations, allMigrations)).toBe(true);
  expect(await db.runMigrations(migrations)).toBe(true);
};

export const closeDatabase = async () => {
  await pool.end();
};

/*
 * Here is a simple parser for error messages returned by api
 */

export const ApiError = z.object({
  error: z.string()
}).strict();

export type ApiErrorType = z.infer<typeof ApiError>;

export const isApiError = (obj: unknown): obj is ApiErrorType => {
  return ApiError.safeParse(obj).success;
};

/*
 * Here is a simple parser for parsing login responses from api
 */

export const LoginBody = z.object({
  token: z.string(),
  content: z.object({
    uid: z.string().uuid(),
    username: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    expires: z.number()
  })
}).strict();

export type LoginBodyType = z.infer<typeof LoginBody>;

export const isLoginBody = (obj: unknown): obj is LoginBodyType => {
  return LoginBody.safeParse(obj).success;
};
