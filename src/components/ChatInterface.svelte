<script lang="ts">
	// This is where your component logic will go
	// For now, let's just add a variable for the title
	let title = "AI Chat Interface";
</script>

<div class="chat-interface">
	<h1>{title}</h1>
	<p>This is the placeholder for the chat UI.</p>
	<p>We will add input fields and message display here later.</p>
</div>

<style>
	.chat-interface {
		padding: 15px;
		font-family: sans-serif;
		height: 100%; /* Ensure the component fills the dock */
		display: flex;
		flex-direction: column;
	}
	h1 {
		color: var(--b3-theme-primary);
		margin-top: 0;
	}
</style> 