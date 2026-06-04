import { useSelector } from "react-redux";
import { Grid, Skeleton } from "@mui/material";
import { StatCard } from "../molecules/StatCard";
import type { RootState } from "../../store";

export const PerformanceOverview = () => {
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
          label="Total demandes"
          value={stats.totalDemandes}
          sub="Toutes périodes"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label="En attente de visa"
          value={stats.enAttenteVisa}
          sub="Traitement hiérarchique"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label="En attente de signature"
          value={stats.enAttenteSignature}
          sub="Traitement direction"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label="Taux de validation"
          value={`${stats.tauxValidation}%`}
          sub="Demandes approuvées"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          label="Taux de rejet"
          value={`${stats.tauxRejet}%`}
          sub="Demandes refusées"
        />
      </Grid>
    </Grid>
  );
};
