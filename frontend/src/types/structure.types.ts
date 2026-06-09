export interface DirectionResponse {
  id: number;
  nom: string;
  code: string;
}

export interface DivisionResponse {
  id: number;
  nom: string;
  code: string;
  directionId: number;
  directionNom: string;
}

export interface ServiceResponse {
  id: number;
  nom: string;
  code: string;
  divisionId: number;
  divisionNom: string;
}

// Fixed: Changed empty interface to type alias
export type FullService = ServiceResponse;

export interface FullDivision extends DivisionResponse {
  services: FullService[];
}

export interface FullDirection extends DirectionResponse {
  divisions: FullDivision[];
}
