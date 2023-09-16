<script lang="ts">
	// the advantage of using a component (inline svg) is that you can custumize it with css but it will not be cached by the browser which is not exactly a problem usually, maybe only if you had A LOT of them
	// import Batata from '$lib/images/svelte-logo.svg?component';
	import MineIcon from '$lib/images/bomb.svg?component';
	import FlagIcon from '$lib/images/flag.svg?component';
	type CellOpenVariant = 'mine' | number;
	type Cell = { open: boolean; flag: boolean; value: CellOpenVariant; i: number; j: number };

	let columns = 8;
	let rows = 8;

	// not sure if computed state causes re-render, maybe i need to put a $ here
	let totalNumberOfCells = rows * columns;

	let openCells = 0;
	let gameOver = false;
	let won = false;
	let mines = 10;
	let flags = 0;
	let board: Cell[][] = Array.from({ length: columns }).map((_, i) =>
		Array.from({ length: columns }).map((_, j) => ({ open: false, flag: false, value: 0, i, j }))
	);

	const deltas = [
		[0, 1],
		[1, 0],
		[1, 1],

		[0, -1],
		[-1, 0],
		[-1, -1],

		[1, -1],
		[-1, 1]
	] as const;

	function randomInt(max: number) {
		return Math.round(Math.random() * max);
	}

	function revealAllMines() {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				if (board[i][j].value === 'mine') {
					board[i][j].open = true;
				}
			}
		}
	}

	function revealEmptyNeighborsRecursively(cell: Cell) {
		if (cell.value !== 0) {
			return;
		}
		const { i, j } = cell;
		for (const [x, y] of deltas) {
			const cell = board[i + x]?.[j + y];
			if (!cell || cell.open || cell.value === 'mine') {
				continue;
			}
			cell.open = true;
			openCells += 1;
			revealEmptyNeighborsRecursively(cell);
		}
	}

	function revealNeighborsIfFlagged(cell: Cell) {
		if (!cell.open) {
			return;
		}

		if (cell.value === 'mine') {
			throw new Error('unreachable');
		}

		let flaggedNeighbors = 0;
		const { i, j } = cell;

		for (const [x, y] of deltas) {
			if (board[i + x]?.[j + y].flag) {
				flaggedNeighbors += 1;
			}
		}

		if (flaggedNeighbors < cell.value) {
			return;
		}

		for (const [x, y] of deltas) {
			const cell = board[i + x]?.[j + y];
			if (!cell || cell.open || cell.flag) {
				continue;
			}

			tryOpenCell(cell);
		}
	}

	function tryOpenCell(cell: Cell) {
		cell.open = true;
		openCells += 1;
		if (cell.value === 'mine') {
			gameOver = true;
			won = false;
			revealAllMines();
			return false;
		}
		revealEmptyNeighborsRecursively(cell);
		return true;
	}

	function handleCellPress(i: number, j: number) {
		const cell = board[i][j];

		if (gameOver || cell.flag) {
			return;
		}

		if (cell.open) {
			revealNeighborsIfFlagged(cell);
			board = board;
			return;
		}

		if (!tryOpenCell(cell)) {
			board = board;
			return;
		}

		if (flags + openCells === totalNumberOfCells) {
			gameOver = true;
			won = true;
		}

		board = board;
	}

	function handleRightClick(i: number, j: number) {
		const cell = board[i][j];
		if (gameOver || cell.open) {
			return;
		}

		if (cell.flag) {
			flags -= 1;
			cell.flag = false;
		} else {
			flags += 1;
			cell.flag = true;
		}

		board = board;
	}

	while (mines !== 0) {
		board[randomInt(rows - 1)][randomInt(columns - 1)].value = 'mine';
		mines -= 1;
	}

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			if (board[i][j].value === 'mine') {
				for (const [x, y] of deltas) {
					const cell = board[i + x]?.[j + y];
					if (cell && cell.value !== 'mine') {
						cell.value += 1;
					}
				}
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
	<!-- {@debug board} -->
	<div class="board" style="--board-columns: {columns}">
		{#each board as row, i}
			{#each row as cell, j}
				<div
					class="cell"
					class:open={cell.open}
					on:click={() => handleCellPress(i, j)}
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							handleCellPress(i, j);
						}
					}}
					class:mine={cell.open && cell.value === 'mine'}
					role="cell"
					tabindex={i + 1}
					on:contextmenu|preventDefault={() => handleRightClick(i, j)}
				>
					<div class="cell-internal">
						{#if cell.open}
							{#if cell.value === 'mine'}
								<MineIcon />
							{:else if cell.value > 0}
								{cell.value}
							{/if}
						{:else if cell.flag}
							<FlagIcon />
							<!-- {:else} -->
							<!-- 	{cell.value} -->
						{/if}
					</div>
				</div>
			{/each}
		{/each}
	</div>
	<section>
		<ul>
			<li><strong>Remaining Flags</strong> {mines - flags}</li>
			<li><strong>Won</strong> {won}</li>
			<li><strong>Game Over </strong> {gameOver}</li>
		</ul>
	</section>
</section>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(var(--board-columns), 1fr);
		background-color: #2196f3;
		/* width: 100%; */
	}

	.cell {
		background-color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.8);
		font-size: 30px;
		text-align: center;
		/* padding: 20px; */
		/* display: flex; */
		/* align-content: center; */
		/* flex-wrap: wrap; */
	}

	.cell.open {
		background-color: purple;
	}

	.cell.open.mine {
		background-color: orange;
	}

	.cell:hover {
		background-color: red;
	}

	.cell:active {
		background: green;
	}

	.cell-internal {
		display: flex;
		width: 80px;
		height: 80px;
		flex-direction: row;
		justify-content: center;
		align-content: center;
		flex-wrap: wrap;
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
