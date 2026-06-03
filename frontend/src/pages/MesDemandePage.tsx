import React, { useState, useEffect } from "react";
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

import { DemandeTable } from "../components/organisms/DemandeTable";
import { DemandeForm } from "../components/organisms/DemandeForm";
import { DemandeDetail } from "../components/organisms/DemandeDetail";
import { demandeApi } from "../api/demandeApi";

import type {
  DemandeResponse,
  DemandeRequest,
  HistoryRecord,
  TypeConge,
} from "../types/Demande.types";

import type { UserResponseDTO } from "../types/user.types";

interface FormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

const statutConfig: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  BROUILLON: { label: "Brouillon", color: "default" },
  SOUMISE: { label: "Soumise", color: "warning" },
  VISEE_CHEF: { label: "Visée par le Chef", color: "info" },
  SIGNEE_DIRECTEUR: { label: "Signée Directeur", color: "success" },
  REJETEE_CHEF: { label: "Rejetée Chef", color: "error" },
  REJETEE_DIRECTEUR: { label: "Rejetée Directeur", color: "error" },
  ANNULEE: { label: "Annulée", color: "default" },
};

export const MesDemandePage = () => {
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [colleagues, setColleagues] = useState<UserResponseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [view, setView] = useState<"LIST" | "FORM" | "DETAIL">("LIST");
  const [editingDemande, setEditingDemande] = useState<DemandeResponse | null>(
    null,
  );
  const [selectedDemande, setSelectedDemande] =
    useState<DemandeResponse | null>(null);
  const [demandeHistory, setDemandeHistory] = useState<HistoryRecord[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(
    null,
  );

  // ✅ FIXED useEffect (no useCallback)
  useEffect(() => {
    const load = async () => {
      try {
        const [myDemandes, users] = await Promise.all([
          demandeApi.getMyDemandes(),
          demandeApi.getSameServiceColleagues(),
        ]);
        setDemandes(myDemandes);
        setColleagues(users);
      } catch {
        setError("Erreur lors du chargement des données.");
      }
    };

    load();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingDemande(null);
    setSelectedFile(null);
    setFileError(null);
    setError(null);
    setView("FORM");
  };

  const handleOpenEditForm = (d: DemandeResponse) => {
    setEditingDemande(d);
    setSelectedFile(null);
    setFileError(null);
    setError(null);
    setView("FORM");
  };

  const handleOpenDetailView = async (d: DemandeResponse) => {
    setSelectedDemande(d);
    setDemandeHistory([]);
    setActionLoading(true);
    setView("DETAIL");

    try {
      const history = await demandeApi.getDemandeHistory(d.id);
      setDemandeHistory(history);
    } catch {
      setError("Impossible de charger l'historique de l'état.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
      setFileError(null);
    }
  };

  const saveDemandeWorkflow = async (
    data: FormInputs,
    submitInstantly: boolean,
  ) => {
    if (data.typeConge === "MALADIE" && submitInstantly && !selectedFile) {
      setFileError(
        "Une pièce justificative (Certificat médical) est obligatoire pour soumettre un congé maladie.",
      );
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const payload: DemandeRequest = {
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        typeConge: data.typeConge as TypeConge, // ✅ FIXED
        interimId: Number(data.interimId),
      };

      let activeDemandeId = editingDemande?.id || null;

      if (editingDemande) {
        await demandeApi.update(editingDemande.id, payload);
      } else {
        const created = await demandeApi.create(payload, submitInstantly);
        if (created?.id) activeDemandeId = created.id;
      }

      if (selectedFile && activeDemandeId) {
        await demandeApi.uploadDocument(
          activeDemandeId,
          selectedFile,
          "CERTIFICAT_MEDICAL",
        );
      }

      setDemandes(await demandeApi.getMyDemandes());
      setView("LIST");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du traitement du congé.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectSubmitFromTable = async (demande: DemandeResponse) => {
    setActionLoading(true);
    setError(null);

    try {
      if (!demande.interimId) {
        setError("Un intérimaire valide doit être désigné avant de soumettre.");
        return;
      }

      await demandeApi.soumettre(demande.id);
      setDemandes(await demandeApi.getMyDemandes());
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de soumettre la demande.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDemandeFromTable = (id: number) => {
    setSelectedDemandeId(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (selectedDemandeId === null) return;

    setCancelDialogOpen(false);
    setActionLoading(true);
    setError(null);

    try {
      await demandeApi.annulerDemande(selectedDemandeId);
      setDemandes(await demandeApi.getMyDemandes());

      if (view === "DETAIL") setView("LIST");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'annulation de la demande.";
      setError(message);
    } finally {
      setActionLoading(false);
      setSelectedDemandeId(null);
    }
  };

  const getInterimName = (id?: number) => {
    if (!id) return "Aucun";
    const found = colleagues.find((c) => c.id === id);
    return found ? `${found.nom} ${found.prenom}` : `ID: ${id}`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);

    return (
      d.toLocaleDateString("fr-MA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("fr-MA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
            onOpenCreate={handleOpenCreateForm}
            onOpenDetail={handleOpenDetailView}
            onOpenEdit={handleOpenEditForm}
            onDirectSubmit={handleDirectSubmitFromTable}
            onCancelClick={handleCancelDemandeFromTable}
          />
        )}

        {view === "FORM" && (
          <Box sx={{ p: 4 }}>
            <DemandeForm
              editingDemande={editingDemande}
              colleagues={colleagues}
              actionLoading={actionLoading}
              onCancel={() => setView("LIST")}
              onSaveWorkflow={saveDemandeWorkflow}
              selectedFile={selectedFile}
              fileError={fileError}
              onFileChange={handleFileChange}
            />
          </Box>
        )}

        {view === "DETAIL" && selectedDemande && (
          <Box sx={{ p: 4 }}>
            <DemandeDetail
              selectedDemande={selectedDemande}
              demandeHistory={demandeHistory}
              actionLoading={actionLoading}
              statutConfig={statutConfig}
              onBack={() => setView("LIST")}
              onCancelClick={handleCancelDemandeFromTable}
              getInterimName={getInterimName}
              formatDate={formatDate}
            />
          </Box>
        )}
      </Paper>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler ou supprimer cette demande de congé
            administrative ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            Ignorer
          </Button>
          <Button
            onClick={handleConfirmCancellation}
            color="error"
            variant="contained"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
