export const STATUS_COLOR: Record<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  BROUILLON: "default",
  SOUMISE: "warning",
  VISEE_CHEF: "info",
  SIGNEE_DIRECTEUR: "success",
  REJETEE_CHEF: "error",
  REJETEE_DIRECTEUR: "error",
  ANNULEE: "default",
};

export const STATUS_TKEY: Record<string, string> = {
  BROUILLON: "status.brouillon",
  SOUMISE: "status.soumise",
  VISEE_CHEF: "status.viseeChef",
  SIGNEE_DIRECTEUR: "status.signeeDirecteur",
  REJETEE_CHEF: "status.rejeteeChef",
  REJETEE_DIRECTEUR: "status.rejeteeDirecteur",
  ANNULEE: "status.annulee",
};

export const TYPE_COLOR: Record<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  ANNUEL: "primary",
  MALADIE: "warning",
};

export const TYPE_TKEY: Record<string, string> = {
  ANNUEL: "leaveType.annuel",
  MALADIE: "leaveType.maladie",
};

export const ROLE_TKEY: Record<string, string> = {
  ADMIN: "role.admin",
  FONCTIONNAIRE: "role.fonctionnaire",
  CHEF_HIERARCHIE: "role.chefHierarchique",
  SIGNATAIRE: "role.signataire",
};

export const ALL_STATUTS = Object.keys(STATUS_COLOR);
