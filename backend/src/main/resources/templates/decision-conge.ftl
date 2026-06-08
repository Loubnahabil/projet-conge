<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<style>
  @page { margin: 50px 60px; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; }
  .header { text-align: center; margin-bottom: 40px; }
  .header .republique { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .header .ministere { font-size: 11pt; margin-top: 4px; }
  .header .direction { font-size: 11pt; font-weight: bold; margin-top: 2px; }
  .ref { text-align: right; font-size: 10pt; margin-bottom: 30px; }
  .title { text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
  .preambule { margin-bottom: 25px; text-align: justify; line-height: 1.6; }
  .preambule p { margin: 6px 0; }
  .dispositif { margin-bottom: 30px; }
  .dispositif .article { margin: 10px 0; text-align: justify; line-height: 1.5; padding-left: 20px; text-indent: -20px; }
  .dispositif .article .art-label { font-weight: bold; }
  .signature { margin-top: 50px; text-align: right; }
  .signature .place-date { font-size: 11pt; margin-bottom: 25px; }
  .signature .signee-par { font-size: 11pt; margin-bottom: 5px; }
  .signature .signature-line { margin-top: 30px; padding-top: 8px; border-top: 1px solid #000; width: 280px; text-align: center; font-style: italic; font-size: 10pt; display: inline-block; }
  .footer-note { margin-top: 40px; font-size: 9pt; text-align: center; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head>
<body>

<div class="header">
  <div class="republique">Royaume du Maroc</div>
  <div class="ministere">Ministere de l'Interieur</div>
  <#if directionNom??><div class="direction">Direction ${directionNom}</div></#if>
</div>

<div class="ref">N° Ref : ${demande.id}/D/${today?substring(6)}</div>

<div class="title">DECISION DE CONGE</div>

<div class="preambule">
  <p><strong>LE DIRECTEUR<#if directionNom??> de la ${directionNom}</#if>,</strong></p>
  <p>Vu la demande de conge presentee par <strong>${demande.user.nom} ${demande.user.prenom}</strong>, en date du ${dateDemande} ;</p>
  <p>Vu l'avis favorable du chef hierarchique en date du ${dateVisaChef} ;</p>
  <p>Vu les dispositions reglementaires en vigueur relatives aux conges administratifs ;</p>
</div>

<div style="text-align: center; font-weight: bold; margin: 20px 0;">DECIDE</div>

<div class="dispositif">
  <div class="article">
    <span class="art-label">Article 1er :</span>
    Un conge <strong>${typeCongeLibelle}</strong> d'une duree de <strong>${demande.duree} jours ouvrables</strong> est accorde a <strong>${demande.user.nom} ${demande.user.prenom}</strong>, ${demande.user.grade}.
  </div>

  <div class="article">
    <span class="art-label">Article 2 :</span>
    La periode de conge s'etend du <strong>${dateDebut}</strong> au <strong>${dateFin}</strong>.
  </div>

  <div class="article">
    <span class="art-label">Article 3 :</span>
    Pendant son absence, <strong>${demande.interim.nom} ${demande.interim.prenom}</strong> assurera l'interim au sein du service <strong>${userService}</strong>.
  </div>

  <div class="article">
    <span class="art-label">Article 4 :</span>
    La presente decision sera notifiee a l'interesse(e) et communiquee pour information aux autorites concernees.
  </div>
</div>

<div class="signature">
  <div class="place-date">Fait a Rabat, le ${today}</div>
  <div class="signee-par"><strong>Le Directeur,</strong></div>
  <div class="signature-line">Cachet et signature</div>
</div>

<div class="footer-note">
  Document genere automatiquement le ${today}
</div>

</body>
</html>
