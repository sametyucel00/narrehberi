import fs from 'fs';
import PDFParser from "pdf2json";

const pdfParser = new PDFParser(this, 1);
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log(pdfParser.getRawTextContent().replace(/\r\n/g, "\n"));
});

pdfParser.loadPDF("c:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/oyun.pdf");
