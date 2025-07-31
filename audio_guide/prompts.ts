
import { Duration } from './types';

export function generatePrompt(language: 'fr' | 'en', topic: string, seen: string, duration: Duration): string {
        
    const durationInstructions = {
        fr: {
            quick: "pour une discussion courte d'environ 2 minutes",
            medium: "pour une discussion de longueur moyenne d'environ 4-5 minutes",
            long: "pour une discussion longue et détaillée d'environ 8 minutes"
        },
        en: {
            quick: "for a short discussion of about 2 minutes",
            medium: "for a medium-length discussion of about 4-5 minutes",
            long: "for a long and detailed discussion of about 8 minutes"
        }
    };
    
    const langInstructions = {
        fr: {
            role: "Tu es un écrivain créatif pour les familles. Ta tâche est de générer un dialogue engageant.",
            characters: "Le dialogue se déroule entre deux parents, Claire (instruite, calme, intéressée par l'art et la nature) et Guillaume (enthousiaste, drôle, passionné d'histoire et de technologie). Ils parlent à leur fille de 10 ans, Aurore (curieuse, adore la danse et la mythologie), qui écoute mais ne parle pas.",
            context: "La famille est en vacances en voiture. Ils discutent de la prochaine chose à faire ou à voir.",
            task: `Génère un dialogue en français uniquement entre Claire et Guillaume, ${durationInstructions.fr[duration]}. Ils peuvent s'adresser à Aurore.`,
            topic: `Le sujet de la discussion est "${topic}".`,
            constraint: `Ils ont déjà vu ou fait ce qui suit : "${seen}". Évite de suggérer ces choses.`,
            style: "Le ton doit être éducatif mais amusant et léger. La conversation doit être très dynamique, avec des échanges fréquents et rapides entre les intervenants, comme une partie de ping-pong ou une discussion de podcast. Évitez les longs monologues. Claire (avec son intérêt pour l'art et la nature) et Guillaume (avec son intérêt pour l'histoire et la technologie) doivent expliquer le sujet simplement, en faisant des liens avec les centres d'intérêt d'Aurore (danse, mythologie) chaque fois que possible. Le dialogue doit piquer la curiosité d'un enfant de 10 ans.",
            format: "Formate la sortie en markdown propre. Utilise le gras pour les noms des intervenants (par ex., '**Claire:**'). N'inclus aucune réplique pour Aurore. L'ensemble de la réponse doit être du markdown valide."
        },
        en: {
            role: "You are a creative writer for families. Your task is to generate an engaging dialogue.",
            characters: "The dialogue is between two parents, Claire (knowledgeable, calm, interested in art and nature) and Guillaume (enthusiastic, funny, passionate about history and technology). They are talking to their 10-year-old daughter, Aurore (curious, loves dancing and mythology), who is listening but does not speak.",
            context: "The family is on a road trip holiday. They are discussing what to do or see next.",
            task: `Generate a dialogue in English between only Claire and Guillaume, ${durationInstructions.en[duration]}. They can address Aurore.`,
            topic: `The topic of discussion is "${topic}".`,
            constraint: `They have already seen or done the following: "${seen}". Avoid suggesting these.`,
            style: "The tone should be educational but fun and lighthearted. The conversation must be very dynamic, with frequent and rapid back-and-forths between speakers, like a ping-pong match or a podcast discussion. Avoid long monologues. Claire (with her interest in art and nature) and Guillaume (with his interest in history and technology) should explain the topic simply, making connections to Aurore's interests (dancing, mythology) whenever possible. The dialogue should spark curiosity in a 10-year-old.",
            format: "Format the output as clean markdown. Use bold for speaker names (e.g., '**Claire:**'). Do not include any lines for Aurore. The entire response must be valid markdown."
        }
    };

    const instructions = langInstructions[language];
    let prompt = `${instructions.role}\n${instructions.characters}\n${instructions.context}\n${instructions.task}\n${instructions.topic}\n`;

    if (seen && seen.trim() !== '') {
        prompt += `${instructions.constraint}\n`;
    }

    prompt += `${instructions.style}\n${instructions.format}`;

    return prompt;
}

export function generateTtsPrompt(language: 'fr' | 'en', plainText: string): string {
    const ttsInstructions = {
        fr: `TTS la conversation suivante.
Faites en sorte que Claire ait l'air calme et bien informée.
Faites en sorte que Guillaume ait l'air enthousiaste et drôle.
La conversation est :
${plainText}`,
        en: `TTS the following conversation.
Make Claire sound calm and knowledgeable.
Make Guillaume sound enthusiastic and funny.
The conversation is:
${plainText}`
    };

    return ttsInstructions[language];
}