import { axiosInstance } from "./axiosInstance";
import type { DemandeResponse, DemandeRequest } from "../types/Demande.types";
import type { UserResponseDTO } from "../types/user.types";

export type UploadResponse = {
  message: string;
  success: boolean;
  fileUrl?: string;
};

export const demandeApi = {
  // GET /api/demandes/my-requests
  getMyDemandes: async (): Promise<DemandeResponse[]> => {
    const response = await axiosInstance.get<DemandeResponse[]>(
      "/api/demandes/my-requests",
    );
    return response.data;
  },

  // NEW: GET /api/demandes/a-viser (For Chef validation queues)
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
  getSameServiceColleagues: async (): Promise<UserResponseDTO[]> => {
    try {
      const response = await axiosInstance.get<UserResponseDTO[]>(
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
};
