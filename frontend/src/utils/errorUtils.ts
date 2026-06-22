import i18next from "i18next";

export function extractError(err: unknown, fallbackKey?: string): string {
  const data = (err as any)?.response?.data;
  if (data?.errorCode) {
    const translated = i18next.t(data.errorCode, data.params);
    if (translated !== data.errorCode) {
      return translated;
    }
  }
  return data?.message || data?.error || i18next.t(fallbackKey || "errors.operationError");
}
