<script lang="ts">
	import { page } from '$app/state';
</script>

<nav class="module-nav">
	<div class="links">
        <a href="/counting" class:active={page.url.pathname === '/counting'}>
            Counting
        </a>
		<a href="/calculator" class:active={page.url.pathname === '/calculator'}>
			Calculator
		</a>
		<a href="/quickmaths" class:active={page.url.pathname === '/quickmaths'}>
			Quick Maths
		</a>
	</div>
</nav>

<style>
	.module-nav {
		display: flex;
		justify-content: center;
		padding: 10px 0;
        margin-bottom: 15px;
		background: rgba(0, 0, 0, 0.3);
		border-bottom: 1px solid var(--color-bg-1);
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

		transition: all 0.2s ease;

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