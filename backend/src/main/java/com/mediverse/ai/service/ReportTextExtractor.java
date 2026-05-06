package com.mediverse.ai.service;

import com.mediverse.common.api.ApiException;
import com.mediverse.common.config.properties.OcrProperties;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

/**
 * Extracts human-readable text from uploaded medical reports.
 *
 * <p>Strategy:
 * <ul>
 *   <li>PDF: try native text extraction first (fast, accurate for digital PDFs)
 *   <li>If insufficient text, render pages and OCR (expensive; capped)
 *   <li>Images: OCR
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReportTextExtractor {

    public enum Method {
        PDF_TEXT,
        PDF_OCR,
        IMAGE_OCR
    }

    public record ExtractedText(String text, Method method, List<String> notes) {}

    private final OcrProperties ocrProperties;

    public ExtractedText extract(byte[] bytes, String mimeType) {
        if (bytes == null || bytes.length == 0) {
            throw ApiException.badRequest("Empty file");
        }
        String mt = mimeType == null ? "" : mimeType.trim().toLowerCase();

        if ("application/pdf".equals(mt)) {
            return extractFromPdf(bytes);
        }
        if (mt.startsWith("image/")) {
            return extractFromImage(bytes);
        }
        throw ApiException.badRequest("Unsupported content type for OCR: " + (mimeType == null ? "(none)" : mimeType));
    }

    private ExtractedText extractFromPdf(byte[] bytes) {
        List<String> notes = new ArrayList<>();

        try (PDDocument doc = org.apache.pdfbox.Loader.loadPDF(bytes)) {
            String text = tryPdfText(doc);
            if (text != null) {
                notes.add("pdf_text_chars=" + text.length());
                return new ExtractedText(text, Method.PDF_TEXT, notes);
            }

            int maxPages = positiveOrDefault(ocrProperties.maxOcrPages(), 8);
            int pageCount = Math.min(doc.getNumberOfPages(), maxPages);
            notes.add("pdf_pages_total=" + doc.getNumberOfPages());
            notes.add("pdf_pages_ocr=" + pageCount);

            PDFRenderer renderer = new PDFRenderer(doc);
            ITesseract tess = buildTesseract();
            StringBuilder out = new StringBuilder();

            for (int i = 0; i < pageCount; i++) {
                BufferedImage img = renderPdfPage(renderer, i);
                String pageText = safeDoOcr(tess, img, "page " + (i + 1));
                if (!pageText.isBlank()) {
                    if (!out.isEmpty()) out.append("\n\n---\n\n");
                    out.append(pageText.trim());
                }
            }

            String ocrText = normalizeExtracted(out.toString());
            if (ocrText.isBlank()) {
                throw ApiException.badRequest("Could not extract any text from this PDF. Try a clearer scan.");
            }
            notes.add("ocr_chars=" + ocrText.length());
            return new ExtractedText(ocrText, Method.PDF_OCR, notes);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.warn("PDF text extraction/OCR failed", e);
            throw ApiException.upstreamUnavailable("Could not OCR the PDF. Please try again shortly.");
        }
    }

    private String tryPdfText(PDDocument doc) {
        try {
            PDFTextStripper stripper = new PDFTextStripper();
            String raw = stripper.getText(doc);
            String text = normalizeExtracted(raw);
            int minChars = positiveOrDefault(ocrProperties.minPdfTextChars(), 400);
            if (text.length() >= minChars) {
                return text;
            }
            return null;
        } catch (Exception e) {
            // Don't fail early; OCR fallback may still work.
            log.debug("PDFBox text extraction failed, will attempt OCR fallback", e);
            return null;
        }
    }

    private BufferedImage renderPdfPage(PDFRenderer renderer, int pageIndex) throws Exception {
        int dpi = positiveOrDefault(ocrProperties.pdfOcrDpi(), 300);
        BufferedImage img = renderer.renderImageWithDPI(pageIndex, dpi, ImageType.RGB);
        long pixels = (long) img.getWidth() * (long) img.getHeight();
        long maxPixels = positiveOrDefault(ocrProperties.maxRenderedPixels(), 12_000_000L);
        if (pixels > maxPixels) {
            throw ApiException.badRequest(
                    "This PDF page is too large to OCR safely. Export at lower resolution or upload fewer pages.");
        }
        return img;
    }

    private ExtractedText extractFromImage(byte[] bytes) {
        List<String> notes = new ArrayList<>();
        BufferedImage img;
        try {
            img = ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (Exception e) {
            throw ApiException.badRequest("Could not read uploaded image");
        }
        if (img == null) {
            throw ApiException.badRequest("Unsupported image encoding");
        }
        notes.add("image_width=" + img.getWidth());
        notes.add("image_height=" + img.getHeight());

        ITesseract tess = buildTesseract();
        String text = safeDoOcr(tess, img, "image");
        String normalized = normalizeExtracted(text);
        if (normalized.isBlank()) {
            throw ApiException.badRequest("Could not extract any text from this image. Try a clearer scan.");
        }
        notes.add("ocr_chars=" + normalized.length());
        return new ExtractedText(normalized, Method.IMAGE_OCR, notes);
    }

    private ITesseract buildTesseract() {
        Tesseract t = new Tesseract();
        String lang = ocrProperties.language();
        if (lang != null && !lang.isBlank()) {
            t.setLanguage(lang.trim());
        }
        String datapath = ocrProperties.tessdataPath();
        if (datapath != null && !datapath.isBlank()) {
            // Tess4J expects the parent directory containing a `tessdata/` folder.
            t.setDatapath(datapath.trim());
        }
        return t;
    }

    private static String safeDoOcr(ITesseract tess, BufferedImage img, String label) {
        try {
            String raw = tess.doOCR(img);
            return raw == null ? "" : raw;
        } catch (TesseractException e) {
            throw ApiException.upstreamUnavailable("OCR failed while reading " + label + ". Try another file.");
        }
    }

    private static int positiveOrDefault(int x, int d) {
        return x > 0 ? x : d;
    }

    private static long positiveOrDefault(long x, long d) {
        return x > 0 ? x : d;
    }

    private static String normalizeExtracted(String raw) {
        if (raw == null) return "";
        // Keep newlines for structure, but avoid huge runs of whitespace.
        return raw
                .replace('\u0000', ' ')
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("[ \\t\\x0B\\f]+", " ")
                .replaceAll("\\n{4,}", "\n\n\n")
                .trim();
    }
}

