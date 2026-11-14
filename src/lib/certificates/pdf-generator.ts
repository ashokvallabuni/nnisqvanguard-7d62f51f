import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export interface CertificateData {
  certificateNumber: string;
  recipientName: string;
  courseTitle: string;
  categoryOrTrack?: string;
  completionDate: string; // ISO 8601 or date string
  finalScore?: number | null;
  verificationUrl: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  // Landscape A4: 841.89 x 595.28 points
  const width = 841.89;
  const height = 595.28;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`NISQ Vanguard Certificate - ${data.certificateNumber}`);
  pdfDoc.setAuthor("NISQ Vanguard - Defence Technologies");
  pdfDoc.setSubject(`Course Completion Certificate: ${data.courseTitle}`);
  pdfDoc.setKeywords(["cybersecurity", "certificate", "nisq vanguard", "defence technologies"]);

  const page = pdfDoc.addPage([width, height]);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette: Dark navy #050b14, Electric Blue #0a7cff, Cyan #00e5ff, White #ffffff, Muted #94a3b8
  const cNavy = rgb(5 / 255, 11 / 255, 20 / 255);
  const cNavyCard = rgb(10 / 255, 20 / 255, 36 / 255);
  const cElectricBlue = rgb(10 / 255, 124 / 255, 255 / 255);
  const cCyan = rgb(0 / 255, 229 / 255, 255 / 255);
  const cWhite = rgb(1, 1, 1);
  const cMuted = rgb(148 / 255, 163 / 255, 184 / 255);

  // 1. Fill Deep Navy Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: cNavy,
  });

  // Inner card container
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    color: cNavyCard,
    borderColor: cElectricBlue,
    borderWidth: 1.5,
  });

  // Subtle interior cyan border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: cCyan,
    borderWidth: 0.5,
    borderOpacity: 0.35,
  });

  // Technical corner brackets
  const cornerLen = 22;
  const corners = [
    { x: 34, y: 34, dx: 1, dy: 1 },
    { x: width - 34, y: 34, dx: -1, dy: 1 },
    { x: 34, y: height - 34, dx: 1, dy: -1 },
    { x: width - 34, y: height - 34, dx: -1, dy: -1 },
  ];
  for (const c of corners) {
    page.drawLine({
      start: { x: c.x, y: c.y },
      end: { x: c.x + c.dx * cornerLen, y: c.y },
      thickness: 1.5,
      color: cCyan,
    });
    page.drawLine({
      start: { x: c.x, y: c.y },
      end: { x: c.x, y: c.y + c.dy * cornerLen },
      thickness: 1.5,
      color: cCyan,
    });
  }

  // 2. Try Embed Official Logo
  try {
    const logoPath = path.resolve(process.cwd(), "public", "assets", "nisq-logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: width / 2 - 30,
        y: height - 105,
        width: 60,
        height: 60,
      });
    }
  } catch {
    // Non-fatal fallback
  }

  // Helper for centering text
  const drawCentered = (text: string, y: number, font: any, size: number, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // 3. Header Titles
  drawCentered("NISQ VANGUARD — DEFENCE TECHNOLOGIES", height - 120, helveticaBold, 12, cElectricBlue);
  drawCentered("CYBER ACADEMY • VERIFIED CREDENTIAL", height - 134, helveticaOblique, 8.5, cMuted);

  // Divider line
  page.drawLine({
    start: { x: 80, y: height - 146 },
    end: { x: width - 80, y: height - 146 },
    thickness: 0.8,
    color: cElectricBlue,
  });

  // 4. Main Certificate Text
  drawCentered("CERTIFICATE OF COMPLETION", height - 180, helveticaBold, 26, cWhite);
  drawCentered("This is officially awarded to", height - 212, helvetica, 11, cMuted);

  // Recipient Display Name
  drawCentered(data.recipientName, height - 250, helveticaBold, 24, cCyan);

  // Underline for recipient
  const nameWidth = helveticaBold.widthOfTextAtSize(data.recipientName, 24);
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 15, y: height - 258 },
    end: { x: (width + nameWidth) / 2 + 15, y: height - 258 },
    thickness: 1,
    color: cCyan,
    opacity: 0.7,
  });

  drawCentered("for successfully demonstrating mastery and fulfilling all practical requirements in", height - 284, helvetica, 11, cMuted);

  // Course Title (multi-line handling if title is long)
  const maxChars = 55;
  if (data.courseTitle.length > maxChars) {
    const words = data.courseTitle.split(" ");
    let line1 = "";
    let line2 = "";
    for (const w of words) {
      if ((line1 + " " + w).trim().length <= maxChars) {
        line1 = (line1 + " " + w).trim();
      } else {
        line2 = (line2 + " " + w).trim();
      }
    }
    drawCentered(line1, height - 316, helveticaBold, 17, cWhite);
    drawCentered(line2, height - 338, helveticaBold, 17, cWhite);
  } else {
    drawCentered(data.courseTitle, height - 322, helveticaBold, 18, cWhite);
  }

  if (data.categoryOrTrack) {
    drawCentered(`[ ${data.categoryOrTrack.toUpperCase()} ]`, height - 355, helveticaBold, 8.5, cElectricBlue);
  }

  // 5. Embed QR Code for Public Verification
  try {
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 140,
      color: {
        dark: "#0a7cff",
        light: "#050b14",
      },
    });
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(base64Data, "base64");
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawImage(qrImage, {
      x: width - 150,
      y: 65,
      width: 75,
      height: 75,
    });

    const qrNote = "Scan to verify on-chain";
    const qrNoteWidth = helvetica.widthOfTextAtSize(qrNote, 6.5);
    page.drawText(qrNote, {
      x: width - 150 + (75 - qrNoteWidth) / 2,
      y: 54,
      size: 6.5,
      font: helvetica,
      color: cMuted,
    });
  } catch {
    // Non-fatal QR fallback
  }

  // Bottom separator
  page.drawLine({
    start: { x: 80, y: 155 },
    end: { x: width - 80, y: 155 },
    thickness: 0.8,
    color: cElectricBlue,
  });

  // 6. Meta Columns (Left: Dates, Center: Unique ID & Scores, Bottom: Issuer)
  const formattedDate = new Date(data.completionDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Left Column
  page.drawText("DATE OF ISSUANCE", { x: 85, y: 135, size: 7.5, font: helveticaBold, color: cMuted });
  page.drawText(formattedDate, { x: 85, y: 120, size: 10, font: helveticaBold, color: cWhite });

  if (data.finalScore !== undefined && data.finalScore !== null) {
    page.drawText("ASSESSMENT SCORE", { x: 85, y: 102, size: 7.5, font: helveticaBold, color: cMuted });
    page.drawText(`${data.finalScore}% (DISTINCTION)`, { x: 85, y: 88, size: 9.5, font: helveticaBold, color: cCyan });
  }

  // Center Column
  const idLabel = "CERTIFICATE IDENTIFIER";
  const idLabelWidth = helveticaBold.widthOfTextAtSize(idLabel, 7.5);
  page.drawText(idLabel, { x: (width - idLabelWidth) / 2, y: 135, size: 7.5, font: helveticaBold, color: cMuted });

  const idWidth = helvetica.widthOfTextAtSize(data.certificateNumber, 9.5);
  page.drawText(data.certificateNumber, { x: (width - idWidth) / 2, y: 120, size: 9.5, font: helvetica, color: cElectricBlue });

  // Organization Issuer Signature Line
  const issuerLine = "AUTHORIZED ISSUER: NISQ VANGUARD DEFENCE TECHNOLOGIES ACADEMY";
  const issuerWidth = helveticaBold.widthOfTextAtSize(issuerLine, 8);
  page.drawText(issuerLine, { x: (width - issuerWidth) / 2, y: 92, size: 8, font: helveticaBold, color: cWhite });

  const motto = "Secure Today. Defend Tomorrow. Empower Forever.";
  const mottoWidth = helveticaOblique.widthOfTextAtSize(motto, 7.5);
  page.drawText(motto, { x: (width - mottoWidth) / 2, y: 78, size: 7.5, font: helveticaOblique, color: cMuted });

  const verifyUrlText = `Public Verification URL: ${data.verificationUrl}`;
  const verifyUrlWidth = helvetica.widthOfTextAtSize(verifyUrlText, 7);
  page.drawText(verifyUrlText, { x: (width - verifyUrlWidth) / 2, y: 56, size: 7, font: helvetica, color: cElectricBlue });

  return await pdfDoc.save();
}

