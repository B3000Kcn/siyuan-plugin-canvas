// src/stores/conversations.ts
import { writable } from 'svelte/store';
import type { SavedConversation } from './types';

// Create the writable store for saved conversations
export const conversationsStore = writable<SavedConversation[]>([]);

// Optional: Functions to load/save conversations can be added here or managed elsewhere
// For example, loading from plugin.loadData() in index.ts or AIChatPanel.svelte 