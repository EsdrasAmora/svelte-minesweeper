<script lang="ts">
	type CellOpenVariant = 'mine' | number;
	type Cell = { open: boolean; flag: boolean; value: CellOpenVariant };

	let columns = 8;
	let rows = 8;

	// not sure if computed state causes re-render, maybe i need to put a $ here
	let totalNumberOfCells = rows * columns;

	let openCells = 0;
	let gameOver = false;
	let won = false;
	let mines = 10;
	let flags = 0;
	let board: Cell[][] = Array.from({ length: columns }).map(() =>
		Array.from({ length: columns }).map(() => ({ open: false, flag: false, value: 0 }))
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

	function revealEmptyNeighborsRecursively(i: number, j: number) {
		if (board[i][j].value !== 0) {
			return;
		}
		for (const [x, y] of deltas) {
			const cell = board[i + x]?.[j + y];
			if (!cell || cell.open || cell.value === 'mine') {
				continue;
			}
			cell.open = true;
			openCells += 1;
			revealEmptyNeighborsRecursively(i + x, j + y);
		}
	}

	function revealNeighborsIfFlagged(i: number, j: number) {
		const cell = board[i][j];
		if (!cell.open) {
			return;
		}

		if (cell.value === 'mine') {
			throw new Error('unreachable');
		}

		let flaggedNeighbors = 0;

		for (const [x, y] of deltas) {
			if (board[i + x]?.[j + y].flag) {
				flaggedNeighbors += 1;
			}
		}

		if (flaggedNeighbors < cell.value) {
			return;
		}

		for (const [x, y] of deltas) {
			if (!tryOpenCell(i + x, j + y)) {
				return;
			}
		}
	}

	function tryOpenCell(i: number, j: number) {
		const cell = board[i][j];
		if (!cell) {
			throw new Error('unreachable');
		}

		cell.open = true;
		openCells += 1;
		if (cell.value === 'mine') {
			gameOver = true;
			won = false;
			revealAllMines();
			return false;
		}
		revealEmptyNeighborsRecursively(i, j);
		return true;
	}

	function handleCellPress(i: number, j: number) {
		const cell = board[i][j];

		if (gameOver || cell.flag) {
			return;
		}

		if (cell.open) {
			revealNeighborsIfFlagged(i, j);
			return;
		}

		if (!tryOpenCell(i, j)) {
			return;
		}

		revealEmptyNeighborsRecursively(i, j);

		if (totalNumberOfCells - openCells - 1 === mines) {
			gameOver = true;
			won = true;
		}
	}

	function handleRightClick(i: number, j: number) {
		const cell = board[i][j];
		if (cell.open) {
			return;
		}

		if (cell.flag) {
			flags -= 1;
			cell.flag = false;
		} else {
			flags += 1;
			cell.flag = true;
		}
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
	<div class="board" style="--board-columns: {columns}">
		{#each board as row, i}
			{#each row as cell, j}
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
					on:contextmenu|preventDefault={() => handleRightClick(i, j)}
				>
					{#if cell.open}
						<!-- svelte-ignore empty-block -->
						{#if cell.value === 'mine'}
							💣
						{:else if cell.value === 0}{:else}
							{cell.value}
						{/if}
					{:else if cell.flag}
						flag
					{:else}
						closed
					{/if}
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
