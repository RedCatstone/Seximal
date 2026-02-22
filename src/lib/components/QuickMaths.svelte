<script lang="ts">
	import { getBaseName, STORED_STATE } from "$lib/globalState.svelte";
	import { displayCalc, displayKeypadNum, displayNumber, doCalc, type InfixOperator, type InfixOrPrefixCalc } from "$lib/mathstuff.svelte";
	import NumKeypad from "./reuseable/NumKeypad.svelte";
    const base = $derived(STORED_STATE.base);

    let currGameBase: number | null = $state(null);
    let pastQuestions: { question: InfixOrPrefixCalc, answer: number }[] = $state([]);
    let currQuestion: InfixOrPrefixCalc = $state(generateQuestion());

    let keypadInputNum: number | null = $state(null);
    let keypadDecimal: number | null = $state(null);

    // timestamp when the timer runs out
    let timeLeftMs: number | null = $state(null);
    let gameOver = $state(false);
    const TIMER_MAX_TIME = 18_000;
    const TIMER_SUCCESS = 2_000;
    const TIMER_FAIL = -500;
    
    let scrollAnchor = $state<HTMLElement | null>(null);


    function generateQuestion(): InfixOrPrefixCalc {
        const ops: InfixOperator[] = ['+', '-', '*', '÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        let upTo = (op == '*') ? 2 + pastQuestions.length / 2
            : (op == '÷') ? 2 + pastQuestions.length / 3
            : 2 + pastQuestions.length;

        const num1 = Math.floor(Math.random() * upTo) || base;
        const num2 = Math.floor(Math.random() * upTo) || base;


        const q: [number, InfixOperator, number] = [num1, op, num2];

        // if it 2 decimals or less
        const answer = doCalc(q);
        const decimalDigitsAllowed = pastQuestions.length > 10 ? 1 : 0;
        if (!Array.isArray(answer) && !Number.isInteger(base**decimalDigitsAllowed * answer)) return generateQuestion();
        return q;
    }

    function submitAnswer() {
        if (gameOver) return;
        const answer = doCalc(currQuestion);
        if (Array.isArray(answer)) throw new Error("huh?");

        if (keypadInputNum != null && Math.abs(keypadInputNum - answer) < 0.0001) {
            // correct!!
            if (timeLeftMs == null) {
                // start the timer
                timeLeftMs = TIMER_MAX_TIME;
                currGameBase = base;
            } else {
                timeLeftMs += TIMER_SUCCESS;
            }

            pastQuestions.push({question: currQuestion, answer });
            currQuestion = generateQuestion();
            clearInput();
        }
        else if (timeLeftMs != null) {
            timeLeftMs += TIMER_FAIL;
        }
    }

    // scroll effect
    $effect(() => {
        // "read" the length to create a dependency
        pastQuestions.length;
        scrollAnchor!.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    // timer effect
    $effect(() => {
        // "read" the timeLeftMs to create a dependency
        timeLeftMs;
        let previousFrameTimestamp = performance.now();
        let frame = requestAnimationFrame(function tick(timestamp: DOMHighResTimeStamp) {
            if (timeLeftMs != null) {
                const delta = timestamp - previousFrameTimestamp;
                previousFrameTimestamp = timestamp;
                const newTimeLeft = Math.min(timeLeftMs - delta, TIMER_MAX_TIME);
                if (newTimeLeft <= 0) {
                    makeGameOver();
                } else {
                    timeLeftMs = newTimeLeft;
                    frame = requestAnimationFrame(tick);
                }
            }
        });
        return () => cancelAnimationFrame(frame);
    });

    // game-over on base switch
    $effect(() => {
        if (currGameBase != null && base != currGameBase) {
            // switched base mid game...
            makeGameOver();
        }
    })

    function makeGameOver() {
        gameOver = true;
        timeLeftMs = 0;
        keypadDecimal = null;
        const answer = doCalc(currQuestion);
        if (!Array.isArray(answer)) {
            keypadInputNum = answer;
        }
        if (pastQuestions.length > (STORED_STATE.quickMathsHighscores[currGameBase!] ?? 0)) {
            STORED_STATE.quickMathsHighscores[currGameBase!] = pastQuestions.length;
        }
    }

    function retry() {
        gameOver = false;
        timeLeftMs = null;
        currGameBase = null;
        clearInput();
        pastQuestions.length = 0;
        currQuestion = generateQuestion();
    }

    function handleKeyDown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') return;

        const k = e.key;
        if (k == 'Enter') submitAnswer();
        else if (k == '-') pressMinus();
    }
    function clearInput() {
        if (gameOver) return;
        keypadInputNum = null;
        keypadDecimal = null;
    }

    function pressMinus() {
        if (gameOver) return;
        if (keypadInputNum == null) keypadInputNum = 0;

        const before = keypadInputNum;
        keypadInputNum = 69420; // needed to update sveltes state on -0, 0
        keypadInputNum = -before;
    }
</script>

<svelte:window onkeydown={handleKeyDown} />
<div class="container-container" class:game-over={gameOver} style:--questions={pastQuestions.length}>
    <div class="questions" bind:this={scrollAnchor}>
        {#each pastQuestions as question, i }
            <span data-number={(i+1).toString(base)} style:--i={i}>{`${displayCalc(question.question)} = ${displayNumber(question.answer)}`}</span>
        {/each}

        <div class="curr-question">
            <span data-number={(pastQuestions.length+1).toString(base)}>{displayCalc(currQuestion) + ' ='}</span>
            <div class="input-num">{keypadInputNum != null ? displayKeypadNum(keypadInputNum, keypadDecimal) : ''}</div>
        </div>
    </div>
    {#if timeLeftMs != null }
        <div class="timer-stuff">
            <span>{Math.ceil(timeLeftMs / 1000).toString(base)}</span>
            <div class="timer-bar" style:--fill={`${timeLeftMs * 100 / TIMER_MAX_TIME}%`}></div>
        </div>
    {/if}
    {#if gameOver }
        <div class="game-over-msg">
            You got
                <span class="questions-correct">{pastQuestions.length.toString(base)}</span>
                <span>{getBaseName(currGameBase!)}</span>
                Question{pastQuestions.length == 1 ? '' : 's'} correct!
            <br>(Best: {STORED_STATE.quickMathsHighscores[currGameBase!].toString(base)})
            <button class="util" onclick={retry}>Retry</button>
        </div>
    {/if}
    <div class="num-keypad" bind:this={scrollAnchor}>
        <NumKeypad columns={3} bind:inputNum={keypadInputNum} bind:decimalDigit={keypadDecimal} {clearInput} disabled={gameOver} />
        <div class="calc-buttons">
            <button class="ac" onclick={clearInput}>AC</button>
            <button class="equals" onclick={submitAnswer}>=</button>
            <button class="digit" onclick={pressMinus}>-</button>
        </div>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
		font-family: 'JetBrains Mono', monospace;

        --questions-color: hsl(from var(--color-theme-1)  calc(h + calc(4 * var(--questions)))  s l);
    }

    .questions {
        counter-reset: q;
        font-size: clamp(1.3rem, 7vw, 2rem);
        
        display: flex;
        flex-direction: column;
        --i: var(--questions); /* Fallback for the current question */

        & span {
            color: hsl(from var(--color-theme-1)  calc(h + calc(4 * var(--i)))  s l);
        }

        & span::before {
            /* counter-increment: q; */
            content: attr(data-number) '. ';
            color: var(--color-bg-2);
            font-size: 1.4rem;
        }

        & .input-num {
            display: inline-block;
            white-space: nowrap;
            width: clamp(40px, 18vw, 100px);
            padding: 0 5px;

            color: var(--color-theme-2);
            border-bottom: 2px solid var(--color-bg-2);
            margin-bottom: -2px;
            
            /* border doesn't shift when content is '' */
            vertical-align: bottom;
        }
    }

    .game-over {
        & .input-num {
            color: var(--color-bg-2);
        }
        & .num-keypad {
            opacity: 0.4;
        }
    }
    
    .game-over-msg {
        padding: 10px;
        border: 2px solid var(--color-bg-2);
        border-radius: 10px;
        text-align: center;

        .questions-correct {
            color: var(--questions-color);
            font-size: 2rem;
        }
    }

    .timer-stuff {
        --timer-color: hsl(from var(--questions-color) calc(h + 200) s l);
        color: var(--timer-color);
        font-size: 1.5rem;

        display: flex;
        align-items: center;
        gap: 15px;

        & .timer-bar {
            height: 10px;
            width: clamp(50px, 50vw, 300px);
            border: 1px solid white;
            border-radius: 10px;
            position: relative;

            &::before {
                content: '';
                left: 0;
                top: 0;
                height: 100%;
                width: var(--fill);
                position: absolute;
                border-radius: inherit;
                background: var(--timer-color);
                opacity: 0.5;
            }
        }
    }

    .num-keypad {
        display: flex;
        gap: 25px;
        padding: 15px;
        margin-bottom: 40px;
        align-items: center;
        border: 2px solid var(--color-bg-1);
        background: var(--color-bg-0);
        border-radius: 20px;
    }
</style>