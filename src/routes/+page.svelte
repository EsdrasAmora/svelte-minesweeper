<script lang="ts">
	type CellVariant = 'mine' | number;
	type aa = 'flag' | 'closed' | 'open';

	let columns = 8;
	let rows = 8;
	let gameOver = false;
	let won = false;
	let mines = 10;
	let board: CellVariant[][] = Array(rows).map(() => Array(columns).fill(0));
	const deltas = [
		[0, 1],
		[1, 0],
		[1, 1],

		[0, -1],
		[-1, 0],
		[-1, -1],

		[1, -1],
		[-1, 1]
	];

	function randomInt(max: number) {
		return Math.round(Math.random() * max);
	}

	function handleCellPress(i: number, j: number) {
		const cell = board[i][j];
		if (cell === 'mine') {
			gameOver = true;
			won = false;
		}
	}

	while (mines !== 0) {
		board[randomInt(rows - 1)][randomInt(columns - 1)] = 'mine';
		mines -= 1;
		// 💣
	}

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			if (board[i][j] !== 'mine') {
				continue;
			}
			for (let [x, y] of deltas) {
				const cell = board[i + x]?.[j + y];
				if (!cell || cell === 'mine') {
					continue;
				}
				let x = cell;
				board[i + x][j + y] += 1;
			}
		}
	}
	mines = 10;

	$: console.log('hello');
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Minesweeper" />
</svelte:head>

<section>
	<h1>Minesweeper</h1>
	<div class="board" style="--board-columns: {columns}">
		{#each board as row, i}
			{#each row as cell, j}
				{@const position = i * j}
				<div
					class="cell"
					on:click={() => handleCellPress(i, j)}
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							handleCellPress(i, j);
						}
					}}
					role="cell"
					tabindex={i + 1}
				>
					{cell}
				</div>
			{/each}
		{/each}
	</div>
</section>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(var(--board-columns), auto);
		background-color: #2196f3;
	}

	.cell {
		background-color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.8);
		padding: 20px;
		font-size: 30px;
		text-align: center;
	}

	.cell:hover {
		background-color: red;
	}

	.cell:active {
		background: green;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
