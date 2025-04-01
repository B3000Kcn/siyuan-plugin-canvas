<script lang="ts">
  import { referenceStore, type ReferenceItem } from '../stores';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  // Import the actual input component
  import AddDocumentInput from './AddDocumentInput.svelte'; 

  const dispatch = createEventDispatcher();

  let showAddDocInput = false;

  // Function to remove a reference by its ID
  function removeReference(idToRemove: string) {
    referenceStore.update(refs => refs.filter(ref => ref.id !== idToRemove));
  }

  function toggleAddDocInput() {
      console.log('[ReferenceContext] toggleAddDocInput called. Current showAddDocInput:', showAddDocInput);
      showAddDocInput = !showAddDocInput;
      console.log('[ReferenceContext] New showAddDocInput:', showAddDocInput);
  }

  // Handler for when the AddDocumentInput component successfully adds a reference
  function handleDocReferenceAdded(event: CustomEvent<{ docId: string; title: string }>) {
      showAddDocInput = false; // Hide the input
      dispatch('addDocumentReference', event.detail); // Bubble the event up
  }

  // Handler for when the AddDocumentInput component is cancelled
  function handleDocReferenceCancel() {
      showAddDocInput = false; // Hide the input
  }

</script>

<div class="reference-context-bar">
    <!-- Add '@' button -->
    <button class="add-doc-ref-button" title="通过文档 ID 添加引用" on:click={toggleAddDocInput}>
        @
    </button>

    {#if $referenceStore.length > 0}
      <span class="separator">|</span> <!-- Optional Separator -->
      <span>引用内容:</span>
      <div class="reference-tags">
        {#each $referenceStore as reference (reference.id)}
          <!-- {@const _ = console.log('[ReferenceContext] Rendering tag:', {id: reference.id, type: reference.type, label: reference.label})} --> <!-- Remove log -->
          <span 
            class="reference-tag" 
            class:document-reference={reference.type === 'document'}
            title={reference.label}
          >
            <!-- Wrap label text in its own span for overflow control -->
            <span class="tag-label">{reference.label}</span> 
            <button class="remove-tag-button" on:click={() => removeReference(reference.id)} title="移除引用">×</button>
          </span>
        {/each}
      </div>
    {/if}
</div>

<!-- Conditionally render the input component -->
{#if showAddDocInput}
    {@debug showAddDocInput} <!-- Svelte debug helper -->
    <!-- console.log is tricky in template, use @debug or check component rendering -->
    <AddDocumentInput 
      on:addDocumentReference={handleDocReferenceAdded}
      on:cancel={handleDocReferenceCancel}
    /> 
{/if}

<style>
  .reference-context-bar {
    padding: 5px 10px;
    background-color: var(--b3-theme-background-light);
    border-bottom: 1px solid var(--b3-theme-surface-lighter);
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 8px; 
    min-height: 30px; /* Ensure bar has height even when empty */
    /* flex-wrap: wrap; // Keep this if tags might wrap */
  }

  .add-doc-ref-button {
      background: none;
      border: 1px solid var(--b3-theme-on-surface-light);
      color: var(--b3-theme-on-surface);
      padding: 0px 6px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      line-height: 1.5;
  }
  .add-doc-ref-button:hover {
      background-color: var(--b3-theme-surface-lighter);
  }

  .separator {
      color: var(--b3-theme-surface-lighter);
  }

  .reference-context-bar span:first-of-type { /* Adjust selector if needed */
      font-weight: bold;
      color: var(--b3-theme-on-background);
      white-space: nowrap;
  }
  .reference-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap; 
      overflow: hidden; /* Prevent tags expanding bar width excessively */
      flex-shrink: 1; /* Allow tags container to shrink */
  }
  .reference-tag {
    /* Base style for all tags (used by selection tags) */
    background-color: var(--b3-theme-primary-lightest);
    color: var(--b3-theme-primary-light);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex; 
    align-items: center;
    font-size: 0.9em;
    white-space: nowrap; 
    max-width: 100px; /* Default max width for shorter tags like selections - NOW MOVED TO .tag-label */
    overflow: hidden; /* NOW MOVED TO .tag-label */
    text-overflow: ellipsis; /* NOW MOVED TO .tag-label */
    border: 1px solid transparent; 
    font-weight: normal !important; /* Explicitly set normal font weight, use !important to be sure for now */
  }

  /* NEW: Style for the inner label span */
  .tag-label {
      display: inline-block; /* Or block, depending on flex context */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle; /* Align text vertically */
      /* Max width is now controlled by the parent tag class */
  }
  /* Apply max-width based on parent tag type */
  .reference-tag:not(.document-reference) .tag-label {
      max-width: 100px; 
  }
   .reference-tag.document-reference .tag-label {
      max-width: 170px; 
  }

  /* Style overrides for document reference tags */
  .reference-tag.document-reference {
      background-color: var(--b3-theme-surface); /* More neutral background */
      color: var(--b3-theme-on-surface); /* Neutral text color */
      border: 1px solid var(--b3-theme-surface-lighter); /* Subtle border */
      max-width: unset; /* Remove max-width from tag itself, apply to inner span */
  }

  /* Keep selection tags potentially shorter (already default) */
  /* .reference-tag:not(.document-reference) {
       max-width: 100px; 
  } */

  .remove-tag-button {
    background: none;
    border: none;
    /* Default color inherits from parent tag, adjust if needed */
    color: inherit; 
    cursor: pointer;
    margin-left: 4px;
    padding: 0;
    font-size: 1.1em;
    line-height: 1; 
    font-weight: bold;
    opacity: 0.7;
  }
  .remove-tag-button:hover {
    opacity: 1;
  }

  /* Ensure button is visible on document tags */
  .reference-tag.document-reference .remove-tag-button {
      /* Explicitly set color and opacity, remove !important now */
      color: var(--b3-theme-on-surface); 
      opacity: 0.7; /* Keep base opacity */
  }
  
  /* Ensure button is also visible on base/selection tags */
   .reference-tag:not(.document-reference) .remove-tag-button {
      /* Explicitly set color and opacity, remove !important now */
      color: var(--b3-theme-primary-light);
      opacity: 0.7; /* Keep base opacity */
  }

  /* Placeholder style */
  .add-doc-placeholder {
      padding: 10px;
      font-style: italic;
      color: #888;
      background-color: #f9f9f9;
      border-bottom: 1px solid var(--b3-theme-surface-lighter);
  }

</style> 