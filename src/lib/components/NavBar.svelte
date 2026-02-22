<script lang="ts">
	import { page } from '$app/state';
    import { resolve } from '$app/paths';
</script>

<div class="container-container">
	<nav class="container">
		<div class="links">
			<a href={resolve("/counting")} class:active={page.url.pathname === resolve("/counting")}>Counting</a>
	        <a href={resolve("/patterns")} class:active={page.url.pathname === resolve("/patterns")}>Patterns</a>
			<a href={resolve("/calculator")} class:active={page.url.pathname === resolve("/calculator")}>Calculator</a>
			<a href={resolve("/quickmaths")} class:active={page.url.pathname === resolve("/quickmaths")}>Quick Maths</a>
		</div>
	</nav>
</div>

<style>
	.container-container {
		display: flex;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
        margin-bottom: 5px;
		border-bottom: 1px solid var(--color-bg-1);
		padding: 10px 0;
	}

	.container {
		display: flex;
		overflow-x: auto;
	}

	.links {
		display: flex;
		gap: 20px;
    	box-shadow: inset 0 -2px 0 color-mix(in oklab, var(--color-theme-2) 50%, black 50%);
        padding: 0 10px;
	}

	a {
		text-decoration: none;

		color: var(--color-text-dim, #666);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 1px;

		gap: 5px;
		padding: 5px 10px;
		display: flex;
		align-items: center;

        /* & span {
	    	font-size: 0.65rem;
	    	color: var(--color-theme-2);
	    	opacity: 0.5;
	    } */

    	&:hover {
    		color: white;
    		background: rgba(255, 255, 255, 0.05);
    	    box-shadow: inset 0 -2px 0 color-mix(in oklab, var(--color-theme-2) 70%, black 30%);
    	}

    	&.active {
    		color: white;
    		background: rgba(255, 255, 255, 0.05);
    		box-shadow: inset 0 -2px 0 var(--color-theme-2);
    	}
    }
</style>