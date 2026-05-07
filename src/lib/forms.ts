import type { z } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

export type FormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
};

export function getZodMessage(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message ?? fallback;
}

export function getZodFieldErrors(error: z.ZodError): FieldErrors {
  return error.flatten().fieldErrors;
}

