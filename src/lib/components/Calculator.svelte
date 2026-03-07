<script lang="ts">
	import { STATE } from '$lib/globalState.svelte';
	import { displayCalc, displayInfix, doInfixCalc, doPrefixCalc, type InfixOperator, type InfixOrPrefixCalc, type PrefixOperator } from '$lib/mathstuff.svelte';
	import { untrack } from 'svelte';
	import NumKeypad from './reuseable/NumKeypad.svelte';

	// ------------------------------
	//      Calculator State
	// ------------------------------
	let inputLeft: number | number[] | string | null = $state(null);
	let currInfixOp: InfixOperator | null = $state(null);
	let inputRight: number | null = $state(0); 		// the number you are currently inputting
	let decimalDigit: number | null = $state(null); // which decimal digit you are currently typing in

	let pastCalc: InfixOrPrefixCalc | null = $state(null);

	const displayedCalc = $derived(displayInfix(inputLeft, currInfixOp, inputRight, decimalDigit));
	const displayedPastCalc = $derived(pastCalc ? displayCalc(pastCalc) : '');

	function clearInput() {
		inputLeft = null;
		currInfixOp = null;
		inputRight = 69420; // needed to update sveltes state on -0, 0
		inputRight = 0;
		decimalDigit = null;
		pastCalc = null;
	}

	function pressInfixOp(op: InfixOperator) {
		if (Array.isArray(inputLeft)) return;
		pastCalc = null;
		if (op === '-' && inputRight === 0) {
			const isNegative = Object.is(inputRight, -0);
			inputRight = 69420; // needed to update sveltes state on -0, 0
			inputRight = isNegative ? 0 : -0;
			return;
		}
		if (op === '-' && currInfixOp != null && inputRight == null) {
			inputRight = -0;
			return;
		}
		if (inputRight != null) {
			if (inputLeft == null) {
				inputLeft = inputRight;
			} else {
				pressEquals();
			}
			inputRight = null;
		}
		currInfixOp = op;
		decimalDigit = null;
	}

	function pressPrefixOp(op: PrefixOperator) {
		if (inputLeft !== null && typeof inputLeft !== 'number') return;
		if (inputLeft != null && inputRight == null && currInfixOp == null) {
			inputRight = inputLeft;
			inputLeft = null;
		}
		if (inputRight == null) return;
		decimalDigit = null;

		const result = doPrefixCalc(op, inputRight);

		pastCalc = [op, inputRight];

		if (inputLeft != null && currInfixOp != null && typeof result === 'number') inputRight = result;
		else {
			inputLeft = result;
			currInfixOp = null;
			inputRight = null;
		}
	}

	$effect(() => {
		STATE.base;
		// recalculate prefix operations on base switch, the result
		// can change on base dependendent ops like: Sum, Prim, log, %, Say
		untrack(() => {
			if (pastCalc != null && pastCalc.length === 2) {
				inputRight = pastCalc[1];
				if (currInfixOp == null) inputLeft = null;
				pressPrefixOp(pastCalc[0]);
			}
		});
	});

	function pressEquals() {
		if (inputLeft != null && inputRight == null && pastCalc != null) {
			if (pastCalc.length == 3) {
				currInfixOp = pastCalc[1];
				inputRight = pastCalc[2];
			} else {
				pressPrefixOp(pastCalc[0]);
			}
		}
		if (inputLeft == null || typeof inputLeft !== 'number' || inputRight == null || currInfixOp == null) return;

		const result = doInfixCalc(inputLeft, currInfixOp, inputRight);

		pastCalc = [inputLeft, currInfixOp, inputRight];
		inputLeft = result;
		inputRight = null;
		currInfixOp = null;
		decimalDigit = null;
	}

	function loadConstant(n: number) {
		pastCalc = null;
		if (currInfixOp == null) {
			inputLeft = null;
		}
		inputRight = n;
		decimalDigit = Infinity;
	}

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.contentEditable === 'true'
		)
			return;
		const k = e.key;
		if (k == '+' || k == '-' || k == '^') pressInfixOp(k);
		else if (k == '*') pressInfixOp('×');
		else if (k == '/') pressInfixOp('÷');
		else if (k == '!') pressPrefixOp('!');
		else if (k == 'Enter' || k == '=') pressEquals();
		else return;
		e.preventDefault();
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
<div class="container">
	<header>
		<span class="brand">{STATE.baseName.toUpperCase()} IT-{(69).toString(STATE.base)}D</span>
	</header>
	<div class="output-area">
		<div class="past-calc">{displayedPastCalc}</div>
		<div class="curr-calc">{displayedCalc}</div>
	</div>
	<div class="calc-buttons" style:--columns="5" style:margin-bottom="25px">
		<button class="util" onclick={() => pressPrefixOp('√')}>√</button>
		<button class="util" onclick={() => pressInfixOp('^')}>xⁿ</button>
		<button class="util" onclick={() => pressPrefixOp('!')}>x!</button>
		<button class="util" onclick={() => pressInfixOp('mod')}>mod</button>
		<button class="util" onclick={() => pressInfixOp('log_')}>logₓ</button>
		<button class="util" onclick={() => pressPrefixOp('1/')}>¹⁄ₓ</button>
		<button class="util" onclick={() => pressPrefixOp('Prim ')}>Prim</button>
		<button class="const" onclick={() => loadConstant(Math.E)}>e</button>
		<button class="const" onclick={() => loadConstant(Math.PI)}>π</button>
		<button class="const" onclick={() => loadConstant((1 + Math.sqrt(5)) / 2)}>ϕ</button>
	</div>
	<div class="calc-buttons" style:--columns="5" style:margin-bottom="25px">
		<button class="dyn" onclick={() => pressPrefixOp('%')}>%</button>
		<button class="dyn" onclick={() => pressPrefixOp('log ')}>log</button>
		<button class="dyn" onclick={() => pressPrefixOp('Sum ')}>Sum</button>
		<button class="dyn" onclick={() => pressPrefixOp('Say ')}>Say</button>
	</div>
	<div style:display="flex" style:justify-content="center" style:gap="25px">
		<NumKeypad
			columns={3}
			bind:inputNum={inputRight}
			bind:decimalDigit
			{clearInput}
			onDeNull={() => {
				if (currInfixOp == null) clearInput();
			}}
		/>
		<div class="calc-buttons" style:--columns="2">
			<button class="util" onclick={() => pressInfixOp('×')}>×</button>
			<button class="util" onclick={() => pressInfixOp('÷')}>÷</button>
			<button class="util" onclick={() => pressInfixOp('+')}>+</button>
			<button class="util" onclick={() => pressInfixOp('-')}>-</button>
			<button class="ac" onclick={clearInput}>AC</button>
			<button class="equals" onclick={pressEquals}>=</button>
		</div>
	</div>
</div>

<style>
	.container {
		padding: 15px;
		border: 2px solid var(--color-bg-1);
		border-radius: 20px;
		font-family: MATH;
	}

	.brand {
		font-weight: 800;
		letter-spacing: 2px;
		font-size: 0.8rem;
		color: var(--color-text-dim);
	}

	.output-area {
		padding: 10px;
		margin-top: 20px;
		margin-bottom: 20px;
		background-color: black;
		border: 2px solid var(--color-bg-1);
		border-radius: 8px;

		text-align: right;
		white-space: wrap;

		min-height: 50px;
		width: clamp(200px, 80vw, 350px);
		display: flex;
		flex-direction: column;
		justify-content: end;
		overflow: hidden;

		& .curr-calc {
			display: flex;
			justify-content: flex-end;
			font-size: clamp(1.2rem, 5vw, 1.6rem);
		}
		& .past-calc {
			display: flex;
			justify-content: flex-end;
			font-size: 1rem;
			color: var(--color-theme-blue);
			opacity: 0.7;
		}
	}
</style>
