// src/stores/settings.ts
import { writable } from 'svelte/store';
import type { AppSettings } from './types';

// Default settings
const defaultSettings: AppSettings = {
    apiKey: '',
    apiUrl: '', // e.g., 'https://api.openai.com/v1/chat/completions'
    model: 'gpt-3.5-turbo', // Default model
    temperature: 0.7,
    maxTokens: 2000,
};

// Create the writable store
export const settingsStore = writable<AppSettings>(defaultSettings);

// Optional: Functions to load/save settings can be added here or managed in index.ts
// For simplicity, we assume loading/saving is handled in index.ts for now. 