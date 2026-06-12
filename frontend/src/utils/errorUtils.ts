import i18next from "i18next";
import { AxiosError } from "axios";

export function extractErrorMessage(err: unknown, fallbackKey?: string): string {
  if (err instanceof AxiosError && err.response?.data?.error) return err.response.data.error as string;
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallbackKey ? i18next.t(fallbackKey) : "Une erreur est survenue";
}
