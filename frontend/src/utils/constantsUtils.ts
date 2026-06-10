import { STATUS_COLOR, STATUS_TKEY } from "@/constants/constants";
import type { TFunction } from "i18next";

export function buildStatutConfig(t: TFunction) {
  return Object.keys(STATUS_COLOR).reduce(
    (acc, key) => {
      acc[key] = {
        label: t(STATUS_TKEY[key]),
        color: STATUS_COLOR[key],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: (typeof STATUS_COLOR)[string] }>,
  );
}
