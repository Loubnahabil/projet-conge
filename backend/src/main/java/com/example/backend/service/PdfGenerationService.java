package com.example.backend.service;

import com.example.backend.entity.Demande;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfGenerationService {

    public byte[] generateDemandePdf(Demande demande) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Title
        document.add(new Paragraph("DÉCISION DE CONGÉ")
                .setBold().setFontSize(18).setMarginBottom(20));

        // Info table
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .useAllAvailableWidth();

        addRow(table, "N° Demande", String.valueOf(demande.getId()));
        addRow(table, "Fonctionnaire", demande.getUser().getNom() + " " + demande.getUser().getPrenom());
        addRow(table, "Service", demande.getUser().getService() != null ? demande.getUser().getService().getNom() : "-");
        addRow(table, "Intérimaire", demande.getInterim().getNom() + " " + demande.getInterim().getPrenom());
        addRow(table, "Type de congé", demande.getTypeConge().name());
        addRow(table, "Date début", demande.getDateDebut().toString());
        addRow(table, "Date fin", demande.getDateFin().toString());
        addRow(table, "Durée (jours ouvrables)", String.valueOf(demande.getDuree()));
        addRow(table, "Date de demande", demande.getDateDemande().toString());
        addRow(table, "Statut", demande.getStatut().name());

        document.add(table);

        // Signature zone
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("Signature du Directeur :").setMarginTop(40));
        document.add(new Paragraph("_______________________________"));

        document.close();

        return out.toByteArray();
    }

    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()));
        table.addCell(new Cell().add(new Paragraph(value)));
    }
}