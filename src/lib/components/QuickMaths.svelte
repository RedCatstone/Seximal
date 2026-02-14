<script lang="ts">
	import type { InfixOperator, PrefixOperator } from "$lib/mathstuff.svelte";

    let curr_question: [number, InfixOperator, number] | [PrefixOperator, number] = $state([3, "*", 5]);
    let past_questions: {
        q: [number, InfixOperator, number] | [PrefixOperator, number],
        answer: number,
        user_answer: number
    }[] = [];



    function generateQuestion(): [number, InfixOperator, number] | [PrefixOperator, number] {
        return [4, "*", 5];
    }

</script>

