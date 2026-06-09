export interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  ppr: string;
  grade: string;
  dateDebutFonction: string; // YYYY-MM-DD
  enabled: boolean;
  serviceId: number;
  serviceNom: string;
  divisionId: number;
  divisionNom: string;
  directionId: number;
  directionNom: string;
  role: string;
}

export interface SpringPageWrapper<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserRequest {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  ppr: string;
  grade: string;
  dateDebutFonction: string;
  serviceId: number;
  roleId: number;
}
