/*
  INSTRUCTIONS D'INSTALLATION (à faire une seule fois) :

  1.  OUVRIR VOTRE GOOGLE SHEET :
      Créez ou ouvrez la feuille de calcul Google où vous souhaitez sauvegarder les données.

  2.  OUVRIR L'ÉDITEUR APPS SCRIPT :
      Dans le menu, allez dans "Extensions" > "Apps Script". Une nouvelle fenêtre d'éditeur s'ouvrira.

  3.  COPIER-COLLER CE SCRIPT :
      Effacez tout le code qui se trouve dans l'éditeur (souvent une fonction `myFunction` vide).
      Copiez l'intégralité du contenu de ce fichier et collez-le dans l'éditeur.

  4.  SAUVEGARDER LE PROJET :
      Cliquez sur l'icône de disquette "Enregistrer le projet" en haut de l'éditeur.

  5.  DÉPLOYER LE SCRIPT EN TANT QU'APPLICATION WEB :
      a. Cliquez sur le bouton bleu "Déployer" en haut à droite, puis sur "Nouveau déploiement".
      b. À côté de "Sélectionner le type", cliquez sur l'icône d'engrenage (⚙️) et choisissez "Application web".
      c. Dans la configuration :
          - Description : "Webhook pour Checklist AI" (ou ce que vous voulez).
          - Exécuter en tant que : "Moi (votre.email@gmail.com)".
          - Qui a accès : **IMPORTANT :** Sélectionnez "Tout le monde".
      d. Cliquez sur "Déployer".

  6.  AUTORISER LE SCRIPT :
      Google vous demandera d'autoriser le script à accéder à vos feuilles de calcul. Suivez les étapes pour l'autoriser.
      (Il se peut que vous deviez cliquer sur "Paramètres avancés" puis "Accéder à [nom du projet] (non sécurisé)" - c'est normal car votre script n'a pas été vérifié par Google).

  7.  COPIER L'URL DU WEBHOOK :
      Une fois le déploiement terminé, une fenêtre apparaîtra avec une "URL de l'application web". Copiez cette URL.
      C'est votre URL de webhook.

  8.  CONFIGURER L'APPLICATION :
      Ouvrez le fichier `config.json` dans le dossier de l'application et collez cette URL comme valeur pour la clé "webhookUrl".

  Votre configuration est terminée !
*/

// Nom de l'onglet que le script utilisera. S'il n'existe pas, il sera créé.
const SHEET_NAME = "Checklist";

/**
 * Fonction utilitaire robuste pour convertir une date en objet Date JavaScript.
 * Gère les chaînes de caractères au format "JJ/MM/AAAA" et les objets Date natifs de Google Sheets.
 * @param {string|Date} dateInput La date en chaîne de caractères ou objet.
 * @returns {Date | null} L'objet Date correspondant, ou null si invalide.
 */
function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  }
  if (!dateInput || typeof dateInput !== 'string') return null;
  const parts = dateInput.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[0], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

