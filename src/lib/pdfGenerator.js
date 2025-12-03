const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateCertificate(res, certData) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Colleghiamo il flusso del PDF direttamente alla risposta HTTP
    doc.pipe(res);

    // --- 1. SFONDO & BORDO ---
    doc.rect(0, 0, 595.28, 841.89).fill('#f9fbfc'); // Sfondo leggero
    doc.rect(20, 20, 555, 800).strokeColor('#1e3c72').lineWidth(3).stroke(); // Bordo blu enterprise

    // --- 2. INTESTAZIONE ---
    doc.moveDown(1);
    doc.fillColor('#333').fontSize(26).font('Helvetica-Bold').text('PRAGMA', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('BLOCKCHAIN TRUST INFRASTRUCTURE', { align: 'center', letterSpacing: 3 });
    
    doc.moveDown(2);

    // --- 3. TITOLO ---
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3c72').text('CERTIFICATO DI NOTARIZZAZIONE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').font('Helvetica').text('Il presente documento certifica l\'esistenza e l\'integrità del file su registro distribuito.', { align: 'center' });

    doc.moveDown(2);

    // --- 4. DETTAGLI FILE ---
    const startX = 60;
    let currentY = doc.y;

    const addRow = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text(label, startX, currentY);
        doc.font('Helvetica').fillColor('#555').text(value, startX + 160, currentY);
        currentY += 25;
    };

    addRow('Data Registrazione:', new Date(certData.created_at).toLocaleString());
    addRow('Nome File:', certData.metadata?.fileName || 'N/D');
    addRow('Dimensione:', certData.metadata?.sizeBytes ? `${(certData.metadata.sizeBytes / 1024).toFixed(2)} KB` : 'N/D');
    
    // Mostriamo il tipo contenuto in modo leggibile
    let typeLabel = 'Non Specificato';
    if (certData.content_type === 'human') typeLabel = 'Umano';
    if (certData.content_type === 'ai') typeLabel = 'AI Generato';
    if (certData.content_type === 'mixed') typeLabel = 'Misto';
    addRow('Origine Dichiarata:', typeLabel);

    currentY += 15; // Spazio

    // --- 5. DATI TECNICI (HASH) ---
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3c72').text('Impronta Digitale (SHA-256):', startX, currentY);
    currentY += 15;
    doc.fontSize(9).font('Courier').fillColor('#000').text(certData.content_hash, startX, currentY);

    currentY += 30;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3c72').text('Identificativo Transazione (TX Hash):', startX, currentY);
    currentY += 15;
    doc.fontSize(9).font('Courier').text(certData.tx_hash, startX, currentY, { 
        link: `https://sepolia.etherscan.io/tx/${certData.tx_hash}`, 
        underline: true, 
        color: 'blue' 
    });

    // --- 6. QR CODE (LINK ETHERSCAN) ---
    doc.moveDown(4);
    
    // 🔥 MODIFICA QUI: Link diretto a Etherscan 🔥
    const etherscanUrl = `https://sepolia.etherscan.io/tx/${certData.tx_hash}`;
    
    const qrImage = await QRCode.toDataURL(etherscanUrl, { errorCorrectionLevel: 'H' });
    doc.image(qrImage, 230, doc.y, { fit: [130, 130], align: 'center' });
    
    doc.moveDown(11); // Spazio sotto il QR
    doc.fontSize(9).font('Helvetica').fillColor('#777').text('Scansiona per visualizzare la prova ufficiale su Etherscan.io', { align: 'center' });

    // --- 7. PIÈ DI PAGINA ---
    const bottomY = 780;
    doc.fontSize(8).text(`Certificato ID: ${certData.cert_id}`, 50, bottomY);
    doc.text('Generato da Pragma Enterprise API', 50, bottomY + 12, { align: 'right' });

    doc.end();
}

module.exports = { generateCertificate };