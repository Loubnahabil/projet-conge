import { axiosInstance } from "@/api/axiosInstance";
import type { DemandeResponse, DemandeRequest } from "@/types/Demande.types";
import type { UserResponse, SpringPageWrapper } from "@/types/user.types";
import type { HistoryRecord } from "@/types/Demande.types";

export type UploadResponse = {
  id: number;
  demandeId: number;
  nomFichier: string;
  urlFichier: string;
  typeDocument: string;
  dateUpload: string;
};

export const demandeApi = {
  // GET /api/demandes/my-requests
  getMyDemandes: async (
    page: number,
    size: number,
  ): Promise<SpringPageWrapper<DemandeResponse>> => {
    const response = await axiosInstance.get<SpringPageWrapper<DemandeResponse>>(
      "/api/demandes/my-requests",
      { params: { page, size } },
    );
    return response.data;
  },

  // GET /api/demandes/a-viser (For Chef validation queues)
  getDemandesAViser: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>(
      "/api/demandes/a-viser",
    );
    return response.data;
  },

  // POST /api/demandes?submit=true/false
  create: async (
    payload: DemandeRequest,
    submit: boolean,
  ): Promise<DemandeResponse> => {
    const response = await axiosInstance.post<DemandeResponse>(
      "/api/demandes",
      payload,
      {
        params: { submit },
      },
    );
    return response.data;
  },

  // PUT /api/demandes/{id}
  update: async (
    id: number,
    payload: DemandeRequest,
  ): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/api/demandes/${id}`,
      payload,
    );
    return response.data;
  },

  // POST /api/demandes/{id}/upload
  uploadDocument: async (
    id: number,
    file: File,
    typeDocument: string,
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeDocument", typeDocument);

    const response = await axiosInstance.post<UploadResponse>(
      `/api/demandes/${id}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  },

  // PUT /api/demandes/{id}/visa-chef?approve=true/false
  visaChef: async (
    id: number,
    approve: boolean,
    body?: { commentaire?: string },
  ): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/api/demandes/${id}/visa-chef`,
      body || {},
      {
        params: { approve },
      },
    );
    return response.data;
  },

  // PUT /api/demandes/{id}/rejet-signataire
  rejetSignataire: async (
    id: number,
    body: { commentaire: string },
  ): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/api/demandes/${id}/rejet-signataire`,
      body,
    );
    return response.data;
  },

  // GET /api/users/colleagues
  getSameServiceColleagues: async (): Promise<UserResponse[]> => {
    try {
      const response = await axiosInstance.get<UserResponse[]>(
        "/api/users/colleagues",
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors du chargement des collègues de service:",
        error,
      );
      return [];
    }
  },

  // PUT /api/demandes/{id}/annuler
  annulerDemande: async (id: number): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/api/demandes/${id}/annuler`,
    );
    return response.data;
  },

  // GET /api/demandes/a-signer (For Signataire validation queues)
  getDemandesASigner: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>(
      "/api/demandes/a-signer",
    );
    return response.data;
  },

  getDemandeHistory: async (id: number): Promise<HistoryRecord[]> => {
    const response = await axiosInstance.get<HistoryRecord[]>(
      `/api/demandes/${id}/historique`,
    );
    return response.data;
  },
  soumettre: async (id: number): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/api/demandes/${id}/soumettre`,
    );
    return response.data;
  },

  // Add to demandeApi object:

  getDemandesTraiteesChef: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>(
      "/api/demandes/traitees-chef",
    );
    return response.data;
  },

  getDemandesTraiteesSignataire: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>(
      "/api/demandes/traitees-signataire",
    );
    return response.data;
  },

  // GET /api/demandes/{id}/generate-pdf
  generatePdf: async (id: number): Promise<void> => {
    const response = await axiosInstance.get(
      `/api/demandes/${id}/generate-pdf`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `demande-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
