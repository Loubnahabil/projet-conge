import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Grid, Skeleton } from "@mui/material";
import { StatCard } from "@/components/molecules/StatCard";
import type { RootState } from "@/store";

export const PerformanceOverview = () => {
  const { t } = useTranslation();
  const { data: stats, loading } = useSelector(
    (state: RootState) => state.stats,
  );

  if (loading || !stats) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Skeleton
              variant="rounded"
              height={90}
              sx={{ borderRadius: "8px" }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label={t("dashboard.totalDemandes")}
          value={stats.totalDemandes}
          sub={t("dashboard.toutesPeriodes")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label={t("dashboard.enAttenteVisa")}
          value={stats.enAttenteVisa}
          sub={t("dashboard.traitementHierarchique")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label={t("dashboard.enAttenteSignature")}
          value={stats.enAttenteSignature}
          sub={t("dashboard.traitementDirection")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label={t("dashboard.tauxValidation")}
          value={`${stats.tauxValidation}%`}
          sub={t("dashboard.demandesApprouvees")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label={t("dashboard.tauxRejet")}
          value={`${stats.tauxRejet}%`}
          sub={t("dashboard.demandesRefusees")}
        />
      </Grid>
    </Grid>
  );
};
