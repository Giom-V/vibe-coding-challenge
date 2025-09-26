import React from 'react';
import type { ExtractedData } from '../types';
import { TaskStatus } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { MinusIcon } from './icons/MinusIcon';

interface ChecklistDisplayProps {
  data: ExtractedData;
  onTaskStatusChange: (sectionIndex: number, taskIndex: number) => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  webhookUrlSet: boolean;
}

const StatusIcon: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case TaskStatus.DONE:
      return <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />;
    case TaskStatus.NOT_DONE:
      return <XIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />;
    case TaskStatus.NOT_REQUESTED:
      return <MinusIcon className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />;
    default:
      return null;
  }
};

export const ChecklistDisplay: React.FC<ChecklistDisplayProps> = ({ 
  data, onTaskStatusChange, onSave, isSaving, saveError, saveSuccess, webhookUrlSet 
}) => {
  return (
    <div className="space-y-8 mt-8 border-t pt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Résultats de l'analyse</h2>
        {data.date && <p className="text-slate-500">Date du document: <span className="font-semibold">{data.date}</span></p>}
      </div>
      
      <div className="text-center space-y-2">
          <button
              onClick={onSave}
              disabled={isSaving || !webhookUrlSet}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
              {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder les résultats'}
          </button>
          {!webhookUrlSet && <p className="text-sm text-red-600">Veuillez renseigner l'URL du webhook pour sauvegarder.</p>}
          {saveSuccess && <p className="text-green-600 font-semibold">Résultats sauvegardés avec succès !</p>}
          {saveError && <p className="text-red-600">{saveError}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.sections.map((section, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3 border-b pb-2">{section.title}</h3>
            <ul className="space-y-3">
              {section.tasks.map((task, taskIndex) => (
                <li 
                  key={taskIndex} 
                  className="flex items-start space-x-3 p-2 rounded-md transition-colors duration-200 hover:bg-slate-200 cursor-pointer"
                  onClick={() => onTaskStatusChange(index, taskIndex)}
                  role="button"
                  aria-label={`Changer le statut de ${task.name}`}
                >
                  <StatusIcon status={task.status} />
                  <div className="flex-1">
                    <span className={`${task.status === TaskStatus.NOT_REQUESTED ? 'line-through text-slate-500' : ''}`}>
                      {task.name}
                    </span>
                    {task.notes && (
                      <p className="text-sm text-slate-600 italic pl-2 mt-1 border-l-2 border-slate-300">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {(data.extraTasks.length > 0 || data.notes.length > 0) &&
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {data.extraTasks.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 border-b border-amber-200 pb-2">Tâches supplémentaires</h3>
              <ul className="space-y-2 list-disc list-inside text-slate-700">
                {data.extraTasks.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          {data.notes.length > 0 && (
            <div className="bg-sky-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-sky-800 mb-3 border-b border-sky-200 pb-2">Notes et commentaires</h3>
               <ul className="space-y-2 list-disc list-inside text-slate-700">
                {data.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    </div>
  );
};