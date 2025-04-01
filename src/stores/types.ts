// src/stores/types.ts

// Settings for the AI Assistant
export interface AppSettings {
    apiUrl: string;
    apiKey: string;
    model: string; 
    temperature: number;
    maxTokens: number;
    // Add other settings as needed
}

// Structure for a single chat message
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    // Optional: Add other fields like timestamp if needed
}

// Structure for saving a conversation
export interface SavedConversation {
    id: string; // Typically a timestamp or unique ID
    title: string; // Maybe the first user message or a generated title
    timestamp: number;
    messages: ChatMessage[];
} 