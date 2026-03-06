<script lang="ts">
	import { STORED_STATE } from '$lib/globalState.svelte';
	const base = $derived(STORED_STATE.base);

	let { value = $bindable() }: { value: number } = $props();

	// config
	const ITEM_WIDTH = 70; // pixels
	const FRICTION = 0.94; // slow down factor
	const SNAP_STRENGTH = 0.25;
	const NUMBERS_ON_EACH_SIDE = 5;
	const BASE_FRAME_TIME = 1000 / 100; // baseline 100fps

	// physics state
	let offset = $state(0); /* is mostly around -0.5 and 0.5 */
	let velocity = $state(0);
	let isDragging = $state(false);
	let lastX = 0;
	let lastTimestamp: DOMHighResTimeStamp = 0;

	function addToOffset(n: number) {
		offset += n;
		// normalize x to be within -0.5 and 0.5 and add any remainder onto value
		value += Math.round(offset);
		offset -= Math.round(offset);
	}

	// we only show a few numbers around the current one
	const visibleNumbers = $derived(Array.from(
		{ length: NUMBERS_ON_EACH_SIDE * 2 + 1 },
		(_, i) => value - NUMBERS_ON_EACH_SIDE + i
	));

	// Input Handlers
	function onpointerdown(e: PointerEvent) {
		isDragging = true;
		velocity = 0;
		lastX = e.clientX;
		lastTimestamp = performance.now();
	}
	function onpointermove(e: PointerEvent) {
		if (!isDragging) return;

		const now = performance.now();
		const delta = now - lastTimestamp;
		lastTimestamp = now;
		const dx = e.clientX - lastX;
		lastX = e.clientX;

		// update offset based on drag distance
		addToOffset(-dx / ITEM_WIDTH);
		// calculate velocity (pixels per frame)
		if (delta > 0) {
			velocity = -(dx / ITEM_WIDTH) * (BASE_FRAME_TIME / delta);
		}
	}
	function onpointerup() {
		isDragging = false;
		lastTimestamp = performance.now();

		// physics loop
		requestAnimationFrame(function tick(timestamp: DOMHighResTimeStamp) {
			const delta = (timestamp - lastTimestamp) / BASE_FRAME_TIME;
			lastTimestamp = timestamp;

			addToOffset(velocity * delta);
			velocity *= FRICTION ** delta;

			// snapping
			if (Math.abs(velocity) < 0.01) {
				velocity = 0;
				// pull offset towards 0
				addToOffset(-offset * SNAP_STRENGTH);
				if (Math.abs(offset) < 0.001) {
					addToOffset(-offset); // offset = 0
					return; // stop the loop
				}
			}
			requestAnimationFrame(tick);
		});
	}

	function addToValue(n: number) {
		// slight scroll effect
		velocity = n / 16;  // some abitruary value
	}
</script>

<svelte:window {onpointerup} onpointercancel={onpointerup} />
<div class="container" role="slider" aria-valuenow={value} tabindex="0"
	{onpointerdown} {onpointermove}>
	<!-- <div class="selector-outline"></div> -->

	<div class="ribbon"
		style:transform="translateX({(Math.round(offset) - offset) * ITEM_WIDTH - ITEM_WIDTH / 2}px)">
		{#each visibleNumbers as n, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="number-item"
				class:active={value === n}
				onclick={() => addToValue(i - NUMBERS_ON_EACH_SIDE)}
				style:width="{ITEM_WIDTH}px"
				style:transform="translateX({(i - NUMBERS_ON_EACH_SIDE) * ITEM_WIDTH}px)"
			>
				{n.toString(base)}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		position: relative;

		background: black;
		border: 1px solid var(--color-bg-1);
		overflow: hidden;
		cursor: grab;
		touch-action: none;
		user-select: none;

		&:active {
			cursor: grabbing;
		}

		/* Fade effect on the sides */
		&::before, &::after {
			content: '';
			position: absolute;
			top: 0;
			width: 5%;
			height: 100%;
			z-index: 2;
			pointer-events: none;
		}
		&::before {
			left: 0;
			background: linear-gradient(to right, black, transparent);
		}
		&::after {
			right: 0;
			background: linear-gradient(to left, black, transparent);
		}
	}

	/* .selector-outline {
        position: absolute;
        width: 65px;
        height: 50px;
        border: 2px solid var(--color-theme-2);
        border-radius: 10px;
        z-index: 1;
    } */

	.ribbon {
		height: 100%;

		& .number-item {
			position: absolute;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-family: 'JetBrains Mono', monospace;
			font-size: 1rem;
			color: var(--color-text-dim);
			will-change: transform;

			&.active {
				color: var(--color-text);
				font-size: 1.3rem;
				font-weight: bold;
				z-index: 1;
			}
		}
	}
</style>