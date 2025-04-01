<script lang="ts">
  import { onMount } from 'svelte';

  // 从 props 接收插件实例或特定函数和当前设置
  export let loadSettings: () => Promise<any>; 
  export let saveSettings: (data: any) => Promise<void>;
  export let currentSettings: { apiUrl: string; apiKey: string; modelName: string };

  let apiUrl = '';
  let apiKey = '';
  let modelName = '';
  let statusMessage = ''; // 用于显示保存状态

  // 组件挂载时加载设置
  onMount(async () => {
    if (currentSettings) {
      apiUrl = currentSettings.apiUrl || '';
      apiKey = currentSettings.apiKey || '';
      modelName = currentSettings.modelName || 'deepseek-chat';
    } else {
      // 如果没有从 props 接收到，尝试自己加载（作为备用）
      const loaded = await loadSettings();
      apiUrl = loaded.apiUrl || '';
      apiKey = loaded.apiKey || '';
      modelName = loaded.modelName || 'deepseek-chat';
    }
  });

  // 保存设置函数
  async function handleSave() {
    try {
      await saveSettings({ apiUrl, apiKey, modelName });
      statusMessage = '设置已保存！';
      setTimeout(() => statusMessage = '', 3000); // 3秒后清除消息
    } catch (error) {
      statusMessage = `保存失败: ${error.message}`;
    }
  }
</script>

<div class="settings-panel">
  <h2>AI 助手设置</h2>

  <div class="form-item">
    <label for="api-url">AI API Endpoint URL:</label>
    <input 
      id="api-url" 
      type="text" 
      bind:value={apiUrl} 
      placeholder="例如: https://api.openai.com/v1/chat/completions"
      class="b3-text-field"
    />
    <p class="description">请输入您要使用的 AI 服务的完整 URL。</p>
  </div>

  <div class="form-item">
    <label for="api-key">API Key:</label>
    <input 
      id="api-key" 
      type="password" 
      bind:value={apiKey} 
      placeholder="请输入您的 API Key"
      class="b3-text-field"
    />
     <p class="description">您的 API Key 将被保存在本地配置文件中。</p>
  </div>

  <div class="form-item">
    <label for="model-name">模型名称:</label>
    <input 
      id="model-name" 
      type="text" 
      bind:value={modelName} 
      placeholder="例如: deepseek-chat, gpt-4o, ..."
      class="b3-text-field"
    />
    <p class="description">请输入要调用的具体模型名称。</p>
  </div>

  <div class="actions">
      <button class="b3-button b3-button--primary" on:click={handleSave}>保存设置</button>
      {#if statusMessage}
          <span class="status-message">{statusMessage}</span>
      {/if}
  </div>

</div>

<style>
  .settings-panel {
    padding: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  .form-item {
    margin-bottom: 15px;
  }
  .form-item label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-item input {
      width: 100%; /* 输入框占满宽度 */
      box-sizing: border-box; /* 防止 padding 导致溢出 */
  }
  .description {
      font-size: 0.9em;
      color: #666;
      margin-top: 3px;
  }
  .actions {
      margin-top: 20px;
      display: flex;
      align-items: center;
  }
  .status-message {
      margin-left: 15px;
      font-style: italic;
  }
</style> 