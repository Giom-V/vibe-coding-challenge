import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    date: { 
      type: Type.STRING, 
      description: "La date trouvée sur le document, ex: '1/9/2025'. Si aucune date, utiliser la date du jour." 
    },
    sections: {
      type: Type.ARRAY,
      description: "Un tableau des sections de la checklist.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Le titre de la section, ex: 'Salle de bains étage'." },
          tasks: {
            type: Type.ARRAY,
            description: "Un tableau des tâches dans cette section.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Le nom de la tâche." },
                status: { 
                  type: Type.STRING, 
                  enum: ['DONE', 'NOT_DONE', 'NOT_REQUESTED'], 
                  description: "Statut de la tâche. 'NOT_REQUESTED' si la tâche est barrée/rayée. 'DONE' si la tâche est cochée. 'NOT_DONE' si la case est vide et que la tâche n'est pas barrée." 
                },
                notes: {
                  type: Type.STRING,
                  description: "Toute note manuscrite spécifiquement associée à cette tâche. Omettre s'il n'y a pas de note pour cette tâche."
                }
              },
              required: ['name', 'status']
            }
          }
        },
        required: ['title', 'tasks']
      }
    },
    extraTasks: {
      type: Type.ARRAY,
      description: "Une liste des tâches manuscrites ajoutées à la checklist qui ne sont pas liées à une tâche existante.",
      items: { type: Type.STRING }
    },
    notes: {
      type: Type.ARRAY,
      description: "Toutes les autres notes manuscrites ou commentaires généraux qui ne sont pas liés à une tâche spécifique.",
      items: { type: Type.STRING }
    }
  },
  required: ['date', 'sections', 'extraTasks', 'notes']
};

const CHECKLIST_REFERENCE = `
Voici la liste de référence des tâches attendues. Utilise-la pour corriger toute erreur de reconnaissance de texte et pour structurer ta réponse. Les noms des tâches dans ta sortie JSON DOIVENT correspondre exactement à ceux de cette liste. Certains actions sont classées "compléments" sur la feuille parce qu'ils sont à faire après le reste, mais essaye plutôt de suivre le classement par pièce ci-dessous:

# Salle de bains étage
- Lavabos & robinets
- Miroirs
- Baignoire & vitre
- Poubelle

# Toilettes étage
- Cuvette & abattant
- Poubelle

# Salle de douche étage
- Lavabo & robinets
- Miroir
- Poubelle
- Douche

# Escalier
- Balayer

# Toilettes RDC
- Cuvette & abattant
- Lavabo & robinets
- Poubelle

# Cuisine
- Evier, égouttoir & robinet
- Plan de travail
- Table
- Plaques de cuisson
- Micro-ondes
- Poubelles
- Fenêtre
- Filtre lave-vaiselle
- Frigo (dans compléments "nettoyer le frigo")
- Façades meubles (dans compléments "nettoyer les façades des placards de la cuisine")

# Salon
- Poussière
- Tables basses

# Arrière-cuisine
- Evier

# Chambre
- Miroirs

# Escalier sous-sol
- Balayer

# Complements
- Aspirateur coins et plinthes
- Vitres fenêtre
- Vitre baies vitrées
- Velux
- Repassage

Si quelque chose a été ajouté (mais pas de façon manuscripte, ça c'Est les extra-tasks), renvoie son intitulé complet. Inversement si une ligne n'apparaît pas sur la photo, pas besoin de la lister, ignore-la.
Ignore "passer la balayette sur les plaintes si cela est marqué, il s'agissait d'une erreur.
`;


export const analyzeChecklistImage = async (imageBase64: string, mimeType: string): Promise<ExtractedData> => {
    const prompt = `Analyser l'image fournie d'une checklist de nettoyage en français. Extraire toutes les informations imprimées et manuscrites.

${CHECKLIST_REFERENCE}

La règle la plus importante est de bien classifier le statut de chaque tâche. Voici les règles précises à suivre impérativement :
1.  **NOT_REQUESTED**: Si une tâche est barrée ou rayée (même légèrement), son statut est 'NOT_REQUESTED'. C'est le cas pour les tâches que le propriétaire ne veut pas faire cette semaine.
2.  **DONE**: Si une tâche est cochée (avec un ✓ ou un X, généralement en vert), son statut est 'DONE'.
3.  **NOT_DONE**: Si une tâche n'est NI barrée, NI cochée (la case est simplement vide), son statut est 'NOT_DONE'. C'est une tâche qui était demandée mais n'a pas été faite.
si tu as un doute entre NOT_REQUESTED et NOT_DONE, choisis NOT_REQUESTED.

Appliquer ces règles rigoureusement pour chaque item de la liste.

Point crucial : si une note **manuscrite** est visuellement liée à une tâche spécifique (par exemple, avec une flèche ou en étant écrite à côté), associer cette note à la tâche dans le champ 'notes' de la tâche. Par exemple, une note comme "passer balayette ou petit aspirateur" à côté de "Utiliser l'aspirateur à main pour les coins et les plinthes" doit être liée à cette tâche. Pas besoin de lister ce qui est entre parenthèses et non manuscript.
Les notes générales non liées à une tâche spécifique doivent être placées dans le tableau global 'notes'.
Fournir la sortie dans un format JSON structuré conforme au schéma. La langue des tâches et des notes doit être conservée en français.
ATTENTION : Assurez-vous que la sortie JSON est complète et ne tronque aucune tâche. Vérifiez bien que la toute dernière tâche de chaque section est incluse dans le résultat.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as ExtractedData;
        
        // Basic validation
        if (!parsedData || !Array.isArray(parsedData.sections)) {
            throw new Error("Structure de données invalide reçue de l'IA.");
        }
        
        return parsedData;

    } catch (error) {
        console.error("Erreur lors de l'analyse de l'image avec l'API Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Erreur API Gemini: ${error.message}`);
        }
        throw new Error("Une erreur inconnue est survenue lors de la communication avec l'IA.");
    }
};