import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DemandeDetail } from "@/components/organisms/DemandeDetail";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { demandeApi } from "@/api/demandeApi";
import {
  annulerDemande,
  fetchDemandeHistory,
  clearSelectedHistory,
} from "@/store/slices/demandeSlice";
import type { AppDispatch, RootState } from "@/store";
import type { DemandeResponse } from "@/types/Demande.types";
import { useTranslation } from "react-i18next";
import { STATUS_COLOR, STATUS_TKEY } from "@/constants/constants";
import { formatDateFR } from "@/utils/dateUtils";

const DemandeDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { interims, selectedHistory, actionLoading } = useSelector(
    (state: RootState) => state.demande,
  );

  const [fetchState, setFetchState] = useState<{
    loading: boolean;
    demande: DemandeResponse | null;
    error: string | null;
  }>({ loading: true, demande: null, error: null });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const cancelRef = useRef(false);

  const statutConfig = Object.keys(STATUS_COLOR).reduce(
    (acc, key) => {
      acc[key] = { label: t(STATUS_TKEY[key]), color: STATUS_COLOR[key] };
      return acc;
    },
    {} as Record<string, { label: string; color: (typeof STATUS_COLOR)[string] }>,
  );

  useEffect(() => {
    if (!id) return;

    cancelRef.current = false;
    dispatch(clearSelectedHistory());
    dispatch(fetchDemandeHistory(Number(id)));

    demandeApi
      .getById(Number(id))
      .then((data) => {
        if (!cancelRef.current) {
          setFetchState({ loading: false, demande: data, error: null });
        }
      })
      .catch((err) => {
        if (!cancelRef.current) {
          const errorCode = err?.response?.data?.errorCode;
          const message = errorCode
            ? t(errorCode, { defaultValue: err?.response?.data?.error })
            : (err?.response?.data?.error || err?.message || t("error.internal"));
          setFetchState({
            loading: false,
            demande: null,
            error: message,
          });
        }
      });

    return () => {
      cancelRef.current = true;
    };
  }, [id, dispatch]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!fetchState.demande) return;
    setCancelDialogOpen(false);
    try {
      await dispatch(annulerDemande(fetchState.demande.id)).unwrap();
      setCancelDone(true);
    } catch {
      // error in Redux
    }
  };

  const getInterimName = useCallback(
    (interimId?: number) => {
      if (!interimId) return t("quota.nonSpecifie");
      const found = interims.find((c) => c.id === interimId);
      return found ? `${found.nom} ${found.prenom}` : `ID: ${interimId}`;
    },
    [interims, t],
  );

  const formatDate = (iso: string) => formatDateFR(iso);

  if (fetchState.loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (fetchState.error || !fetchState.demande) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{fetchState.error || "Demande introuvable"}</Alert>
      </Box>
    );
  }

  if (cancelDone) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          {t("annulation.confirmed")}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          {t("common.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Box
        sx={{
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          p: 4,
        }}
      >
        <DemandeDetail
          selectedDemande={fetchState.demande}
          demandeHistory={selectedHistory}
          actionLoading={actionLoading}
          statutConfig={statutConfig}
          onBack={handleBack}
          onCancelClick={handleCancelClick}
          getInterimName={getInterimName}
          formatDate={formatDate}
        />
      </Box>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t("annulation.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("annulation.message")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            {t("common.ignore")}
          </Button>
          <Button onClick={handleConfirmCancellation} color="error" variant="contained">
            {t("annulation.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemandeDetailPage;
