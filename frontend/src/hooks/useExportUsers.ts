// src/hooks/useExportUsers.ts
import i18next from "i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserResponseDTO } from "@/types/user.types";

// Colonnes à exporter
const COLUMNS = [
  { header: i18next.t("export.ppr"), key: "ppr" },
  { header: i18next.t("export.nom"), key: "nom" },
  { header: i18next.t("export.prenom"), key: "prenom" },
  { header: i18next.t("export.email"), key: "email" },
  { header: i18next.t("export.grade"), key: "grade" },
  { header: i18next.t("export.direction"), key: "directionNom" },
  { header: i18next.t("export.division"), key: "divisionNom" },
  { header: i18next.t("export.service"), key: "serviceNom" },
  { header: i18next.t("export.actif"), key: "enabled" },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];

function formatValue(key: ColKey, user: UserResponseDTO): string {
  if (key === "enabled") return user.enabled ? i18next.t("export.oui") : i18next.t("export.non");
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
    XLSX.utils.book_append_sheet(wb, ws, i18next.t("export.fileName"));
    XLSX.writeFile(wb, `${i18next.t("export.fileName")}.xlsx`);
  };

  // ── PDF ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Titre
    doc.setFontSize(14);
    doc.text(i18next.t("export.pdfTitle"), 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${i18next.t("export.pdfExportDate")} ${new Date().toLocaleDateString("fr-FR")}`, 14, 21);

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

    doc.save(`${i18next.t("export.pdfFileName")}.pdf`);
  };

  return { exportExcel, exportPDF };
}
