<script lang="ts">
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import { markdownToHtml } from '../utils/markdown'; // For error messages

  const dispatch = createEventDispatcher();

  let docIdInput = '';
  let isFetchingTitle = false;
  let errorMessage = '';

  // Function to fetch document title (moved from AIChatPanel)
  async function fetchDocTitle(docId: string): Promise<string | null> {
    console.log(`[AddDocumentInput] Fetching title for docId: ${docId}`);
    errorMessage = ''; // Clear previous error
    isFetchingTitle = true;

    try {
        const response = await fetch('/api/block/getBlockInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: docId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API getBlockInfo failed (${response.status}): ${errorText}`);
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error(`API getBlockInfo returned error code ${result.code}: ${result.msg}`);
        }

        // Check for actual title fields, prioritizing 'rootTitle', then 'title', 'content', 'name'
        let title: string | undefined | null = null;
        if (result.data?.rootTitle) { // Check rootTitle first!
            title = result.data.rootTitle;
        } else if (result.data?.title) { // Explicit title field?
            title = result.data.title;
        } else if (result.data?.content) { // Content for documents (maybe subtitle or first line?)
            title = result.data.content;
        } else if (result.data?.name) { // Name as fallback (e.g., for assets)
            title = result.data.name;
        }

        if (title) {
            console.log(`[AddDocumentInput] Fetched title: '${title}' for ID: ${docId}`);
            return title;
        } else {
            // Title field not found in the response
            console.warn(`[AddDocumentInput] Title field (rootTitle, title, content or name) not found in getBlockInfo response for ID: ${docId}. Data:`, result.data);
            throw new Error('未能从 API 响应中找到文档标题。'); // Treat as error if title field is missing
        }

    } catch (error) {
        console.error(`[AddDocumentInput] Error fetching title for ${docId}:`, error);
        errorMessage = `获取文档标题失败 (ID: ${docId}): ${error.message}`;
        return null; // Indicate failure
    } finally {
      isFetchingTitle = false;
    }
  }

  // Function to handle the 'Add' button click
  async function handleAddClick() {
    const trimmedId = docIdInput.trim();
    if (!trimmedId || isFetchingTitle) return;

    const fetchedTitle = await fetchDocTitle(trimmedId);

    if (fetchedTitle !== null) {
      // Dispatch the success event with the data
      dispatch('addDocumentReference', {
        docId: trimmedId,
        title: fetchedTitle,
      });
      // No need to hide here, parent (ReferenceContext) will hide on receiving event
      docIdInput = ''; // Clear input on success
    } else {
      // Error message is already set by fetchDocTitle
      console.error('[AddDocumentInput] Title fetch failed, not dispatching event.');
    }
  }

  // Function to handle the 'Cancel' button click
  function handleCancelClick() {
    dispatch('cancel'); // Dispatch cancel event
    docIdInput = ''; // Clear input
    errorMessage = ''; // Clear error
  }

  // Focus the input when the component mounts
  onMount(() => {
    const inputElement = document.getElementById('doc-id-input-field');
    inputElement?.focus();
  });

</script>

<div class="add-document-input-container">
  <input 
    type="text" 
    id="doc-id-input-field" 
    bind:value={docIdInput} 
    placeholder="输入要引用的文档 ID..." 
    disabled={isFetchingTitle}
    on:keydown={(e) => { if (e.key === 'Enter') handleAddClick(); if (e.key === 'Escape') handleCancelClick(); }}
  />
  <button on:click={handleAddClick} disabled={!docIdInput.trim() || isFetchingTitle}>
    {#if isFetchingTitle}正在获取...{:else}添加{/if}
  </button>
  <button on:click={handleCancelClick} disabled={isFetchingTitle} class="cancel-button">
    取消
  </button>
  {#if errorMessage}
    <div class="error-message" role="alert">
      {@html markdownToHtml(errorMessage)}
    </div>
  {/if}
</div>

<style>
  .add-document-input-container {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 10px;
    background-color: var(--b3-theme-surface-lighter); /* Slightly different background */
    border-bottom: 1px solid var(--b3-theme-surface-lighter);
  }
  input[type="text"] {
    flex-grow: 1;
    padding: 4px 6px;
    border: 1px solid var(--b3-theme-surface-light);
    border-radius: 3px;
  }
  button {
    padding: 4px 8px;
    cursor: pointer;
    background-color: var(--b3-theme-primary);
    color: white;
    border: none;
    border-radius: 3px;
    white-space: nowrap;
  }
  button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
  }
  button:hover:not(:disabled) {
      opacity: 0.9;
  }
  .cancel-button {
    background-color: var(--b3-theme-secondary); /* Different color for cancel */
  }
  .error-message {
      margin-left: 10px;
      color: var(--b3-theme-error);
      font-size: 0.9em;
      flex-basis: 100%; /* Allow error to wrap below */
      margin-top: 5px; /* Add some space when wrapped */
  }
  /* Ensure container allows wrapping if error message appears */
  .add-document-input-container {
      flex-wrap: wrap;
  }
</style> 