function doPost(e) {
  try {
    Logger.log("--- Nouvelle requête reçue ---");
    
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Aucune donnée reçue (postData manquant).");
    }
    
    const postContents = e.postData.contents;
    const data = JSON.parse(postContents);
    Logger.log(`Données JSON analysées. Date: ${data.date}`);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Si la feuille n'existe pas, ou si elle existe mais est vide, on la prépare.
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange("A1").setValue("Tâche").setFontWeight("bold");
      SpreadsheetApp.flush(); // S'assurer que les modifications sont appliquées avant de continuer
      Logger.log(`Feuille de calcul "${SHEET_NAME}" créée et en-tête ajouté.`);
    } else if (sheet.getLastRow() === 0) {
      sheet.getRange("A1").setValue("Tâche").setFontWeight("bold");
      SpreadsheetApp.flush();
      Logger.log(`Feuille de calcul trouvée vide. En-tête "Tâche" ajouté.`);
    }

    const dateStr = data.date || new Date().toLocaleDateString('fr-FR');
    const newDateObj = parseDate(dateStr);
    if (!newDateObj) {
      throw new Error(`Format de date invalide reçu: ${dateStr}`);
    }

    const statusMap = { 'DONE': 'Fait', 'NOT_DONE': 'Non Fait', 'NOT_REQUESTED': 'Non Demandé' };

    const headersRange = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
    const headers = headersRange.getValues()[0];
    let dateColumn = -1;

    // Compare les dates en objets Date pour être insensible au formatage
    for (let i = 1; i < headers.length; i++) {
        const headerDateObj = parseDate(headers[i]);
        if (headerDateObj && headerDateObj.getTime() === newDateObj.getTime()) {
            dateColumn = i + 1;
            break;
        }
    }

    if (dateColumn > 0) {
      Logger.log(`Colonne existante trouvée pour la date "${dateStr}" à la position ${dateColumn}.`);
      sheet.getRange(2, dateColumn, sheet.getMaxRows() - 1, 1).clearContent().clearNote();
    } else {
      let insertAtColumn = -1;
      // Trouve où insérer la nouvelle colonne pour garder l'ordre chronologique
      for (let i = 1; i < headers.length; i++) {
        const headerDateObj = parseDate(headers[i]);
        if (headerDateObj && newDateObj.getTime() < headerDateObj.getTime()) {
          insertAtColumn = i + 1;
          break;
        }
      }
      
      if (insertAtColumn > 0) {
        sheet.insertColumnBefore(insertAtColumn);
        dateColumn = insertAtColumn;
      } else {
        // Si non insérée, c'est la plus récente, on l'ajoute à la fin
        dateColumn = sheet.getLastColumn() + 1;
      }
      // Formate la date pour un affichage cohérent
      sheet.getRange(1, dateColumn).setValue(newDateObj).setNumberFormat("dd/MM/yyyy").setFontWeight('bold');
    }

    const allTasks = [];
    data.sections.forEach(section => {
       section.tasks.forEach(task => {
           allTasks.push({ name: `${section.title} - ${task.name}`, status: statusMap[task.status] || task.status, notes: task.notes || '' });
       });
    });

    // --- NOUVELLE LOGIQUE ROBUSTE POUR AJOUTER/TROUVER DES TÂCHES ---
    const lastRow = sheet.getLastRow();
    const taskColumnValues = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat() : [];
    
    // Crée un index (Map) des tâches existantes et de leur numéro de ligne
    const taskMap = new Map();
    taskColumnValues.forEach((name, index) => {
      taskMap.set(name, index + 2); // +2 car les données commencent à la ligne 2
    });

    allTasks.forEach(task => {
        let taskRow = taskMap.get(task.name);

        if (!taskRow) { // La tâche est nouvelle
            sheet.appendRow([task.name]); // Ajoute la tâche à la fin de la feuille de manière sécurisée
            taskRow = sheet.getLastRow(); // Récupère le numéro de la ligne qui vient d'être créée
            taskMap.set(task.name, taskRow); // Met à jour notre map pour cette exécution
            Logger.log(`Nouvelle tâche "${task.name}" ajoutée à la ligne ${taskRow}.`);
        }
        
        const cell = sheet.getRange(taskRow, dateColumn);
        cell.setValue(task.status);
        cell.clearNote();
        if (task.notes) {
          cell.setNote(task.notes);
        }
    });
    
    // --- LOGIQUE ROBUSTE POUR LES NOTES ET TÂCHES SUPPLÉMENTAIRES ---
    SpreadsheetApp.flush(); // S'assurer que toutes les tâches sont bien écrites avant de chercher les dernières lignes
    const specialSections = [
        { label: "Tâches Supplémentaires", data: data.extraTasks },
        { label: "Notes Générales", data: data.notes }
    ];

    const allColumnAValues = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
    const labelMap = new Map(allColumnAValues.map((label, index) => [label, index + 1]));
    
    specialSections.forEach(section => {
        if (section.data && section.data.length > 0) {
            let labelRow = labelMap.get(section.label);
            if (!labelRow) {
                // Si la dernière ligne n'est pas vide, ajoute un espaceur
                if (sheet.getLastRow() > 0 && sheet.getRange(sheet.getLastRow(), 1).getValue() !== '') {
                  sheet.appendRow(['']); 
                }
                sheet.appendRow([section.label]);
                labelRow = sheet.getLastRow();
                sheet.getRange(labelRow, 1).setFontWeight('bold');
                labelMap.set(section.label, labelRow);
            }
            sheet.getRange(labelRow, dateColumn).setValue(section.data.join('\n'));
        }
    });

    Logger.log("--- Exécution terminée avec succès ---");
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`!!! ERREUR D'EXÉCUTION: ${error.message} \nStack: ${error.stack}`);
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
