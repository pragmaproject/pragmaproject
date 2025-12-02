const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateCertificate(res, certData) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Colleghiamo il flusso del PDF direttamente alla risposta HTTP (scaricamento)
    doc.pipe(res);

    // --- 1. INTESTAZIONE ---
    doc.rect(0, 0, 595.28, 841.89).fill('#f9fbfc'); // Sfondo leggero
    
    // Bordo decorativo
    doc.rect(20, 20, 555, 800).strokeColor('#667eea').lineWidth(3).stroke();

    // Logo / Titolo
    doc.fillColor('#333').fontSize(30).font('Helvetica-Bold').text('PRAGMA', 0, 60, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('BLOCKCHAIN NOTARIZATION SERVICE', { align: 'center', letterSpacing: 2 });
    
    doc.moveDown(2);

    // --- 2. CORPO DEL CERTIFICATO ---
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#667eea').text('CERTIFICATO DI AUTENTICITÀ', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').font('Helvetica').text('Il presente documento attesta che il file digitale sottostante è stato notarizzato su Blockchain pubblica.', { align: 'center' });

    doc.moveDown(2);

    // Disegniamo una box per i dettagli
    const startX = 50;
    let currentY = doc.y;

    // Funzione helper per le righe
    const addRow = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text(label, startX, currentY);
        doc.font('Helvetica').text(value, startX + 150, currentY);
        currentY += 25;
    };

    addRow('Data Registrazione:', new Date(certData.created_at).toLocaleString());
    addRow('Nome File Originale:', certData.metadata?.fileName || 'N/D');
    addRow('Dimensione:', certData.metadata?.sizeBytes ? `${certData.metadata.sizeBytes} bytes` : 'N/D');
    addRow('Tipo Contenuto:', certData.content_type || 'Generico');
    
    currentY += 10; // Spazio extra
    
    doc.fontSize(10).font('Helvetica-Bold').text('Digital Fingerprint (Hash SHA-256):', startX, currentY);
    currentY += 15;
    doc.fontSize(9).font('Courier').fillColor('#000').text(certData.content_hash, startX, currentY);

    currentY += 30;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('Transaction ID (Blockchain):', startX, currentY);
    currentY += 15;
    doc.fontSize(9).font('Courier').text(certData.tx_hash, startX, currentY, { link: `https://sepolia.etherscan.io/tx/${certData.tx_hash}`, underline: true, color: 'blue' });

    // --- 3. QR CODE ---
    doc.moveDown(4);
    const verifyUrl = `https://pragma-api.onrender.com/index.html`; // Punta alla dashboard per verificare
    
    // Genera QR al volo
    const qrImage = await QRCode.toDataURL(verifyUrl + "?verify=" + certData.content_hash);
    doc.image(qrImage, 230, doc.y, { fit: [130, 130], align: 'center' });
    
    doc.moveDown(10); // Sposta cursore sotto il QR
    doc.fontSize(9).font('Helvetica').fillColor('#777').text('Scansiona per verificare l\'autenticità in tempo reale', 0, doc.y + 140, { align: 'center' });

    // --- 4. PIÈ DI PAGINA ---
    doc.fontSize(8).text(`Certificato ID: ${certData.cert_id}`, 50, 780);
    doc.text('Generato da Pragma Enterprise API', 50, 795, { align: 'right' });

    // Chiude il documento
    doc.end();
}

module.exports = { generateCertificate };