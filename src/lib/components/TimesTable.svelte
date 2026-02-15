<script lang="ts">
	import { baseState } from "$lib/globalState.svelte";
	import { displayNumber, doInfixCalc, infixOpNames, type InfixOperator } from "$lib/mathstuff.svelte";
    let base = $derived(baseState.base);

    let tableSize = $derived(base);
    let curr_op = $state<InfixOperator>("*");
    const ops: InfixOperator[] = ['*', '+', '-', '÷', '^', /* 'mod', 'log_' */];
    function cycleOp() {
        curr_op = ops[(ops.indexOf(curr_op) + 1) % ops.length];
    }
</script>



<div class="container-container">
    <h1>{infixOpNames[curr_op]} Table</h1>
    <div class="table-container">
        <table>
            <tbody>
                <tr> <!-- Header Row -->
                    <th>
                        <button class="util" onclick={cycleOp} style:font-size="2rem">{curr_op}</button>
                    </th>
                    {#each { length: tableSize } as _, headerColumn}
                        <th>{(headerColumn + 1).toString(base)}</th>
                    {/each}
                </tr>
                {#each { length: tableSize } as _, row}
                    <tr>
                        <!-- First element of each row is another header -->
                        <th>{(row + 1).toString(base)}</th>
                        {#each { length: tableSize } as _, col}
                            <td>
                                {displayNumber(doInfixCalc((row + 1), curr_op, (col + 1)))}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
        <div style:display="flex">
            <button onclick={() => tableSize += 3} style:font-size="1rem">Bigger</button>
            <button onclick={() => tableSize -= 3} style:font-size="1rem" class:disabled={tableSize <= base}>Smaller</button>
        </div>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        align-items: center;
        flex-direction: column;
    }
</style>