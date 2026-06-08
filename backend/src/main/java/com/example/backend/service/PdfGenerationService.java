package com.example.backend.service;

import com.example.backend.entity.Demande;
import com.example.backend.entity.StatutDemande;
import com.example.backend.entity.TypeConge;
import freemarker.template.Configuration;
import freemarker.template.Template;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerationService.class);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final Configuration freemarkerConfig;

    public byte[] generateDemandePdf(Demande demande) {
        try {
            Template template = freemarkerConfig.getTemplate("decision-conge.ftl");

            Map<String, Object> model = new HashMap<>();
            model.put("demande", demande);
            model.put("typeCongeLibelle", getTypeCongeLibelle(demande.getTypeConge()));
            model.put("dateDemande", safeFormat(demande.getDateDemande()));
            model.put("dateDebut", safeFormat(demande.getDateDebut()));
            model.put("dateFin", safeFormat(demande.getDateFin()));

            LocalDateTime visaChef = getDateVisaChef(demande);
            model.put("dateVisaChef", visaChef != null ? visaChef.format(DATE_FMT) : "__/__/____");
            model.put("today", LocalDate.now().format(DATE_FMT));

            String directionNom = null;
            if (demande.getUser().getService() != null
                    && demande.getUser().getService().getDivision() != null
                    && demande.getUser().getService().getDivision().getDirection() != null) {
                directionNom = demande.getUser().getService().getDivision().getDirection().getNom();
            }
            model.put("directionNom", directionNom);

            String userService = demande.getUser().getService() != null
                    ? demande.getUser().getService().getNom() : "-";
            model.put("userService", userService);

            StringWriter sw = new StringWriter();
            template.process(model, sw);
            String html = sw.toString();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF pour la demande {}", demande.getId(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    private String safeFormat(LocalDate date) {
        return date != null ? date.format(DATE_FMT) : "__/__/____";
    }

    private String getTypeCongeLibelle(TypeConge typeConge) {
        return switch (typeConge) {
            case ANNUEL -> "Annuel";
            case MALADIE -> "Maladie";
        };
    }

    private LocalDateTime getDateVisaChef(Demande demande) {
        if (demande.getHistoriques() == null) return null;
        return demande.getHistoriques().stream()
                .filter(h -> h.getStatutAction() == StatutDemande.VISEE_CHEF)
                .findFirst()
                .map(h -> h.getDateAction())
                .orElse(null);
    }
}
