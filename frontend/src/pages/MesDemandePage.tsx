import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

import { DemandeTable } from "@/components/organisms/DemandeTable";
import { DemandeForm } from "@/components/organisms/DemandeForm";
import {
  fetchMyDemandes,
  fetchEligibleInterims,
  createDemande,
  updateDemande,
  soumettreDemande,
  annulerDemande,
  clearDemandeError,
  setDemandePage,
  setDemandeRowsPerPage,
} from "@/store/slices/demandeSlice";
import { demandeApi } from "@/api/demandeApi";
import type { AppDispatch, RootState } from "@/store";
import type { DemandeResponse, DemandeRequest, TypeConge } from "@/types/Demande.types";
import { useTranslation } from "react-i18next";
import { STATUS_COLOR, STATUS_TKEY, DOCUMENT_TYPE } from "@/constants/constants";

interface FormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

export const MesDemandePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statutConfig = Object.keys(STATUS_COLOR).reduce(
    (acc, key) => {
      acc[key] = { label: t(STATUS_TKEY[key]), color: STATUS_COLOR[key] };
      return acc;
    },
    {} as Record<string, { label: string; color: (typeof STATUS_COLOR)[string] }>,
  );

  const dispatch = useDispatch<AppDispatch>();
  const {
    demandes,
    interims,
    actionLoading,
    error,
    page,
    rowsPerPage,
    totalElements,
  } = useSelector((state: RootState) => state.demande);

  const [view, setView] = useState<"LIST" | "FORM">("LIST");
  const [editing, setEditing] = useState<DemandeResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchMyDemandes({ page, size: rowsPerPage }));
    dispatch(fetchEligibleInterims());
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    if (view === "LIST") dispatch(clearDemandeError());
  }, [view, dispatch]);

  const openCreate = () => {
    dispatch(clearDemandeError());
    setEditing(null);
    setSelectedFile(null);
    setFileError(null);
    setView("FORM");
  };

  const openEdit = (d: DemandeResponse) => {
    dispatch(clearDemandeError());
    setEditing(d);
    setSelectedFile(null);
    setFileError(null);
    setView("FORM");
  };

  const handleOpenDetailView = (d: DemandeResponse) => {
    navigate(`/mes-demandes/${d.id}`);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setFileError(null);
  };

  const saveDemandeWorkflow = async (data: FormInputs, submitInstantly: boolean) => {
    if (data.typeConge === "MALADIE" && submitInstantly && !selectedFile) {
      setFileError(t("demandeForm.maladieRequiresDoc"));
      return;
    }

    const payload: DemandeRequest = {
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      typeConge: data.typeConge as TypeConge,
      interimId: Number(data.interimId),
    };

    try {
      let activeDemandeId: number | null = null;

      if (editing) {
        const result = await dispatch(
          updateDemande({ id: editing.id, payload }),
        ).unwrap();
        activeDemandeId = result.id;
      } else {
        const result = await dispatch(
          createDemande({ payload, submit: submitInstantly }),
        ).unwrap();
        activeDemandeId = result.id;
      }

      if (selectedFile && activeDemandeId) {
        await demandeApi.uploadDocument(activeDemandeId, selectedFile, DOCUMENT_TYPE.CERTIFICAT_MEDICAL);
      }

      dispatch(setDemandePage(0));
      setView("LIST");
    } catch {
      // error already in Redux state
    }
  };

  const handleDirectSubmitFromTable = async (demande: DemandeResponse) => {
    if (!demande.interimId) {
      dispatch(clearDemandeError());
      return;
    }

    try {
      await dispatch(soumettreDemande(demande.id)).unwrap();
      dispatch(setDemandePage(0));
    } catch {
      // error in Redux
    }
  };

  const handleCancelDemandeFromTable = (id: number) => {
    setSelectedDemandeId(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (selectedDemandeId === null) return;

    setCancelDialogOpen(false);

    try {
      await dispatch(annulerDemande(selectedDemandeId)).unwrap();
      dispatch(setDemandePage(0));
    } catch {
      // error in Redux
    } finally {
      setSelectedDemandeId(null);
    }
  };

  const displayError = error;

  const handlePageChange = (newPage: number) => {
    dispatch(setDemandePage(newPage));
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    dispatch(setDemandeRowsPerPage(newRowsPerPage));
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {displayError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {displayError}
        </Alert>
      )}

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          p: view !== "LIST" ? 0 : undefined,
          boxShadow: view !== "LIST" ? "none" : undefined,
        }}
      >
        {view === "LIST" && (
          <DemandeTable
            demandes={demandes}
            statutConfig={statutConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onOpenCreate={openCreate}
            onOpenDetail={handleOpenDetailView}
            onOpenEdit={openEdit}
            onDirectSubmit={handleDirectSubmitFromTable}
            onCancelClick={handleCancelDemandeFromTable}
          />
        )}

        {view === "FORM" && (
          <Box sx={{ p: 4 }}>
            <DemandeForm
              editing={editing}
              colleagues={interims}
              actionLoading={actionLoading}
              onCancel={() => setView("LIST")}
              onSaveWorkflow={saveDemandeWorkflow}
              selectedFile={selectedFile}
              fileError={fileError}
              onFileChange={handleFileChange}
            />
          </Box>
        )}

      </Paper>

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

export default MesDemandePage;
