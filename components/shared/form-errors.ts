import type { FieldErrors } from "@/src/lib/forms";

function getFieldErrorMessages(
  fieldErrors: FieldErrors | undefined,
  name: string,
) {
  return fieldErrors?.[name] ?? [];
}

function getFieldErrors(fieldErrors: FieldErrors | undefined, name: string) {
  return getFieldErrorMessages(fieldErrors, name).map((message) => ({
    message,
  }));
}

function hasFieldError(fieldErrors: FieldErrors | undefined, name: string) {
  return getFieldErrorMessages(fieldErrors, name).length > 0;
}

export { getFieldErrors, hasFieldError };

