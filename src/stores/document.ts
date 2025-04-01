import { writable } from 'svelte/store';

// Store for the current document ID
export const currentDocumentIdStore = writable<string | null>(null);

// Store for the current document Path
export const currentDocumentPathStore = writable<string | null>(null); 