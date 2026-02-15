<script lang="ts">
	import { baseState } from "$lib/globalState.svelte";
	import { displayCalc, displayNumber, doCalc, type InfixOperator, type InfixOrPrefixCalc } from "$lib/mathstuff.svelte";
    let base = $derived(baseState.base);

    let pastQuestions = $state<{ question: InfixOrPrefixCalc, answer: number }[]>([]);

    let currQuestion = $state<InfixOrPrefixCalc>(generateQuestion());
    let currQuestionAnswer = $derived(doCalc(currQuestion));


    let currQuestionInput = $state("");



    function generateQuestion(): InfixOrPrefixCalc {
        const num1 = Math.ceil(Math.random() * (2 + pastQuestions.length));
        const num2 = Math.ceil(Math.random() * (2 + pastQuestions.length));

        const ops: InfixOperator[] = ['+', '-', '*', '÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        const q: [number, InfixOperator, number] = [num1, op, num2];
        if (!Number.isInteger(doCalc(q))) return generateQuestion();
        return q;
    }

    function submittedAnswer() {
        let answer = parseInt(currQuestionInput, base);
        console.log(answer, currQuestionAnswer);
        if (Array.isArray(currQuestionAnswer)) throw new Error("huh?");

        if (Math.abs(answer - currQuestionAnswer) < 0.0001) {
            pastQuestions.push({question: currQuestion, answer: currQuestionAnswer });
            currQuestion = generateQuestion();
            currQuestionInput = "";
        }
    }

</script>

<div class="container-container">
    <div class="questions">
        {#each pastQuestions as question }
            <span>{`${displayCalc(question.question)} = ${displayNumber(question.answer)}`}</span>
        {/each}
        <div class="curr-question">
            <span>{displayCalc(currQuestion) + ' ='}</span>
            
            <input type="number"
                id="multiples-of"
                style:width="60px"
                style:height="30px"
                style:margin-left="15px"
                bind:value={currQuestionInput}
                onkeydown={e => { if (e.key === 'Enter') { submittedAnswer() } }}
            />
        </div>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        justify-content: center;
		font-family: 'JetBrains Mono', monospace;
    }

    .questions {
        color: var(--color-theme-1);
        font-size: 2rem;
        
        display: flex;
        flex-direction: column;
    }

    .curr-question {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>