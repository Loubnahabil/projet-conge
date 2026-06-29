import i18next from "i18next";

interface ErrorResponse {
  errorCode?: string;
  params?: Record<string, string>;
  message?: string;
  error?: string;
}

export function extractError(err: unknown, fallbackKey?: string): string {
  const data = (err as { response?: { data?: ErrorResponse } })?.response?.data;
  if (data?.errorCode) {
    const translated = String(i18next.t(data.errorCode, data.params));
    if (translated !== data.errorCode) {
      return translated;
    }
  }
  return data?.message || data?.error || String(i18next.t(fallbackKey || "errors.operationError"));
}
