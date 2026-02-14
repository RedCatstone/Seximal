<script lang="ts">
	import { baseState, getBaseName } from "$lib/globalState.svelte";

    const PRESET_BASES = [4, 6, 10, 12, 16];
    let customInputValue = $state("");

    function changeBase(b: number) {
        if (b >= 2 && b <= 36) {
            baseState.base = b;
        }
    }

    function getPoints(sides: number) {
        const r = 49; // Out of 50
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(" ");
    }
</script>

<nav class="container-container">
    <div class="container">
        <span>BASE:</span>
        {#each PRESET_BASES as b}
            <button class:active={baseState.base === b} onclick={() => { changeBase(b); customInputValue = "" }}>
                <svg viewBox="0 0 100 100">
                    <polygon points={getPoints(b)} />
                </svg>
                <span>{getBaseName(b)}</span>
            </button>
        {/each}

        <div class="base-input" class:active={!PRESET_BASES.includes(baseState.base)}>
            <input type="number"
                id="custom-base"
                min="2" max="36"
                placeholder="custom" bind:value={customInputValue}
                oninput={e => changeBase(Number(e.currentTarget.value))}
            />
            <span>{baseState.baseName}</span>
        </div>
    </div>
</nav>

<style>
    .container-container {
        display: flex;
        justify-content: center;
    }

    .container {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        padding: 8px 16px;
        border: 2px solid var(--color-bg-1);
        
        & button {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            height: 60px;

            background: transparent;
            border: transparent;
            cursor: pointer;

            color: var(--color-text-dim);
            font-size: 0.8rem;
            font-weight: 500;

            & polygon {
                fill: var(--color-bg-2); /* background color */
                stroke: var(--color-bg-1); /* border color */
                stroke-width: 5;
                stroke-linejoin: round;
            }
            &.active {
                color: var(--color-theme-2);

                & polygon {
                    fill: color-mix(in oklab, var(--color-theme-2) 50%, black 50%);
                    stroke: var(--color-theme-2);
                    stroke-width: 3;
                }
            }
        }

        & .base-input {
            width: 70px;
            display: flex;
            flex-direction: column;
            align-items: center;

            color: var(--color-theme-2);
            font-size: 0.8rem;
            font-weight: 500;
            white-space: nowrap;

            &:not(.active) span {
                display: none;
            }
            &.active input {
                border: 1px solid var(--color-theme-2);
            }
        }
    }
</style>