import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ChecklistDisplay } from './components/ChecklistDisplay';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import type { ExtractedData } from './types';
import { TaskStatus } from './types';
import { analyzeChecklistImage } from './services/geminiService';
import { saveDataToSheet } from './services/sheetService';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('./config.json');
        if (!response.ok) {
          throw new Error(`Impossible de charger le fichier de configuration (statut: ${response.status})`);
        }
        const config = await response.json();
        if (config.webhookUrl && typeof config.webhookUrl === 'string' && config.webhookUrl.trim() !== '') {
          setWebhookUrl(config.webhookUrl);
        } else {
          setConfigError("Action requise : Le fichier config.json ne contient pas de clé 'webhookUrl' valide. Veuillez y ajouter l'URL de votre Google Apps Script pour activer la sauvegarde.");
        }
      } catch (e) {
        setConfigError("Action requise : Impossible de charger ou d'analyser le fichier config.json. Assurez-vous qu'il existe à la racine du projet et qu'il est bien formaté.");
        console.error(e);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleImageSelect = useCallback((file: File | null) => {
    setImageFile(file);
    setExtractedData(null);
    setError(null);
    setSaveError(null);
    setSaveSuccess(false);
  }, []);
  
  const performAnalysis = useCallback(async (): Promise<ExtractedData | null> => {
     if (!imageFile) {
      setError("Veuillez d'abord sélectionner une image.");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error("La lecture du fichier image a échoué."));
        reader.readAsDataURL(imageFile);
      });
      
      const data = await analyzeChecklistImage(base64String, imageFile.type);
      setExtractedData(data);
      return data;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Une erreur inconnue est survenue.";
      setError(`L'analyse a échoué : ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleSaveResults = useCallback(async (dataToSave: ExtractedData) => {
    if (!webhookUrl) {
      setSaveError("La sauvegarde est désactivée car l'URL du webhook n'est pas configurée dans config.json.");
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await saveDataToSheet(webhookUrl, dataToSave);
      setSaveSuccess(true);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Une erreur inconnue est survenue.";
      setSaveError(`La sauvegarde a échoué : ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [webhookUrl]);

  const handleAnalyzeAndSave = async () => {
    const analysisResult = await performAnalysis();
    if (analysisResult) {
      await handleSaveResults(analysisResult);
    }
  };

  const handleTaskStatusChange = useCallback((sectionIndex: number, taskIndex: number) => {
    setExtractedData(prevData => {
      if (!prevData) return null;

      const newData = JSON.parse(JSON.stringify(prevData)) as ExtractedData;
      
      const task = newData.sections[sectionIndex]?.tasks[taskIndex];
      if (!task) return prevData;

      const statusCycle: TaskStatus[] = [
        TaskStatus.DONE,
        TaskStatus.NOT_DONE,
        TaskStatus.NOT_REQUESTED,
      ];

      const currentStatusIndex = statusCycle.indexOf(task.status);
      const nextStatusIndex = (currentStatusIndex + 1) % statusCycle.length;
      task.status = statusCycle[nextStatusIndex];
      
      setSaveSuccess(false); // Reset success message on edit
      return newData;
    });
  }, []);

  const canAnalyze = !imageFile || isLoading || isSaving;

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <p className="text-slate-600 text-center">
            Prenez une photo de votre checklist ou téléchargez-la. Notre IA l'analysera, puis vous pourrez la sauvegarder dans votre Google Sheet.
          </p>
          
          <ImageUploader onImageSelect={handleImageSelect} disabled={isLoading || isSaving} />
          
          {configError && !isConfigLoading && <ErrorMessage message={configError} />}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={performAnalysis}
              disabled={canAnalyze}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Analyse en cours...' : 'Analyser la checklist'}
            </button>
            <button
              onClick={handleAnalyzeAndSave}
              disabled={canAnalyze || !webhookUrl}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {(isLoading || isSaving) ? 'Opération en cours...' : 'Analyser et Sauvegarder'}
            </button>
          </div>
          
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}

          {extractedData && !isLoading && (
            <ChecklistDisplay 
              data={extractedData} 
              onTaskStatusChange={handleTaskStatusChange}
              onSave={() => handleSaveResults(extractedData)}
              isSaving={isSaving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              webhookUrlSet={!!webhookUrl}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;