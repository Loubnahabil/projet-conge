// src/hooks/useExportUsers.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserResponseDTO } from "../types/user.types";

// Colonnes à exporter
const COLUMNS = [
  { header: "PPR", key: "ppr" },
  { header: "Nom", key: "nom" },
  { header: "Prénom", key: "prenom" },
  { header: "Email", key: "email" },
  { header: "Grade", key: "grade" },
  { header: "Direction", key: "directionNom" },
  { header: "Division", key: "divisionNom" },
  { header: "Service", key: "serviceNom" },
  { header: "Actif", key: "enabled" },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];

function formatValue(key: ColKey, user: UserResponseDTO): string {
  if (key === "enabled") return user.enabled ? "Oui" : "Non";
  if (key === "nom") return user.nom.toUpperCase();
  return String(user[key] ?? "");
}

export function useExportUsers(users: UserResponseDTO[]) {
  // ── EXCEL ──────────────────────────────────────────────────────────
  const exportExcel = () => {
    const rows = users.map((u) =>
      Object.fromEntries(
        COLUMNS.map(({ header, key }) => [header, formatValue(key, u)]),
      ),
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fonctionnaires");
    XLSX.writeFile(wb, "fonctionnaires.xlsx");
  };

  // ── PDF ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Titre
    doc.setFontSize(14);
    doc.text("Liste des Fonctionnaires", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [COLUMNS.map((c) => c.header)],
      body: users.map((u) => COLUMNS.map(({ key }) => formatValue(key, u))),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("fonctionnaires.pdf");
  };

  return { exportExcel, exportPDF };
}
