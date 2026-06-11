import { axiosInstance } from "@/api/axiosInstance";
import type { DemandeResponse, DemandeRequest } from "@/types/Demande.types";
import type { UserResponse, SpringPageWrapper } from "@/types/user.types";
import type { HistoryRecord } from "@/types/Demande.types";
import { downloadBlob } from "@/utils/fileUtils";

export type UploadResponse = {
  id: number;
  demandeId: number;
  nomFichier: string;
  urlFichier: string;
  typeDocument: string;
  dateUpload: string;
};

export const demandeApi = {
  // GET /demandes/my-requests
  getMyDemandes: async (
    page: number,
    size: number,
  ): Promise<SpringPageWrapper<DemandeResponse>> => {
    const response = await axiosInstance.get<SpringPageWrapper<DemandeResponse>>(
      "/demandes/my-requests",
      { params: { page, size } },
    );
    return response.data;
  },

  // GET /demandes/a-viser (For Chef validation queues)
  getDemandesAViser: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>("/demandes/a-viser");
    return response.data;
  },

  // POST /demandes?submit=true/false
  create: async (payload: DemandeRequest, submit: boolean): Promise<DemandeResponse> => {
    const response = await axiosInstance.post<DemandeResponse>("/demandes", payload, {
      params: { submit },
    });
    return response.data;
  },

  // PUT /demandes/{id}
  update: async (id: number, payload: DemandeRequest): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(`/demandes/${id}`, payload);
    return response.data;
  },

  // POST /demandes/{id}/upload
  uploadDocument: async (id: number, file: File, typeDocument: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeDocument", typeDocument);

    const response = await axiosInstance.post<UploadResponse>(`/demandes/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  // PUT /demandes/{id}/visa-chef?approve=true/false
  visaChef: async (
    id: number,
    approve: boolean,
    body?: { commentaire?: string },
  ): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/demandes/${id}/visa-chef`,
      body || {},
      {
        params: { approve },
      },
    );
    return response.data;
  },

  // PUT /demandes/{id}/rejet-signataire
  rejetSignataire: async (id: number, body: { commentaire: string }): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(
      `/demandes/${id}/rejet-signataire`,
      body,
    );
    return response.data;
  },

  // GET /users/colleagues
  getSameServiceColleagues: async (): Promise<UserResponse[]> => {
    try {
      const response = await axiosInstance.get<UserResponse[]>("/users/colleagues");
      return response.data;
    } catch {
      return [];
    }
  },

  // PUT /demandes/{id}/annuler
  annulerDemande: async (id: number): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(`/demandes/${id}/annuler`);
    return response.data;
  },

  // GET /demandes/a-signer (For Signataire validation queues)
  getDemandesASigner: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>("/demandes/a-signer");
    return response.data;
  },

  getDemandeHistory: async (id: number): Promise<HistoryRecord[]> => {
    const response = await axiosInstance.get<HistoryRecord[]>(`/demandes/${id}/historique`);
    return response.data;
  },
  soumettre: async (id: number): Promise<DemandeResponse> => {
    const response = await axiosInstance.put<DemandeResponse>(`/demandes/${id}/soumettre`);
    return response.data;
  },

  // Add to demandeApi object:

  getDemandesTraiteesChef: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>("/demandes/traitees-chef");
    return response.data;
  },

  getDemandesTraiteesSignataire: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>("/demandes/traitees-signataire");
    return response.data;
  },

  // GET /demandes/{id}/generate-pdf
  generatePdf: async (id: number): Promise<void> => {
    const response = await axiosInstance.get(`/demandes/${id}/generate-pdf`, {
      responseType: "blob",
    });
    downloadBlob(response.data, `demande-${id}.pdf`);
  },
};
