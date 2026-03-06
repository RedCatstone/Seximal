<script lang="ts">
    import { pronounce, STORED_STATE } from "$lib/globalState.svelte";
    const base = $derived(STORED_STATE.base);

    const { value }: { value: number } = $props();
    
    const NUMBERS_ON_EACH_SIDE = 1;
    const numbers = $derived(Array.from({ length: NUMBERS_ON_EACH_SIDE * 2 + 1 }, (_, i) => value - NUMBERS_ON_EACH_SIDE + i));
</script>

<div class="module">
    <h3>Pronounciation</h3>
    <p>
        To not confuse these numbers in other bases with decimal numbers, we would need a different way to say them.
        Note that this pronounciation system is made up by me. But it does work well!
    </p>

    <div class="grid" style:grid-template-columns="repeat({NUMBERS_ON_EACH_SIDE * 2 + 1}, 1fr)">
        {#each numbers as n }
            <div class="number">
                <span>{n.toString(base)}</span>
                <span>{pronounce(n)}</span>
            </div>
        {/each}
    </div>

    
</div>

<style>
    .grid {
        display: grid;
        font-size: 1.2rem;
        padding: 15px;
        gap: 15px;
        background: rgba(0,0,0,0.3);
    }

    .number {
        display: flex;
        flex-direction: column;
        text-align: center;
    }
</style>