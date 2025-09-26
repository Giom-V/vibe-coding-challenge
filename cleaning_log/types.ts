export enum TaskStatus {
  DONE = 'DONE',
  NOT_DONE = 'NOT_DONE',
  NOT_REQUESTED = 'NOT_REQUESTED',
}

export interface Task {
  name: string;
  status: TaskStatus;
  notes?: string;
}

export interface ChecklistSection {
  title: string;
  tasks: Task[];
}

export interface ExtractedData {
  date: string;
  sections: ChecklistSection[];
  extraTasks: string[];
  notes: string[];
}