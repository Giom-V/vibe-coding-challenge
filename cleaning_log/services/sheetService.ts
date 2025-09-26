import type { ExtractedData } from '../types';

export const saveDataToSheet = async (webhookUrl: string, data: ExtractedData): Promise<void> => {
  console.log("Sending data via webhook:", JSON.stringify(data));
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script webhooks often prefer text/plain for postData
      },
      body: JSON.stringify(data),
      mode: 'no-cors' // Use no-cors mode as Apps Script webhooks don't typically handle preflight OPTIONS requests well
    });
    
    // In 'no-cors' mode, we can't inspect the response. 
    // We optimistically assume success if the request doesn't throw an error.
    // The actual success/failure is handled by the user seeing the data in the sheet.
    
  } catch (error) {
    console.error("Erreur lors de l'envoi des données au webhook:", error);
    if (error instanceof Error) {
        throw new Error(`La communication avec le webhook a échoué. Vérifiez l'URL et votre connexion. Détails: ${error.message}`);
    }
    throw new Error("Une erreur réseau inconnue est survenue lors de la sauvegarde.");
  }
};