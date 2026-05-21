export interface DirectionResponseDTO {
  id: number;
  nom: string;
  code: string;
}

export interface DivisionResponseDTO {
  id: number;
  nom: string;
  code: string;
  directionId: number;
  directionNom: string;
}

export interface ServiceResponseDTO {
  id: number;
  nom: string;
  code: string;
  divisionId: number;
  divisionNom: string;
}

// Fixed: Changed empty interface to type alias
export type FullService = ServiceResponseDTO;

export interface FullDivision extends DivisionResponseDTO {
  services: FullService[];
}

export interface FullDirection extends DirectionResponseDTO {
  divisions: FullDivision[];
}
