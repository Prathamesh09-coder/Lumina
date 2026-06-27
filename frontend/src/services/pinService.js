/**
 * PIN SERVICE
 * Handles generating, validating, and managing 4-digit PINs for student login.
 */

import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Generates a random, unique 4-digit PIN.
 * @returns {Promise<string>} A 4-digit PIN as a string.
 */
export const generatePIN = async () => {
  let pin;
  let isUnique = false;
  while (!isUnique) {
    pin = Math.floor(1000 + Math.random() * 9000).toString();
    const snap = await getDoc(doc(db, 'pins', pin));
    if (!snap.exists()) {
      isUnique = true;
    }
  }
  return pin;
};

/**
 * Saves a PIN to Firestore and maps it to a student ID.
 * @param {string} studentId - The student's ID
 * @param {string} pin - The 4-digit PIN
 * @returns {Promise<void>}
 */
export const savePIN = async (studentId, pin) => {
  await setDoc(doc(db, 'pins', pin), {
    studentId,
    createdAt: serverTimestamp(),
    active: true
  });
};

/**
 * Validates a given PIN for child login.
 * @param {string} pin - The 4-digit PIN
 * @returns {Promise<{ valid: boolean, studentId?: string }>}
 */
export const validatePIN = async (pin) => {
  if (!pin || pin.length !== 4) return { valid: false };
  const snap = await getDoc(doc(db, 'pins', pin));
  if (snap.exists() && snap.data().active) {
    return { valid: true, studentId: snap.data().studentId };
  }
  return { valid: false };
};

/**
 * Retrieves the full student profile using their PIN.
 * Returns the profile data WITH the Firestore doc id as `studentId`.
 * @param {string} pin
 * @returns {Promise<Object|null>}
 */
export const getStudentByPIN = async (pin) => {
  const result = await validatePIN(pin);
  if (result.valid && result.studentId) {
    const profileSnap = await getDoc(doc(db, 'studentProfiles', result.studentId));
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      // Always use the Document ID as the studentId to be 100% sure
      return { 
        studentId: profileSnap.id, 
        ...data 
      };
    }
  }
  return null;
};

/**
 * Deactivates an old PIN and generates/saves a new one for the student.
 * @param {string} studentId - The student's ID
 * @param {string} [oldPin] - (Optional) The old PIN to deactivate
 * @returns {Promise<string>} The new 4-digit PIN
 */
export const regeneratePIN = async (studentId, oldPin) => {
  if (oldPin) {
    await deleteDoc(doc(db, 'pins', oldPin));
  }
  const newPin = await generatePIN();
  await savePIN(studentId, newPin);
  return newPin;
};
