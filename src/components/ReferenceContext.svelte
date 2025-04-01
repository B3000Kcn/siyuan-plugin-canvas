<script lang="ts">
  import { referenceStore, type ReferenceItem } from '../stores';
  import { get } from 'svelte/store';

  // Function to remove a reference by its ID
  function removeReference(idToRemove: string) {
    referenceStore.update(refs => refs.filter(ref => ref.id !== idToRemove));
  }
</script>

{#if $referenceStore.length > 0}
  <div class="reference-context-bar">
    <span>引用内容:</span>
    <div class="reference-tags">
      {#each $referenceStore as reference (reference.id)}
        <span class="reference-tag">
          {reference.label}
          <!-- Only allow removing selection references for now -->
          {#if reference.type === 'selection'}
            <button class="remove-tag-button" on:click={() => removeReference(reference.id)} title="移除引用">×</button>
          {/if}
        </span>
      {/each}
    </div>
  </div>
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
    flex-wrap: wrap; /* Allow tags to wrap */
  }
  .reference-context-bar span:first-child {
      font-weight: bold;
      color: var(--b3-theme-on-background);
  }
  .reference-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap; 
  }
  .reference-tag {
    background-color: var(--b3-theme-primary-lightest);
    color: var(--b3-theme-primary-light); 
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex; /* Use inline-flex for button alignment */
    align-items: center;
    font-size: 0.9em;
    white-space: nowrap; /* Prevent tag text from wrapping */
  }
  .remove-tag-button {
    background: none;
    border: none;
    color: var(--b3-theme-primary-light);
    cursor: pointer;
    margin-left: 4px;
    padding: 0;
    font-size: 1.1em;
    line-height: 1; 
    font-weight: bold;
  }
  .remove-tag-button:hover {
    color: var(--b3-theme-primary-dark);
  }
</style> 