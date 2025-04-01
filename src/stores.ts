import { writable } from 'svelte/store';

// --- App Settings Store ---
export interface AppSettings {
    apiKey: string;
    modelName: string;
    // Add other settings as needed
}

export const settingsStore = writable<AppSettings>({ 
    apiKey: '', 
    modelName: 'deepseek-chat' // Default model
});

// --- Saved Conversations Store ---
export interface SavedConversation {
    id: string;
    name: string;
    timestamp: number;
    messages: ChatMessage[]; // Use the ChatMessage type defined below
}

export const conversationsStore = writable<SavedConversation[]>([]);

// --- Current Document Context Stores ---
export const currentDocumentIdStore = writable<string | null>(null); // Store for document ID
export const currentDocumentPathStore = writable<string | null>(null); // Store for document path

// --- Base Chat Message Type ---
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// --- Store for References ---
export interface ReferenceItem {
  id: string; // Unique ID for the reference tag
  label: string; // Display label (e.g., "Selection 1", "Block 3-5")
  blockIds: string[]; // Array of Siyuan block IDs included in this reference
  type: 'selection' | 'document'; // Type of reference
}

export const referenceStore = writable<ReferenceItem[]>([]);
