<script lang="ts">
  import { onMount, tick } from 'svelte'; // 导入 onMount 和 tick
  import { settingsStore, conversationsStore, currentDocumentIdStore, currentDocumentPathStore, referenceStore, type AppSettings, type SavedConversation, type ChatMessage, type ReferenceItem } from '../stores'; // <-- 导入 store 和类型
  import { onDestroy } from 'svelte'; // 需要 onDestroy 来取消订阅
  import { fetchChatCompletion } from '../utils/api';
  import { markdownToHtml } from '../utils/markdown'; // 引入 markdown 转换函数
  import { writable, get } from 'svelte/store'; // 引入 get
  import ReferenceContext from './ReferenceContext.svelte'; // <-- 导入引用栏组件

  // Define constants
  const MAX_HISTORY_MESSAGES = 20; // Maximum number of messages (user + assistant) to keep in history for context
  const ACTIVE_CONVERSATION_KEY = 'activeUnsavedConversation'; // Key for persisting active chat
  const SAVE_ACTIVE_DEBOUNCE_MS = 1500; // Debounce time for saving active chat

  // --- Props --- 
  export let pluginData: {
      saveConversations: (conversations: SavedConversation[]) => Promise<void>;
      // Assume these are provided by index.ts via Siyuan's API
      saveData: (key: string, data: any) => Promise<void>; 
      loadData: (key: string) => Promise<any>; 
  };
  export let initialActiveMessages: DisplayChatMessage[] | null = null; // Messages loaded from storage by index.ts

  // 消息类型定义
  interface ChatMessage {
    id: number; // 用于 #each key
    sender: 'user' | 'ai' | 'error'; // 添加 error 类型
    text: string;
    isLoading?: boolean; // AI 消息加载状态
  }

  // --- 状态变量 --- 
  // 为组件内的消息对象添加可选的 html 属性
  type DisplayChatMessage = {
    id: string; // Add unique ID for keying
    role: 'system' | 'user' | 'assistant';
    content: string;
    html?: string; // Optional pre-rendered HTML for assistant messages
  };
  let messages = writable<DisplayChatMessage[]>([]);
  let userInput = '';
  let chatHistoryElement: HTMLElement; // 用于绑定聊天记录 div
  let nextId = 1; // 用于生成消息 ID
  let isLoading = false; // 添加加载状态
  let currentSettings: AppSettings; // 用于存储从 store 获取的设置
  let savedConversations: SavedConversation[] = []; // 从 store 获取的已保存对话列表
  let currentConversationId: string | null = null; // 当前对话的 ID，null 表示新对话
  let currentDocId: string | null = null; // 新增：存储当前文档 ID
  let currentDocPath: string | null = null; // Add state for path
  let errorMessage = '';
  let selectedBlockIds: string[] = []; // Store IDs of currently selected blocks in editor
  let canAddReference = false; // Control the state of the Add Reference button
  let debounceTimeout: number | null = null; // <-- Add debounce timer variable
  let showHistory = false; // Control visibility of history list
  let debounceSaveActiveTimeout: number | null = null; // Timer for debouncing active state save

  // --- State for Custom Context Menu ---
  let showContextMenu = false;
  let contextMenuTop = 0;
  let contextMenuLeft = 0;
  let contextTargetMessageId: string | null = null;

  // 订阅 store
  const settingsUnsubscribe = settingsStore.subscribe(value => {
      currentSettings = value;
  });
  const conversationsUnsubscribe = conversationsStore.subscribe(value => {
      savedConversations = value.sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序
  });
  const currentDocIdUnsubscribe = currentDocumentIdStore.subscribe(value => {
      currentDocId = value;
      // 可选：在此处添加 UI 提示，告知用户当前上下文文档已更改
      // console.log("AIChatPanel aware of currentDocId:", currentDocId);
  });
  const currentDocPathUnsubscribe = currentDocumentPathStore.subscribe(value => {
    currentDocPath = value;
  });
  const referenceUnsubscribe = referenceStore.subscribe(value => {
    // No need to handle reference store changes in this component
  });
  // 注意：在 Svelte 组件的 <script> 顶层订阅 store 会自动处理取消订阅
  // 如果在 onMount 或其他函数内部订阅，需要在 onDestroy 中取消订阅

  // Component mounted
  onMount(async () => {
      console.log("[onMount] Component mounted. Initial active messages prop:", JSON.stringify(initialActiveMessages)); // Log received prop data
      if (initialActiveMessages && initialActiveMessages.length > 1) { // Check length > 1 to avoid just initial prompt
          console.log("[onMount] Loading persisted active conversation state.");
          // Ensure messages have HTML rendered if they are assistant messages
          messages.set(initialActiveMessages.map(msg => ({
              ...msg,
              html: msg.role === 'assistant' ? markdownToHtml(msg.content) : undefined
          })));
          currentConversationId = null; // Explicitly mark as unsaved active conversation
          nextId = initialActiveMessages.length; // Adjust nextId if needed
      } else {
          console.log("[onMount] No persisted active state found or invalid, starting fresh.");
          // Add initial assistant message if no active state loaded
          const initialText = '有什么可以帮您？';
          messages.set([{ 
              id: Date.now().toString() + 'init', // Give it an ID
              role: 'assistant', 
              content: initialText, 
              html: markdownToHtml(initialText) 
          }]);
          currentConversationId = null;
      }
      
      // loadConversationsFromStorage(); // This loads the SAVED list, keep it
      await tick(); // Wait for initial message render
      scrollToBottom();

      // Listen for selection changes on the document
      document.addEventListener('selectionchange', handleSelectionChange);
  });

  onDestroy(() => {
      // Cancel any pending debounced save
      if (debounceSaveActiveTimeout) {
          clearTimeout(debounceSaveActiveTimeout);
          console.log('[onDestroy] Cleared pending debounced active state save.');
      }
      // Attempt one final save of the active state synchronously (or as close as possible)
      if (currentConversationId === null && get(messages).length > 1) {
          console.log('[onDestroy] Attempting final save of active conversation state...');
          const finalMessages = get(messages);
          console.log(`[onDestroy] Final save data (${finalMessages.length} messages):`, JSON.stringify(finalMessages)); // Log final data
          // Note: Await might not fully complete on hard exit, but it's the best effort
          pluginData.saveData(ACTIVE_CONVERSATION_KEY, finalMessages)
              .then(() => console.log('[onDestroy] Final active state save attempt finished.')) // Log completion
              .catch(err => console.error('[onDestroy] Error during final active state save:', err));
      } else {
          // If it's a saved conversation or empty, ensure the active state is cleared
          console.log('[onDestroy] Clearing active conversation state as it was saved or empty.');
          pluginData.saveData(ACTIVE_CONVERSATION_KEY, null)
               .catch(err => console.error('[onDestroy] Error clearing active state on destroy:', err));
      }

      // --- Auto-save current unsaved conversation on destroy ---
      if (!currentConversationId && get(messages).length > 1) {
          console.log('[onDestroy] Auto-saving current unsaved conversation...');
          // Note: saveCurrentConversation is async, completion not guaranteed on hard exit,
          // but Siyuan's plugin lifecycle might handle data saving gracefully.
          saveCurrentConversation(); 
      }
      // --- End auto-save ---

      settingsUnsubscribe(); // 取消订阅
      conversationsUnsubscribe();
      currentDocIdUnsubscribe(); // <-- 取消订阅文档 ID
      currentDocPathUnsubscribe();
      // Remove event listener
      document.removeEventListener('selectionchange', handleSelectionChange);
      hideContextMenu(); // Hide context menu on component destruction
  });

  // --- 对话管理函数 --- 
  // 开始新对话
  async function newConversation() {
      // Save previous *named* conversation if needed (existing logic?)
      // We don't need to auto-save the *unsaved* one here anymore, 
      // as the reactive block handles ongoing saves, and onDestroy handles the exit.
      
      console.log("[newConversation] Starting new conversation.");
      const initialText = '新对话已开始，有什么可以帮您？';
      const initialHtml = markdownToHtml(initialText); 
      messages.set([{
          id: Date.now().toString() + 'init-new', // Use a new unique ID
          role: 'assistant', 
          content: initialText, 
          html: initialHtml 
      }]);
      currentConversationId = null;
      userInput = '';
      
      await clearActiveConversationState(); // Clear the persisted active state
      
      // **** Explicitly reset loading state ****
      isLoading = false; 
      errorMessage = ''; // Also clear any lingering error message
      canAddReference = false; // Reset reference button state
      console.log("[newConversation] Reset isLoading to false.");
      
      await tick(); 
      scrollToBottom(); 
  }

  // 保存当前对话
  async function saveCurrentConversation() {
      if (isLoading || get(messages).length <= 1 || currentConversationId) {
          console.log("[saveCurrent] Conditions not met (loading, empty, or already saved). Skipping.");
          return; 
      }
      console.log("[saveCurrent] Saving current conversation...");
      const timestamp = Date.now();
      const newId = timestamp.toString();
      const name = `对话 ${new Date(timestamp).toLocaleString()}`; // Use let if you modify name later
      const conversationToSave: SavedConversation = {
          id: newId,
          name: name,
          timestamp: timestamp,
          // Store only role/content for saved conversations
          messages: get(messages)
              .filter(m => m.role === 'user' || m.role === 'assistant') // Exclude system/error?
              .map(({ role, content }) => ({ role, content }))
      };
      // Prepend to the list managed by the store
      conversationsStore.update(list => [conversationToSave, ...list.sort((a, b) => b.timestamp - a.timestamp)]);
      // The store's subscription in index.ts should handle the actual saving to storage

      currentConversationId = newId; // Mark as saved
      
      await clearActiveConversationState(); // Clear the persisted active state now that it's saved
      
      console.log("[saveCurrent] Conversation saved with ID:", newId, "and active state cleared.");
  }

  // 加载指定 ID 的对话
  async function loadConversation(id: string) { // <-- Make async
      // **** NEW: Auto-save current unsaved conversation before loading history ****
      if (currentConversationId === null && get(messages).length > 1 && !isLoading) { 
          console.log("[loadConversation] Current conversation is unsaved. Auto-saving before loading...");
          try {
              await saveCurrentConversation(); // Save the current one first
              console.log("[loadConversation] Auto-save successful.");
          } catch (error) {
              console.error("[loadConversation] Error auto-saving current conversation:", error);
              // Optional: Decide if you want to stop loading if auto-save fails?
              // For now, we'll continue loading even if save fails.
              errorMessage = "自动保存当前对话失败，但仍将尝试加载历史对话。";
          }
      }
      // **** END NEW ****

      const conversationToLoad = get(conversationsStore).find(c => c.id === id);
      if (conversationToLoad) {
          console.log("[loadConversation] Loading conversation:", id);
          messages.set(conversationToLoad.messages.map((msg, index) => ({
              ...msg,
              id: `${id}-${index}`, // Generate unique ID based on conv ID and index
              html: msg.role === 'assistant' ? markdownToHtml(msg.content) : undefined
          })));
          currentConversationId = conversationToLoad.id;
          nextId = get(messages).length;
          userInput = '';
          
          clearActiveConversationState(); // Clear active state as we loaded a saved one
          
          tick().then(scrollToBottom);
          console.log("[loadConversation] Conversation loaded, active state cleared.");
          
          // **** Explicitly reset loading state AFTER loading ****
          isLoading = false; 
          errorMessage = ''; // Clear errors
          canAddReference = false; // Reset reference button
          console.log("[loadConversation] Reset isLoading to false after load.");
      } else {
          console.error("[loadConversation] Conversation with ID not found:", id);
          // Reset loading state even if load fails
          isLoading = false; 
          errorMessage = `加载对话失败：未找到 ID ${id}`;
      }
  }

  // 删除指定 ID 的对话
  async function deleteConversation(id: string, event: MouseEvent) {
      event.stopPropagation(); // 阻止事件冒泡触发展开/加载
      if (confirm('确定要删除这个对话吗？')) {
          const updatedConversations = savedConversations.filter(c => c.id !== id);
          await pluginData.saveConversations(updatedConversations);
          // 如果删除的是当前对话，则开启新对话
          if (currentConversationId === id) {
              newConversation();
          }
          console.log("Conversation deleted:", id);
      }
  }

  // --- Helper function to fetch structured document context ---
  async function getStructuredDocumentContext(docId: string): Promise<string | null> {
    if (!docId) {
        console.warn("getStructuredDocumentContext called with no docId.");
        return null;
    }

    console.log(`Attempting to get visual structure using /api/filetree/getDoc for ID: ${docId}`);

    try {
        const response = await fetch('/api/filetree/getDoc', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
            body: JSON.stringify({ id: docId /* Add other potential params if needed based on docs/observation */ })
      });

      if (!response.ok) {
            console.error(`Error fetching /api/filetree/getDoc: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
            console.error("Error response body:", errorText);
            return null;
      }

      const result = await response.json();

        // --- CRITICAL DEBUGGING STEP ---
        console.log("DEBUG: Full response data from /api/filetree/getDoc:");
        console.dir(result.data, { depth: null }); // Use console.dir for better object inspection
        // --- END DEBUGGING STEP ---

        if (!result || result.code !== 0 || !result.data) {
            console.error("API call /api/filetree/getDoc did not return successful data:", result);
            return null;
        }

        // --- Step 1: Parse the HTML content ---
        const htmlContent = result.data.content;
        if (!htmlContent || typeof htmlContent !== 'string') {
            console.error("/api/filetree/getDoc response data.content is missing or not a string.");
            return null;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;

        // --- Step 2: Extract visually ordered IDs and depths ---
        const visualBlockInfos: { id: string, depth: number }[] = [];

        function traverseNodes(element: Element, currentDepth: number) {
            // Iterate over direct children that are block elements
            for (const child of Array.from(element.children)) {
                const nodeId = child.getAttribute('data-node-id');
                
                // Check if it's a block element we care about (adjust if needed)
                if (nodeId && child.tagName === 'DIV' && child.hasAttribute('data-type')) {
                    visualBlockInfos.push({ id: nodeId, depth: currentDepth });
                    
                    // Check for nested blocks within this block (e.g., inside list items)
                    // We might need a more robust way to find the actual content container within complex blocks
                    // For simplicity now, just recurse directly on the child element
                    traverseNodes(child, currentDepth + 1);
                } 
                // else if it's not a direct block but might contain blocks (like the root body)
                // or if we need to handle specific container types differently (like lists `li`)
                // We might need more complex logic here depending on HTML structure variance.
                // For now, handle direct children first.
            }
        }

        // Start traversal from the immediate children of the parsed body
        // Assuming the top-level blocks are direct children of the body in the parsed fragment
        traverseNodes(body, 1); // Start depth at 1 for the first level of blocks

        // --- CRITICAL DEBUGGING STEP ---
        console.log("DEBUG: Extracted visual block info (ID and Depth):");
        console.table(visualBlockInfos);
        // --- END DEBUGGING STEP ---

        if (visualBlockInfos.length === 0) {
            console.warn("No block IDs extracted from the parsed HTML.");
            return "[Context Generation Failed: Could not extract block info from HTML]";
        }

        // --- Step 3: Fetch content for the extracted IDs ---
        const idsToFetch = visualBlockInfos.map(info => info.id);
        let blocksData: { [id: string]: { markdown: string, type: string } } = {};

        if (idsToFetch.length > 0) {
            try {
                const quotedIds = idsToFetch.map(id => `'${id}'`).join(', ');
                const sqlQuery = `SELECT id, markdown, type FROM blocks WHERE id IN (${quotedIds})`;
                console.log(`Executing SQL to fetch block content: ${sqlQuery}`);

                const contentResponse = await fetch('/api/query/sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stmt: sqlQuery }),
                });

                if (!contentResponse.ok) {
                    const errorText = await contentResponse.text();
                    throw new Error(`SQL query for content failed (${contentResponse.status}): ${errorText}`);
                }

                const contentResult = await contentResponse.json();
                if (contentResult.code !== 0) {
                    throw new Error(`API returned error code ${contentResult.code}: ${contentResult.msg}`);
                }

                // Create a map for easy lookup
                if (contentResult.data && Array.isArray(contentResult.data)) {
                    contentResult.data.forEach((block: { id: string; markdown: string; type: string }) => {
                        blocksData[block.id] = { markdown: block.markdown || '', type: block.type || 'unknown' };
                    });
                }
                 console.log("Fetched block content data map:", blocksData);

            } catch (fetchError) {
                console.error("Error fetching block content:", fetchError);
                // Proceeding with placeholders for content if fetch fails
                errorMessage = `获取块内容时出错: ${fetchError.message}`; 
            }
        }

        // --- Step 4: Combine visual order/depth with fetched content ---
        const finalOrderedBlocks = visualBlockInfos.map(info => {
            const data = blocksData[info.id] || { markdown: `[Content Fetch Failed for ${info.id}]`, type: '[fetch failed]' };
            return {
                id: info.id,
                markdown: data.markdown, 
                type: data.type, 
                depth: info.depth
            };
        }); 

        // --- Step 5: Format --- 
        const formattedContext = formatBlocksForAI(finalOrderedBlocks);
        console.log("Formatted context using visual order (placeholder content):", formattedContext.substring(0, 500) + "...");
        return formattedContext; // Return context with placeholder content for now

    } catch (error) {
        console.error("Error in getStructuredDocumentContext processing /api/filetree/getDoc response:", error);
        return null;
    }
  }

  // 新增：格式化块数据供 AI 使用 (重构为 map/join)
  function formatBlocksForAI(blocks: any[]): string {
      // DEBUG: Log the blocks array AS RECEIVED by this function
      console.log("DEBUG: Blocks received by formatBlocksForAI (after deep copy):");
      console.table(blocks); // Use table for better readability of order

      // Filter out root block (depth 0) if necessary
      const contentBlocks = blocks.filter(block => block.depth > 0);

      if (contentBlocks.length === 0) {
          console.log("No content blocks (depth > 0) found after filtering.");
          return "Current Document Context (Structured with IDs and Hierarchy):\n[No content blocks found]\n--- End of Document Context ---";
      }

      const formattedLines = contentBlocks.map(block => {
          const indent = '  '.repeat(block.depth - 1);
          let blockContent = '';
          // 优先列表项(i)的 content, 其他优先 markdown
          if (block.type === 'i' && block.content) { 
             blockContent = block.content;
          } else {
             blockContent = block.markdown || block.content || '';
          }
          // 移除末尾空白
          const cleanedContent = blockContent.replace(/\s*$/, ''); 

          let blockString = `${indent}--- Block (ID: ${block.id}, Type: ${block.type}) ---\n`;
          if (cleanedContent) {
            // 将内容按行分割并添加缩进
            blockString += cleanedContent.split('\n').map(line => `${indent}${line}`).join('\n') + '\n';
          } else {
             blockString += `${indent}[Empty Block Content]\n`;
          }
          return blockString;
      });

      let formattedContext = "Current Document Context (Structured with IDs and Hierarchy):\n";
      formattedContext += formattedLines.join(''); // 直接连接所有块字符串
      formattedContext += "--- End of Document Context ---";

      // DEBUG: Log the final formatted string just before returning
      console.log("DEBUG: Formatted context string JUST BEFORE RETURN from formatBlocksForAI (using map/join):");
      console.log(formattedContext.substring(0, 500) + "..."); // Log truncated

      return formattedContext;
  }

  // --- Helper function to fetch context for SPECIFIC block IDs ---
  async function getReferencedBlocksContext(blockIds: string[]): Promise<string> {
    if (!blockIds || blockIds.length === 0) {
      return "";
    }
    console.log(`[getReferencedBlocksContext] Fetching context for specific block IDs: ${blockIds.join(', ')}`); // Log entry
    try {
      // Ensure IDs are properly quoted for the SQL IN clause
      const quotedIds = blockIds.map(id => `'${id}'`).join(', ');
      const sqlQuery = `SELECT id, type, markdown FROM blocks WHERE id IN (${quotedIds})`; 
      console.log(`[getReferencedBlocksContext] Executing SQL: ${sqlQuery}`); // Log SQL query

      // We need to preserve the original order as much as possible, 
      // but SQL IN doesn't guarantee order. We fetch and then re-order.

      const response = await fetch('/api/query/sql', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stmt: sqlQuery }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL query for references failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.code !== 0) {
          throw new Error(`API returned error code ${result.code} for references: ${result.msg}`);
      }

      if (!result.data || !Array.isArray(result.data)) {
          console.log("No block data returned for referenced IDs.");
          return "Could not retrieve content for referenced blocks.";
      }

      console.log("[getReferencedBlocksContext] Raw SQL query result data for references:", result.data); // Log raw data

      // Re-order results based on the original blockIds array
      const fetchedBlocksMap = new Map(result.data.map((block: {id: string}) => [block.id, block]));
      const orderedBlocks = blockIds.map(id => fetchedBlocksMap.get(id)).filter(Boolean);

      // Format the blocks into a string
      let formattedContext = "Referenced content:\n";
      orderedBlocks.forEach((block: { id: string; type: string; markdown: string }, index: number) => {
          formattedContext += `--- Referenced Block ${index + 1} (ID: ${block.id}, Type: ${block.type}) ---\n${block.markdown || '[Block content not directly in markdown field]'}\n\n`; 
      });
      formattedContext += "--- End of Referenced Blocks ---";

      console.log("[getReferencedBlocksContext] Formatted referenced context string:", formattedContext); // Log the final formatted string
      return formattedContext;

    } catch (error) {
        console.error("[getReferencedBlocksContext] Error fetching or processing referenced block context:", error); // Log error
        return `Error retrieving referenced content: ${error.message}`; 
    }
  }

  // --- Siyuan API Call Wrappers ---
  async function executeDeleteBlock(blockId: string): Promise<void> {
      console.log(`Attempting to delete block: ${blockId}`);
      try {
          const response = await fetch('/api/block/deleteBlock', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: blockId }),
          });
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API deleteBlock failed (${response.status}): ${errorText}`);
          }
          const result = await response.json();
          if (result.code !== 0) {
              throw new Error(`API deleteBlock returned error code ${result.code}: ${result.msg}`);
          }
          console.log(`Block ${blockId} deleted successfully.`);
          // Optionally add a success message to chat?
          // addSystemMessage(`已成功删除块 ${blockId}`);
      } catch (error) {
          console.error(`Error executing deleteBlock for ${blockId}:`, error);
          errorMessage = `删除块 ${blockId} 失败: ${error.message}`;
          throw error; // Re-throw to be caught by sendMessage
      }
  }

  // Function to execute block insertion via API
  async function executeInsertBlock(previousId: string | null, markdownContent: string, parentId: string | null) {
    console.log(`Attempting to insert block after ${previousId || 'start'} with parent ${parentId || 'unknown'}, content:\n${markdownContent}`);

    // Construct the payload based on parameters
    const payload: { dataType: string; data: string; previousID?: string; parentID?: string } = {
      dataType: "markdown",
      data: markdownContent, // Use 'data' instead of 'markdown'
    };

    if (previousId !== null) {
      payload.previousID = previousId;
    } else if (parentId !== null) {
        // Only add parentID if previousID is explicitly null (or empty string which becomes null)
        payload.parentID = parentId;
        payload.previousID = ""; // Necessary when inserting at the beginning with parentID
    } else {
        // Default case: If both are null, behave as inserting at the start (should ideally have a docId as parent)
        // This case might need more robust handling depending on context
        payload.previousID = ""; 
    }

    try {
      console.log("Executing insert with payload:", payload);
      const response = await fetch('/api/block/insertBlock', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(`API returned error code ${result.code}: ${result.msg}`);
      }

      console.log(`Block inserted successfully after ${previousId || 'start'}.`);
      // Optionally, we could try to get the new block ID from the response if the API returns it
      // result.data might contain info about the new block(s)
      // For now, just log success

    } catch (error) {
      console.error("Error executing insert block command:", error);
      errorMessage = `插入块失败: ${error.message}`;
      // Rethrow or handle as needed
      throw error; 
    }
  }

  // --- Utility function to add system messages (optional) ---
  // function addSystemMessage(text: string) {
  //     const sysId = Date.now().toString() + 'sys';
  //     const sysMessage: DisplayChatMessage = { 
  //         id: sysId, 
  //         role: 'system', // Or maybe a different role for clarity?
  //         content: text, 
  //         html: markdownToHtml(`*${text}*`) // Example formatting
  //     }; 
  //     messages.update(currentMessages => [...currentMessages, sysMessage]);
  //     messages.set([...get(messages)]);
  // }

  // --- Function to get Markdown content for a referenced document ID ---
  async function getReferencedDocumentContent(docId: string): Promise<string | null> {
    console.log(`[Context Fetch] Attempting to get Markdown for referenced document ID: ${docId}`);
    
    // --- Attempt 1: Use /api/block/getBlockMarkdown --- 
    try {
        console.log(`[Context Fetch] Trying /api/block/getBlockMarkdown for ${docId}...`);
        const response = await fetch('/api/block/getBlockMarkdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: docId }),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 0 && result.data?.markdown) {
                console.log(`[Context Fetch] Success via /api/block/getBlockMarkdown for doc ID ${docId}. Length: ${result.data.markdown.length}`);
                return result.data.markdown; // Return if successful
            } else {
                 console.warn(`[Context Fetch] /api/block/getBlockMarkdown returned success code but no markdown data for doc ID ${docId}. Result:`, result);
            }
        } else {
             console.warn(`[Context Fetch] /api/block/getBlockMarkdown failed (${response.status}) for doc ID ${docId}.`);
        }
    } catch (error) {
        console.error(`[Context Fetch] Error calling /api/block/getBlockMarkdown for ${docId}:`, error);
    }

    // --- Attempt 2 (Fallback): Use /api/export/exportMdContent --- 
    console.log(`[Context Fetch] Fallback: Trying /api/export/exportMdContent for ${docId}...`);
    try {
        const exportResponse = await fetch('/api/export/exportMdContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: docId }),
        });

        if (!exportResponse.ok) {
             const errorText = await exportResponse.text();
            throw new Error(`Fallback API /api/export/exportMdContent failed (${exportResponse.status}): ${errorText}`);
        }
        
        const exportResult = await exportResponse.json();
        
        if (exportResult.code === 0 && exportResult.data?.content) {
            console.log(`[Context Fetch] Success via FALLBACK /api/export/exportMdContent for doc ID ${docId}. Length: ${exportResult.data.content.length}`);
            return exportResult.data.content; // Return content from export
        } else {
            throw new Error(`Fallback API /api/export/exportMdContent returned error code ${exportResult.code} or no content: ${exportResult.msg || 'No content found'}`);
        }

    } catch (error) {
        console.error(`[Context Fetch] Error calling FALLBACK /api/export/exportMdContent for ${docId}:`, error);
        return null; // Both attempts failed
    }
  }

  // --- Message Sending Function ---
  async function sendMessage() {
    const currentUserInput = userInput.trim();
    if (!currentUserInput || isLoading) return; // Prevent sending empty or during loading

    errorMessage = '';
    isLoading = true;
    console.log("[sendMessage] Set isLoading to true."); // Log isLoading change
    
    // --- Frontend Command Handling for "[删除|修改]选区N" ---
    const selectionCommandMatch = currentUserInput.match(/^(删除|修改)选区(\d+)$/i);
    let commandHandledByFrontend = false;

    if (selectionCommandMatch) {
        const action = selectionCommandMatch[1];
        const index = parseInt(selectionCommandMatch[2], 10);
        console.log(`[Frontend Command] Matched: action=${action}, index=${index}`); // Log action and index

        const currentReferences = get(referenceStore);
        console.log('[Frontend Command] Current references in store:', JSON.stringify(currentReferences, null, 2)); // Log all refs

        const selectionReferences = currentReferences.filter(ref => ref.type === 'selection');
        console.log('[Frontend Command] Filtered selection references:', JSON.stringify(selectionReferences, null, 2)); // Log filtered refs

        if (index > 0 && index <= selectionReferences.length) {
            const targetReference = selectionReferences[index - 1]; // Adjust index to be 0-based
            console.log(`[Frontend Command] Target reference (at index ${index - 1}):`, JSON.stringify(targetReference, null, 2)); // Log the specific target

            const targetBlockIds = targetReference.blockIds;
            console.log(`[Frontend Command] Target Block IDs for ${action}:`, JSON.stringify(targetBlockIds)); // Log IDs to be acted upon

            if (action.toLowerCase() === '删除') {
                try {
                    // Call delete for each block in the reference
                    for (const blockId of targetBlockIds) {
                        await executeDeleteBlock(blockId);
                    }
                    // Add confirmation message
                    const confirmId = Date.now().toString() + 'fe-del';
                    messages.update(m => [...m, { id: confirmId, role: 'assistant', content: `已执行删除选区 ${index} (块: ${targetBlockIds.join(', ')}) 的操作。`, html: markdownToHtml(`已执行删除选区 **${index}** (块: ${targetBlockIds.join(', ')}) 的操作。`) }]);
                    messages.set([...get(messages)]);
                    
                    // Clear ONLY the handled selection reference
                    const handledRefId = targetReference.id;
                    console.log(`[Frontend Command] Removing reference with ID: ${handledRefId}`); // Log ID being removed
                    referenceStore.update(refs => {
                        const updatedRefs = refs.filter(ref => ref.id !== handledRefId);
                        console.log('[Frontend Command] References after removal:', JSON.stringify(updatedRefs, null, 2)); // Log store state after removal
                        return updatedRefs;
                    });
                    commandHandledByFrontend = true;
                } catch (error) {
                    console.error("[Frontend Command] Error executing frontend delete command:", error);
                    errorMessage = `执行删除选区 ${index} 失败: ${error.message}`;
                    // Let the rest of the function handle the error state, but don't proceed to AI
                    commandHandledByFrontend = true; // Still handled (failed)
                }
            } else if (action.toLowerCase() === '修改') {
                // Modification logic is complex, add placeholder/message for now
                console.log("Frontend modification command recognized, but not fully implemented.");
                errorMessage = `通过 \"修改选区N\" 指令修改内容的功能尚未完全实现。请尝试选中内容后，直接向 AI 提出修改要求。`;
                commandHandledByFrontend = true; // Prevent sending to AI
            }
        } else {
            console.warn(`[Frontend Command] Invalid index ${index} for ${selectionReferences.length} selection references.`); // Log invalid index
            errorMessage = `无效的选区编号: ${index}。请确保编号在 1 到 ${selectionReferences.length} 之间。`;
            commandHandledByFrontend = true; // Prevent sending to AI
        }
    }

    // --- If command was handled by frontend, reset input and stop here ---
    if (commandHandledByFrontend) {
        userInput = ''; // Clear input
        isLoading = false; // Reset loading state
        await tick();
        scrollToBottom();
        return; // Stop further processing
    }

    // --- Proceed with sending to AI if not handled by frontend ---
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const userMessage: DisplayChatMessage = { id: uniqueId, role: 'user', content: currentUserInput };
    
    messages.update(currentMessages => [...currentMessages, userMessage]);
    messages.set([...get(messages)]); 
    console.log("User message added to store:", get(messages));
    
    userInput = '';
    await tick();
    scrollToBottom();

    // --- 2. Prepare Context --- 
    let documentContext = await getStructuredDocumentContext(currentDocId);
    let referencedBlocksContext = ''; // Content from explicit block selections
    let referencedDocumentsContext = ''; // Content from @ referenced documents
    const currentReferences = get(referenceStore);

    const selectionReferences = currentReferences.filter(ref => ref.type === 'selection');
    if (selectionReferences.length > 0) {
      const referencedBlockIds = selectionReferences.flatMap(ref => ref.blockIds);
      referencedBlocksContext = await getReferencedBlocksContext(referencedBlockIds);
    }
    
    const documentReferences = currentReferences.filter(ref => ref.type === 'document');
    if (documentReferences.length > 0) {
        let tempDocContext = '\n\n--- Referenced Documents ---\n';
        for (const ref of documentReferences) {
            const docId = ref.blockIds[0]; // Assuming one ID per document ref
            const docContent = await getReferencedDocumentContent(docId);
            if (docContent) {
                // Use the label (title) stored in the reference
                tempDocContext += `\n--- Document: ${ref.label} (ID: ${docId}) ---\n${docContent}\n---\;\n`;
            } else {
                // If content fetch failed, at least mention the reference
                tempDocContext += `\n--- Document: ${ref.label} (ID: ${docId}) --- (Content not available) ---\;\n`;
            }
        }
        referencedDocumentsContext = tempDocContext;
    }

    // Combine contexts
    let combinedContextForApi = documentContext ? `--- Current Document Context ---\n${documentContext}` : 'No current document context available.';
    if (referencedBlocksContext) {
      combinedContextForApi += referencedBlocksContext; // Already includes "Referenced content:" header
    }
    if (referencedDocumentsContext) {
        combinedContextForApi += referencedDocumentsContext;
    }
    console.log("Combined context string prepared for system prompt (length:", combinedContextForApi.length, "):", combinedContextForApi.substring(0, 500) + "...");

    // --- 3. Prepare Messages for API --- 
    const conversationHistory = get(messages);
    const historyForApi = conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') 
        .slice(-MAX_HISTORY_MESSAGES) 
        .map(msg => ({              
            role: msg.role,         
            content: msg.content
        }));

    // Modify system prompt to include context if available
    let systemPrompt = `You are a helpful AI assistant integrated into Siyuan Note.\\n\\nYou can interact with the document content based on the provided context.\\n\\n**Understanding the Context:**\\nThe context below shows the structure and content of the current document or specific blocks selected by the user.\\n\\n**CRITICAL: The blocks are presented in their exact hierarchical order as they appear in the document. Indentation signifies nesting depth. You MUST rely SOLELY on this order and indentation to understand the document structure. DO NOT infer order from block IDs or timestamps.**\\n\\nEach block is clearly marked like this:\\n--- Block (ID: yyyy-mmdd-xxxxxx, Type: p) ---\\n[Markdown content of the block]\\n---\\n(Referenced blocks, if any, will be listed under \\\"Referenced content:\\\")\\n\\n**Performing Actions (Delete/Insert):**\\nWhen the user asks you to modify the document:\\n1. Carefully identify the **exact block ID(s)** from the context that corresponds to the user's request, using the provided order and structure.\\n2. Output **one or more** JSON command blocks using ONLY the following formats. **You MUST use the specific block ID(s) found in the context.**\\n\n   *   To delete a block: \\\`\\\`\\\`json\\n{\\\"action\\\": \\\"delete\\\", \\\"block_id\\\": \\\"TARGET_BLOCK_ID_FROM_CONTEXT\\\"}\\n\\\`\\\`\\\`\\n   *   To insert a new block: \\\`\\\`\\\`json\\n{\\\"action\\\": \\\"insert\\\", \\\"previousID\\\": \\\"ID_OF_BLOCK_TO_INSERT_AFTER\\\", \\\"parentID\\\": null, \\\"markdown\\\": \\\"NEW_MARKDOWN_CONTENT\\\"}\\n\\\`\\\`\\\` (Use the ID of the block you want to insert *after* as previousID. parentID is usually null.)\\n\\n**IMPORTANT RULES:**\\n*   **Multiple Commands:** You CAN output multiple \\\`delete\\\` and \\\`insert\\\` commands in a single response.\\n*   **Action Intent:** Determine the user's core goal: delete or insert new content.\\n*   **Handling Multi-Block References (e.g., \\\"Selection 1\\\"):**\\n    *   **Information Requests:** Summarize/address ALL associated blocks.\\n    *   **Action Requests (Delete):** Issue one \\\`delete\\\` command for **EACH** block ID in the reference.\\n    *   **Action Requests (Modify):** \\n        1. Issue one \\\`delete\\\` command for **EACH** block ID in the reference.\\n        2. Issue **ONE** \\\`insert\\\` command containing the **ENTIRE** modified content.\\n        3. The \\\`previousID\\\` for this insert command **MUST** be the ID of the block immediately **PRECEDING** the **FIRST** block of the selection (use context order). If the selection starts at the very beginning, \\\`previousID\\\` might be empty or require parent ID handling (ask if unsure about this specific edge case).\\n    *   **Action Requests (Insert AFTER selection):** \\n        1. Issue **ONE** \\\`insert\\\` command containing the **ENTIRE** new content.\\n        2. The \\\`previousID\\\` for this insert command **MUST** be the ID of the **LAST** block in the selection (use context order).\\n    *   **Action Requests (Insert BEFORE selection):** \\n        1. Issue **ONE** \\\`insert\\\` command containing the **ENTIRE** new content.\\n        2. The \\\`previousID\\\` for this insert command **MUST** be the ID of the block immediately **PRECEDING** the **FIRST** block of the selection (use context order).\\n*   **Single Block Modification:** Still performed as delete-then-insert. The \\\`previousID\\\` for the insert is the ID of the block preceding the deleted one.\\n*   **Insert Command - Target Location Rules (Single Block Relative):**\\n    *   **Goal: Insert AFTER Block A?** Set \\\'previousID\\\' = \\\'BLOCK_A_ID\\\'.\\n    *   **Goal: Insert BEFORE Block B?** Find Block B-1 preceding Block B using context order. Set \\\'previousID\\\' = \\\'BLOCK_B_minus_1_ID\\\'.\\n    *   **NO FUZZY LOCATIONS:** \\\"insert at beginning/end/here\\\" are NOT directly supported *unless* clearly referring to the start/end of a known multi-block selection (handled above) or the entire document. If ambiguous for single block, ask for relative ID.\\n*   **Referenced Context Priority:** If \\\'Referenced content\\\' exists and the user refers to it, use IDs from THAT section.\\n*   **Use Exact IDs:** Always use the exact \\\`ID: yyyy-mmdd-xxxxxx\\\` from the context.\\n*   **Ask If Unsure (Ambiguity):** If ambiguous about the **target block(s)** (e.g., \\\"that paragraph\\\") or the **exact insertion point relative to a single block** (e.g., \\\"insert near the start\\\"), or if required preceding IDs cannot be found, MUST ask user for clarification. **Do NOT ask just because a target is a known multi-block selection.**\\n*   **Normal Chat:** For non-modification requests, respond normally without JSON command blocks.\\n\\n--- Context Starts Below:`;

    if (combinedContextForApi) { // Check the combined context
        // Use the new structured context string
        // Context string already contains appropriate header (Referenced or Structured)
        systemPrompt += `\n\n${combinedContextForApi}`; 
    }
    // Add user's current query to the final message list *after* potentially adding context
    const finalMessagesForApi = [
        { role: 'system', content: systemPrompt },
        ...historyForApi // History already includes the latest user message
    ];

    // DEBUG: Log the exact system prompt being sent to the AI
    console.log("DEBUG: Final System Prompt Content Sent to AI:\n", systemPrompt);

    console.log("Messages being sent to API (final format):", finalMessagesForApi);

    try {
        // Pass settings to fetchChatCompletion
        const assistantResponseContent = await fetchChatCompletion(finalMessagesForApi, currentSettings);
        
        // --- Check for Action Command --- 
        let commandsExecuted = 0; // Count executed commands
        let assistantResponseForDisplay = assistantResponseContent; // Store original response
        
        // Use global match to find all command blocks
        const commandRegex = /```json\n({.*?})\n```/gs; 
        let match;
        const commandsToExecute: any[] = [];

        while ((match = commandRegex.exec(assistantResponseContent)) !== null) {
            if (match[1]) {
                try {
                    const commandJson = match[1];
                    const command = JSON.parse(commandJson);
                    commandsToExecute.push(command); 
                } catch (parseError) {
                    console.error("Failed to parse command JSON:", parseError, "Raw content:", match[1]);
                    // If parsing fails, keep the original response content for display
                }
            }
        }
        
        console.log("Found commands to execute:", commandsToExecute); // Log all parsed commands

        // --- Execute Parsed Commands --- 
        if (commandsToExecute.length > 0) {
            let confirmationMessages: { id: string, role: 'assistant', content: string, html: string }[] = [];
            
            for (const command of commandsToExecute) {
                try {
                    console.log("Executing command:", command);
                    if (command.action === 'delete' && command.block_id) {
                        await executeDeleteBlock(command.block_id);
                        commandsExecuted++;
                        const confirmId = Date.now().toString() + `cmd-del-${commandsExecuted}`;
                        confirmationMessages.push({ id: confirmId, role: 'assistant', content: `已执行删除块 ${command.block_id} 的操作。`, html: markdownToHtml(`已执行删除块 **${command.block_id}** 的操作。`) });
                    // REMOVED 'update' command handling
                    } else if (command.action === 'insert' && typeof command.markdown === 'string' && (
                        (typeof command.previousID === 'string') || 
                        (typeof command.parentID === 'string' && command.parentID !== '') 
                        )) {
                            const previousId = command.previousID === "" ? null : command.previousID; 
                            const parentId = command.parentID || null; 
                            await executeInsertBlock(previousId, command.markdown, parentId);
                            commandsExecuted++;
                            const confirmId = Date.now().toString() + `cmd-ins-${commandsExecuted}`;
                            const locationDesc = previousId ? `块 ${previousId} 之后` : (parentId ? `文档 ${parentId} 开头` : '文档开头');
                            confirmationMessages.push({ id: confirmId, role: 'assistant', content: `已在 ${locationDesc} 插入新块。`, html: markdownToHtml(`已在 **${locationDesc}** 插入新块。`) });
                    } else {
                        console.warn("Parsed command JSON has invalid action (only delete/insert supported) or missing/invalid parameters:", command);
                        // Add a message indicating the invalid command if needed, or just ignore
                    }
                } catch (execError) {
                     console.error(`Error executing command: ${JSON.stringify(command)}`, execError);
                     // Add an error message for this specific command failure
                     const errorId = Date.now().toString() + `cmd-err-${commandsExecuted}`;
                     confirmationMessages.push({ id: errorId, role: 'assistant', content: `执行命令 ${command.action} 失败: ${execError.message}`, html: markdownToHtml(`执行命令 **${command.action}** 失败: ${execError.message}`) });
                }
            } // End for loop

            // If any commands were attempted, add confirmation/error messages
            if (confirmationMessages.length > 0) {
                messages.update(m => [...m, ...confirmationMessages]);
                messages.set([...get(messages)]);
            }
        } // End if commandsToExecute.length > 0

        
        // --- Display Normal Assistant Response (if no commands were executed or if original response wasn't just commands) ---
        // Display the original response ONLY IF no commands were successfully executed OR if the original response contained more than just the command blocks.
        // A simple check: if the original response stripped of command blocks is still non-empty.
        const contentWithoutCommands = assistantResponseContent.replace(commandRegex, '').trim();

        if (commandsExecuted === 0 || contentWithoutCommands.length > 0) {
             // If commands were executed BUT there's other text, display the non-command part
            const displayContent = commandsExecuted > 0 ? contentWithoutCommands : assistantResponseForDisplay;
            if (displayContent.length > 0) { // Only display if there's actual content left
                const assistantId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
                const assistantMessage: DisplayChatMessage = { 
                    id: assistantId, 
                    role: 'assistant', 
                    content: displayContent, 
                    html: markdownToHtml(displayContent)
                }; 
                messages.update(currentMessages => [...currentMessages, assistantMessage]);
                messages.set([...get(messages)]); // Force reactivity update
                console.log("Assistant message (non-command part or original) added to store:", get(messages));
            }
        }

        // saveMessagesToStorage(); // Assuming this uses role/content

    } catch (error) {
        console.error('Error fetching chat completion:', error);
        errorMessage = `AI 请求失败: ${error.message}`;
        const errorId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        // Create error message with unique ID
        const errorResponseMessage: DisplayChatMessage = { 
            id: errorId, 
            role: 'assistant', // Display as AI message? Or a new 'error' role?
            content: `抱歉，请求出错: ${errorMessage}`, 
            html: markdownToHtml(`抱歉，请求出错: ${errorMessage}`) 
        }; 
        messages.update(currentMessages => [...currentMessages, errorResponseMessage]);
        messages.set([...get(messages)]); // Force reactivity update
        console.log("Error message added to store:", get(messages)); // Log after update
    } finally {
        isLoading = false;
+       console.log("[sendMessage] Set isLoading to false in finally block."); // Log isLoading change
        // Clear selection references AFTER the API call attempt ONLY IF NOT handled by frontend
        if (!commandHandledByFrontend && selectionReferences.length > 0) { 
            console.log("Clearing selection references after AI call.");
            referenceStore.update(refs => refs.filter(ref => ref.type !== 'selection'));
        }
        await tick(); // Wait for UI update before scrolling
        scrollToBottom(); 
    }
  }

  // 滚动到底部函数
  function scrollToBottom() {
    if (chatHistoryElement) {
      // Use requestAnimationFrame for smoother scrolling after DOM updates
      requestAnimationFrame(() => {
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
      });
    }
  }

  function saveMessagesToStorage() {
    // Placeholder - Implement saving using role/content
    console.log("Saving messages (ensure format is correct)...");
    // localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(get(messages)));
  }

  function loadConversationsFromStorage() {
    // Placeholder - Implement loading and map to role/content if needed
    console.log("Loading messages (ensure format is correct)...");
    // const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    // if (storedMessages) {
    //     messages.set(JSON.parse(storedMessages).map(m => ({...m, html: m.role === 'assistant' ? markdownToHtml(m.content) : undefined })));
    // }
  }

  // --- ADD: Function to handle event from child component --- 
  async function handleAddDocumentReference(event: CustomEvent<{ docId: string; title: string }>) {
    const { docId, title } = event.detail;
    if (!docId || !title) return;

    const newRefId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReference: ReferenceItem = {
      id: newRefId,
      label: title, // Use fetched title
      blockIds: [docId], // Store the actual ID
      type: 'document',
    };

    referenceStore.update(refs => [...refs, newReference]);
    console.log('Added document reference via event:', newReference);
    // Child component handles hiding itself
  }

  // --- Selection and Reference Handling ---

  // Helper function to find the parent block node with data-node-id
  function findParentBlockNode(node: Node | null): HTMLElement | null {
    if (!node) {
      return null;
    }

    // 1. Check if the node itself is the block node
    if (node instanceof HTMLElement && node.dataset.nodeId) {
        return node;
    }

    // 2. Check if the parent element is the block node
    const parentElement = node.parentElement;
    if (parentElement instanceof HTMLElement && parentElement.dataset.nodeId) {
        return parentElement;
    }

    // 3. Traverse upwards using closest as a fallback
    if (node instanceof Element) {
      // If node is an element, start closest search from it
      return node.closest('[data-node-id]');
            } else {
      // If node is not an element (e.g., text node), start closest search from parent
      return parentElement?.closest('[data-node-id]');
    } 
  }

  // Function to get IDs of currently selected blocks in the Siyuan editor
  function getSelectedBlockIds(): string[] {
    console.groupCollapsed("[getSelectedBlockIds] Check"); // Start log group
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !selection.anchorNode || !selection.focusNode) {
      console.log("No valid selection found.");
      console.groupEnd(); // End log group
      return [];
    }

    const range = selection.getRangeAt(0);
    console.log("Selection range:", range);
    console.log("Start Container:", range.startContainer, "Offset:", range.startOffset);
    console.log("End Container:", range.endContainer, "Offset:", range.endOffset);

    // Check if selection is within a Protyle editor
    const startContainer = range.startContainer;
    const editorElement = (startContainer instanceof Node && startContainer.nodeType === Node.ELEMENT_NODE ? startContainer as Element : startContainer.parentElement)?.closest('.protyle-wysiwyg');
    if (!editorElement) {
         console.log("Selection is not inside a protyle editor.");
         console.groupEnd(); // End log group
         return []; // Selection not in a known editor
     }
    console.log("Selection is inside editor:", editorElement);

    const startBlockNode = findParentBlockNode(range.startContainer);
    const endBlockNode = findParentBlockNode(range.endContainer);

    console.log("Found start block node:", startBlockNode?.dataset?.nodeId, startBlockNode);
    console.log("Found end block node:", endBlockNode?.dataset?.nodeId, endBlockNode);

    if (!startBlockNode && !endBlockNode) {
      console.log("Neither start nor end of selection is inside a block.");
      console.groupEnd(); // End log group
      return [];
    }

    // If selection is entirely within one block
    if (startBlockNode && startBlockNode === endBlockNode) {
        console.log("Selection within single block:", startBlockNode.dataset.nodeId);
        console.groupEnd(); // End log group
        return [startBlockNode.dataset.nodeId];
    }

    // If selection spans multiple blocks (or starts/ends outside)
    const allBlocksInEditor = Array.from(editorElement.querySelectorAll('[data-node-id]')) as HTMLElement[];
    console.log("All blocks in editor:", allBlocksInEditor.map(b => b.dataset.nodeId));
    const blockIds: string[] = [];

    // Determine the effective start and end nodes for range calculation
    // Use the block nodes we found. If one is missing, we might have issues.
    const rangeStartNode = startBlockNode; 
    const rangeEndNode = endBlockNode; 

    let startIndex = rangeStartNode ? allBlocksInEditor.findIndex(block => block === rangeStartNode) : -1;
    let endIndex = rangeEndNode ? allBlocksInEditor.findIndex(block => block === rangeEndNode) : -1;

    console.log(`Calculated indices: Start=${startIndex}, End=${endIndex}`);

    // Handle cases where start or end block couldn't be reliably found in the list
    if (startIndex === -1 || endIndex === -1) {
        console.warn("Could not reliably determine selection range indices within editor blocks. Returning found blocks only.");
        // Fallback: return only the block IDs that were successfully found
        if (startBlockNode?.dataset.nodeId) blockIds.push(startBlockNode.dataset.nodeId);
        if (endBlockNode?.dataset.nodeId && endBlockNode !== startBlockNode) blockIds.push(endBlockNode.dataset.nodeId);
        console.log("Final selected block IDs (fallback):", blockIds);
        console.groupEnd(); // End log group
        return Array.from(new Set(blockIds)); 
    }

    // Ensure startIndex <= endIndex
    if (startIndex > endIndex) {
        [startIndex, endIndex] = [endIndex, startIndex];
        console.log("Swapped indices");
    }

    for (let i = startIndex; i <= endIndex; i++) {
        const blockNode = allBlocksInEditor[i];
        if (blockNode?.dataset.nodeId) {
            blockIds.push(blockNode.dataset.nodeId);
        }
    }

    console.log("Final selected block IDs:", blockIds);
    console.groupEnd(); // End log group
    return Array.from(new Set(blockIds)); // Ensure uniqueness, though should be unique by logic
  }

  // Debounced selection change handler
  function handleSelectionChange() {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = window.setTimeout(() => {
        const currentSelectedIds = getSelectedBlockIds(); // Get IDs
        const newCanAddRef = currentSelectedIds.length > 0;

        // If we found valid block IDs, update the state and enable the button
        if (newCanAddRef) {
            selectedBlockIds = currentSelectedIds;
            canAddReference = true;
            console.log("Selection changed (debounced), FOUND blocks, Enabling button. IDs:", selectedBlockIds);
        } else {
            // If no valid blocks found, DO NOTHING. 
            // This prevents a subsequent invalid selection event from disabling the button 
            // after a valid selection was made.
            console.log("Selection changed (debounced), NO valid blocks found, button state remains:", canAddReference);
        }
    }, 150); // Adjust debounce delay as needed (e.g., 150-250ms)
  }

  // Function to add the current selection as a reference
  function addSelectionReference() {
    if (!canAddReference || selectedBlockIds.length === 0) return;

    const newRefId = `sel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // Simple label for now
    const existingRefs = get(referenceStore);
    const newLabel = `选区 ${existingRefs.filter(r => r.type === 'selection').length + 1}`;

    const newReference: ReferenceItem = {
      id: newRefId,
      label: newLabel,
      blockIds: [...selectedBlockIds], // Clone the array
      type: 'selection',
    };

    console.log('[addSelectionReference] About to update referenceStore. Current state:', get(referenceStore));
    console.log('[addSelectionReference] Adding new reference:', newReference);
    referenceStore.update(refs => [...refs, newReference]);
    console.log('[addSelectionReference] Updated referenceStore state:', get(referenceStore));

    // Clear selection state after adding
    selectedBlockIds = [];
    canAddReference = false;
    window.getSelection()?.removeAllRanges(); // Clear visual selection in editor
  }

  // --- UI Event Handlers & Bindings ---
  function toggleHistory() {
    showHistory = !showHistory;
  }

  // --- Context Menu Handlers ---
  // Revert back to using contextmenu event
  function handleContextMenu(event: MouseEvent) { 
    // Only proceed for right-click (contextmenu event implies right-click, but check anyway? button is often 0 for contextmenu)
    // if (event.button !== 2) { 
    //     return;
    // }
    
    console.log('[ContextMenu] handleContextMenu triggered.'); // Revert log prefix
    const targetElement = event.target as HTMLElement;
    const messageElement = targetElement.closest('.message') as HTMLElement;
    console.log('[ContextMenu] Closest message element:', messageElement); // Revert log prefix

    if (messageElement) {
        // ---> Put preventDefault back here, immediately <--- 
        event.preventDefault(); 
        // ---> ADD stopPropagation to prevent interference <--- 
        event.stopPropagation();
        
        const messageId = messageElement.dataset.messageId;
        console.log('[ContextMenu] Attempting to get message ID:', messageId); // Revert log prefix

        if (!messageId) {
            console.warn("[ContextMenu] Could not find data-message-id attribute."); // Revert log prefix
            hideContextMenu();
            return;
        }

        contextTargetMessageId = messageId;
        contextMenuLeft = event.clientX;
        contextMenuTop = event.clientY;
        console.log(`[ContextMenu] Setting state: show=true, targetId=${contextTargetMessageId}, pos=(${contextMenuLeft}, ${contextMenuTop})`); // Revert log prefix
        showContextMenu = true;
        console.log(`[ContextMenu] State set. showContextMenu is now: ${showContextMenu}`); // Revert log prefix

        // Add a one-time click listener to the window to hide the menu
        // Use setTimeout to prevent the current click from immediately closing the menu
        setTimeout(() => {
            // No preventDefault here anymore

            // ---> Add BOTH hide listeners back <--- 
            window.addEventListener('click', handleClickOutside, { once: true }); 
            window.addEventListener('contextmenu', handleClickOutside, { once: true }); 
            console.log('[ContextMenu] Added BOTH hide listeners inside setTimeout'); // Revert log prefix
        }, 0); 

    } else {
        console.log('[ContextMenu] Right-click was not inside a .message element.'); // Revert log prefix
        hideContextMenu(); // Hide if clicking outside a message
    }
  }

  function hideContextMenu() {
    showContextMenu = false;
    contextTargetMessageId = null;
    // Ensure removal of listeners if menu hidden programmatically
    // Need to remove the specific listeners added in setTimeout
    // Removing them generally might be okay, but let's be precise if needed later.
    // It might be safer to just let `once: true` handle the removal.
    // window.removeEventListener('click', handleClickOutside);
    // window.removeEventListener('contextmenu', handleClickOutside);
    console.log('[ContextMenu] hideContextMenu called'); // Add log here
  }

  // Handles clicks outside the context menu to hide it
  function handleClickOutside(event: MouseEvent) {
      // Check if the click was outside the context menu itself (implementation detail)
      // A simpler approach for now: any click outside the original target area hides it.
      hideContextMenu();
      // Important: Stop propagation if needed to prevent other actions
      // event.stopPropagation(); 
  }

  async function copyMessage() {
      console.log(`[ContextMenu] copyMessage called. contextTargetMessageId: ${contextTargetMessageId}`); 
      if (!contextTargetMessageId) return;
      const messageToCopy = get(messages).find(m => m.id === contextTargetMessageId);
      console.log("[Copy] Found message object:", messageToCopy); // 检查找到的对象
      if (messageToCopy && typeof messageToCopy.content === 'string') { // Ensure content is a string
          try {
              const contentToCopy = messageToCopy.content; // Store content in a variable for logging
              console.log("[Copy] Attempting to write to clipboard:", contentToCopy); 
              await navigator.clipboard.writeText(contentToCopy);
              console.log("[Copy] Successfully wrote to clipboard."); 
              // Optional: Show temporary success feedback?
          } catch (err) {
              console.error("[Copy] Failed to copy message content:", err); 
              errorMessage = "复制失败: " + err.message; // Show error to user
          }
      } else {
          console.warn("[Copy] Message not found or content is not a string.", contextTargetMessageId); 
          errorMessage = "无法复制：未找到消息或消息无有效内容。";
      }
      hideContextMenu();
      // ---> ADD Explicit listener removal <---
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
  }

  function deleteMessageHandler() {
      console.log(`[ContextMenu] deleteMessageHandler called. contextTargetMessageId: ${contextTargetMessageId}`);
      if (!contextTargetMessageId) return;
      const targetId = contextTargetMessageId; // Store before hiding menu potentially clears it
      console.log(`[Delete] Target ID for deletion: ${targetId}`); 
      
      const currentMessages = get(messages);
      console.log('[Delete] Message IDs BEFORE filtering:', currentMessages.map(m => m.id)); 
      const updatedMessages = currentMessages.filter(m => m.id !== targetId);
      console.log('[Delete] Message IDs AFTER filtering (before set):', updatedMessages.map(m => m.id)); 


      if (currentMessages.length === updatedMessages.length) {
          console.warn(`[Delete] Message with ID ${targetId} not found in current messages array. Filter had no effect.`); 
      } else {
          console.log(`[Delete] Filter successful. Calling messages.set()...`); 
          messages.set(updatedMessages); // <<-- 确认这一行存在且被执行
          console.log('[Delete] messages.set() called. Current IDs in store:', get(messages).map(m=>m.id)); // 验证 store 状态
      }
      
      hideContextMenu(); // Hide menu after operation
      // ---> ADD Explicit listener removal <---
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
      // Note: This only deletes from the current view. 
      // It doesn't affect the saved conversation history unless save logic is updated.
  }

  // --- NEW: Function to save active (unsaved) conversation state --- 
  async function saveActiveConversationState() {
      // This function is primarily called by the debounced reactive block
      // It assumes the conditions (unsaved, messages > 1) are already met by the caller
      try {
          const currentMsgs = get(messages);
          console.log(`[saveActiveState] Attempting to save ${currentMsgs.length} messages to ${ACTIVE_CONVERSATION_KEY}. Data:`, JSON.stringify(currentMsgs)); // Log data
          await pluginData.saveData(ACTIVE_CONVERSATION_KEY, currentMsgs);
          console.log(`[saveActiveState] Save attempt finished for ${ACTIVE_CONVERSATION_KEY}`); // Log completion
      } catch (error) {
          console.error('[saveActiveState] Error saving active conversation state:', error);
      }
  }

  // --- NEW: Function to clear persisted active conversation state --- 
  async function clearActiveConversationState() {
      try {
          console.log(`[clearActiveState] Clearing persisted state in ${ACTIVE_CONVERSATION_KEY}`);
          await pluginData.saveData(ACTIVE_CONVERSATION_KEY, null); // Save null or empty array to clear
      } catch (error) {
          console.error('[clearActiveState] Error clearing active conversation state:', error);
      }
  }

  // --- Reactive block to auto-save active state --- 
  $: {
      const currentMsgs = $messages; // Access store value reactively
      // Debounce the saving logic
      if (debounceSaveActiveTimeout) {
          clearTimeout(debounceSaveActiveTimeout);
      }
      debounceSaveActiveTimeout = window.setTimeout(() => {
          // Check conditions *inside* the debounced function
          if (currentConversationId === null && currentMsgs.length > 1) {
              console.log('[Debounced Save] Conditions met, calling saveActiveConversationState...');
              saveActiveConversationState();
          } else {
              // console.log('[Debounced Save] Conditions not met (saved or < 2 messages). Skipping save.');
          }
      }, SAVE_ACTIVE_DEBOUNCE_MS);
  }

</script>

<div class="ai-chat-panel">
  <!-- 添加对话管理 UI -->
  <div class="conversation-controls">
      <button class="b3-button" on:click={newConversation}>新建对话</button>
      
      {#if get(messages).length > 1 && !currentConversationId && !isLoading}
          <button class="b3-button b3-button--outline" on:click={saveCurrentConversation}>保存当前对话</button>
      {/if}
      
      <div class="history-dropdown">
        <button on:click={toggleHistory} title="加载或删除历史对话">
          📜 加载历史对话 {showHistory ? '▲' : '▼'} 
        </button>
        {#if showHistory}
          <div class="history-list">
            {#if savedConversations.length > 0}
              {#each savedConversations as conversation (conversation.id)}
                <div class="history-item">
                  <span class="history-item-name" on:click={() => { loadConversation(conversation.id); showHistory = false; }} title="加载此对话">{conversation.name}</span>
                  <button class="history-item-delete" on:click={(e) => deleteConversation(conversation.id, e)} title="删除此对话">×</button>
                </div>
              {:else}
                <div class="history-item-empty">没有已保存的对话</div>
              {/each}
            {:else}
               <div class="history-item-empty">没有已保存的对话</div>
            {/if}
          </div>
        {/if}
      </div>
      
      {#if currentConversationId}
        <button 
            class="b3-button b3-button--error" 
            title="删除当前对话"
            on:click={(e) => deleteConversation(currentConversationId, e)} >
            删除当前
        </button>
       {/if}
  </div>

  <div class="chat-history" bind:this={chatHistoryElement} on:contextmenu={handleContextMenu}> 
    {#each $messages as message (message.id)} 
        {#if message.role === 'user'}
            <div class="message user" data-message-id={message.id}>
                <div>{@html message.content.replace(/\n/g, '<br/>')}</div> 
            </div>
        {:else if message.role === 'assistant'}
            <div class="message ai" data-message-id={message.id}>
                {@html message.html || message.content} 
            </div>
        {/if} 
    {/each}
    {#if isLoading}
        <div class="message ai loading">
            <p>AI 正在思考...</p> 
        </div>
    {/if}
  </div>

  <!-- Reference Context Bar -->
  <ReferenceContext on:addDocumentReference={handleAddDocumentReference} />

  <!-- Input Area -->
  <div class="input-area">
    <textarea 
      bind:value={userInput} 
      placeholder="在此输入您的问题或指令..."
      rows="3"
      on:keydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
      disabled={isLoading}
    ></textarea>
    <button on:click={sendMessage} disabled={!userInput.trim() || isLoading}>发送</button>
    <!-- Add Reference Button -->
    <button 
      class="add-reference-button" 
      title="添加当前选中文本作为引用" 
      on:click={addSelectionReference} 
      disabled={!canAddReference || isLoading}
    >
      引用选区
    </button>
  </div>

  <!-- Custom Context Menu -->
  {#if showContextMenu}
    <div class="context-menu" style="top: {contextMenuTop}px; left: {contextMenuLeft}px;">
      <ul>
        <li on:click={copyMessage}>复制</li>
        <li on:click={deleteMessageHandler}>删除</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  /* 使用 flex 布局让输入区域固定在底部 */
  .ai-chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%; /* 确保面板占满 Dock 高度 */
    font-family: sans-serif;
    padding: 5px; /* 稍微减少内边距 */
    box-sizing: border-box; /* 防止 padding 导致溢出 */
    background-color: var(--b3-theme-background); /* Use theme background */
    color: var(--b3-theme-on-background); /* Use theme text color */
  }

  .chat-history {
    flex-grow: 1; /* 占据剩余空间 */
    overflow-y: auto; /* 内容多时可滚动 */
    border: 1px solid color-mix(in srgb, var(--b3-theme-on-surface) 10%, transparent); /* Fainter border */
    margin-bottom: 5px;
    padding: 8px;
    display: flex; /* 添加 flex 布局 */
    flex-direction: column; /* 消息垂直排列 */
    background-color: var(--b3-theme-surface); /* Use theme surface color for subtle difference */
  }

  /* --- Restore Previous Styles --- */
  /* 消息气泡基础样式 */
  .message {
      max-width: 80%;
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 15px;
      word-wrap: break-word;
      line-height: 1.4;
  }

  /* 用户消息样式 */
  .message.user {
      background-color: var(--b3-theme-primary); /* Use primary theme color */
      color: var(--b3-theme-on-primary); /* Use text color suitable for primary bg */
      align-self: flex-end; /* 用户消息靠右 */
      border-bottom-right-radius: 5px;
  }

  /* AI 消息样式 */
  .message.ai {
      background-color: var(--b3-theme-surface-lighter); /* Match reference bar bg? Use lighter surface */
      color: var(--b3-theme-on-surface); /* Use text color suitable for surface */
      align-self: flex-start; /* AI 消息靠左 */
      border-bottom-left-radius: 5px;
  }
  /* --- End Restore Previous Styles --- */

  .message p {
      margin: 0;
  }

  .message.ai :global(p) {
      /* 移除默认 margin，避免与气泡内边距冲突，并解决初始消息空行问题 */
      margin: 0; 
  }

  .input-area {
    display: flex;
    align-items: center; /* 垂直居中对齐输入框和按钮 */
    border-top: 1px solid var(--b3-theme-surface-lighter); /* Add border for separation */
    padding-top: 5px; /* Add some padding above input */
    background-color: var(--b3-theme-background); /* Match panel background */
  }

  textarea {
    flex-grow: 1; /* 输入框占据大部分宽度 */
    resize: none; /* 禁止调整大小 */
    margin-right: 5px;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--b3-theme-on-surface) 10%, transparent); /* Fainter border */
    border-radius: 3px;
    background-color: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
  }

  button {
    padding: 5px 10px;
    cursor: pointer;
    background-color: var(--b3-theme-primary); /* 使用思源主题色 */
    color: var(--b3-theme-on-primary); /* Use theme variable for text on primary */
    border: none;
    border-radius: 3px;
  }
  
  button:disabled {
      background-color: var(--b3-theme-disabled); /* Use theme disabled color */
      color: var(--b3-theme-on-disabled); /* Use theme disabled text color */
      cursor: not-allowed;
  }

  button:hover:not(:disabled) {
      opacity: 0.8;
  }

  /* 错误消息样式 */
  .message.error {
      background-color: #ffdddd; /* 淡红色背景 */
      color: #d8000c; /* 深红色文字 */
      align-self: stretch; /* 错误消息占满宽度 */
      text-align: center;
      border: 1px solid #d8000c;
  }

  /* AI 加载中样式 */
  .message.ai.loading p {
      font-style: italic;
      color: #666;
      /* 可以添加动画效果 */
      animation: blink 1.5s infinite ease-in-out;
  }
  
  @keyframes blink {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
  }

  .conversation-controls {
      display: flex;
      gap: 5px;
      padding: 5px 0;
      margin-bottom: 5px;
      flex-wrap: wrap; /* 换行 */
  }
  .conversation-controls select {
      flex-grow: 1; /* 下拉菜单占据剩余空间 */
      min-width: 100px; /* 避免太窄 */
  }

  /* 添加 Lute 生成的 HTML 的一些基本样式 */
  .message.ai :global(h1),
  .message.ai :global(h2),
  .message.ai :global(h3),
  .message.ai :global(h4),
  .message.ai :global(h5),
  .message.ai :global(h6) {
    margin-top: 0.8em;
    margin-bottom: 0.4em;
    line-height: 1.3;
  }
  .message.ai :global(p) {
      margin-bottom: 0.5em; 
      /* 移除默认 margin，避免与气泡内边距冲突 */
      margin-top: 0; 
  }
  .message.ai :global(ul),
  .message.ai :global(ol) {
      margin-left: 1.5em;
      margin-bottom: 0.5em;
  }
  .message.ai :global(pre) {
      background-color: var(--b3-theme-surface-lighter); 
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 0.5em;
  }
  .message.ai :global(code) {
      font-family: monospace;
      background-color: var(--b3-theme-surface-lighter);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      color: var(--b3-theme-on-surface); /* Ensure code text color adapts */
  }
  .message.ai :global(pre) > :global(code) {
      background-color: transparent; /* Keep transparent inside pre */
      padding: 0;
      border-radius: 0;
      color: inherit; /* Inherit color inside pre */
  }
  .message.ai :global(blockquote) {
      border-left: 3px solid var(--b3-theme-surface-lighter);
      padding-left: 10px;
      margin-left: 0;
      color: var(--b3-theme-on-surface-lighter);
  }
  .message.ai :global(table) {
      border-collapse: collapse;
      margin-bottom: 1em;
      width: auto;
  }
  .message.ai :global(th),
  .message.ai :global(td) {
      border: 1px solid var(--b3-theme-surface-lighter);
      padding: 6px 10px;
  }
  .message.ai :global(th) {
      background-color: var(--b3-theme-surface-lighter);
      color: var(--b3-theme-on-surface); /* Ensure header text color adapts */
  }

  .add-reference-button {
    margin-left: 5px;
    background-color: var(--b3-theme-secondary); /* Different color */
    color: var(--b3-theme-on-secondary, var(--b3-theme-on-primary)); /* Add text color, fallback to on-primary */
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: sans-serif;
    padding: 5px;
    box-sizing: border-box;
  }

  .chat-header {
    display: flex;
    gap: 5px;
    padding: 5px 0;
    border-bottom: 1px solid var(--b3-theme-surface-lighter);
    margin-bottom: 5px;
  }

  .chat-header button {
    margin-right: 5px;
    padding: 3px 8px;
  }

  .history-dropdown {
    display: inline-block;
    position: relative;
  }

  .history-list {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-surface-lighter);
    border-radius: 4px;
    padding: 5px;
    min-width: 200px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    color: var(--b3-theme-on-surface); /* Ensure text color adapts */
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    cursor: pointer;
    border-radius: 3px;
  }

  .history-item:hover {
    background-color: var(--b3-theme-surface-lighter);
  }

  .history-item-name {
    flex-grow: 1;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-item-delete {
    background: none;
    border: none;
    color: var(--b3-theme-error);
    font-size: 1.2em;
    padding: 0 5px;
    cursor: pointer;
    line-height: 1;
    opacity: 0.7;
  }

  .history-item-delete:hover {
    opacity: 1;
  }

  .history-item-empty {
    padding: 5px;
    color: var(--b3-theme-on-disabled); /* Use disabled color for empty message */
    font-style: italic;
  }

  /* --- Custom Context Menu Styles --- */
  .context-menu {
    position: fixed; /* Use fixed to position relative to viewport */
    background-color: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-surface-lighter);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000; /* Ensure it's on top */
    min-width: 100px;
    padding: 5px 0; /* Padding top/bottom for the list */
    color: var(--b3-theme-on-surface); /* Ensure text color adapts */
  }

  .context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .context-menu li {
    padding: 8px 12px;
    cursor: pointer;
    white-space: nowrap;
  }

  .context-menu li:hover {
    background-color: var(--b3-theme-primary-light); /* Adjust hover color if needed */
    color: var(--b3-theme-primary-darker); /* Adjust text color on hover if needed */
  }

  /* Target the last element inside AI messages to remove bottom margin */
  .message.ai > :global(*:last-child) {
    margin-bottom: 0 !important; 
  }

  /* --- Force Text Selection --- */
  /* Attempt to override potential user-select: none from parent or Siyuan */
  .message.user div,
  .message.ai :global(p),
  .message.ai :global(code),
  .message.ai :global(li),
  .message.ai :global(pre),
  .message.ai :global(blockquote),
  .message.ai :global(td),
  .message.ai :global(th) {
      user-select: text !important; 
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
  }

</style> 