/**
 * QR SERVICE
 * Generates and parses QR codes for student login.
 */

import QRCode from 'qrcode';

/**
 * Generates the raw QR data string for Lumina login.
 * @param {string} studentId - The student's ID
 * @param {string} pin - The 4-digit PIN
 * @returns {string} The QR URL string format
 */
export const generateQRData = (studentId, pin) => {
  return `lumina://login?pin=${pin}&studentId=${studentId}`;
};

/**
 * Generates a base64 image string of the QR code.
 * @param {string} studentId - The student's ID
 * @param {string} pin - The 4-digit PIN
 * @returns {Promise<string>} Base64 image data URL
 */
export const generateQRCode = async (studentId, pin) => {
  const data = generateQRData(studentId, pin);
  return await QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });
};

/**
 * Generates HTML for a printable QR card.
 * Designed to be printed and stuck on a child's desk.
 * @param {Object} studentProfile - The student's profile data
 * @param {string} pin - The 4-digit PIN
 * @returns {Promise<string>} HTML string
 */
export const generatePrintableQR = async (studentProfile, pin) => {
  const idToUse = studentProfile.userId || studentProfile.studentId;
  const qrImage = await generateQRCode(idToUse, pin);
  
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; border: 2px solid #1976d2; border-radius: 12px; padding: 20px; width: 300px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1976d2; margin-bottom: 5px;">Lumina</h2>
      <h3 style="margin-top: 0; color: #333;">${studentProfile.firstName || 'Student'}</h3>
      <img src="${qrImage}" alt="QR Code" style="width: 200px; height: 200px; margin: 10px 0;" />
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 10px 0; color: #000;">${pin}</p>
      <p style="color: #666; font-size: 14px; font-weight: 500;">Scan to start learning!</p>
    </div>
  `;
};

/**
 * Parses a Lumina QR data string back into a PIN and student ID.
 * @param {string} qrString - The raw QR string
 * @returns {{ pin: string|null, studentId: string|null }}
 */
export const parseQRData = (qrString) => {
  try {
    const url = new URL(qrString);
    if (url.protocol === 'lumina:') {
      return {
        pin: url.searchParams.get('pin'),
        studentId: url.searchParams.get('studentId')
      };
    }
  } catch (e) {
    console.warn('Invalid QR String parsed.', e);
  }
  return { pin: null, studentId: null };
};
