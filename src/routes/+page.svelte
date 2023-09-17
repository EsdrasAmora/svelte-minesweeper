<script lang="ts">
	import MineIcon from '$lib/images/bomb.svg?url';
	import FlagIcon from '$lib/images/flag.svg?url';
	type CellOpenVariant = 'mine' | number;
	type Cell = { open: boolean; flag: boolean; value: CellOpenVariant; i: number; j: number };

	let columns = 4;
	let rows = 4;
	$: totalNumberOfCells = rows * columns;

	let openCells = 0;
	let gameOver = false;
	let won = false;
	let mines = 4;
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
				const cell = board[i][j];
				if (cell.value === 'mine' && !cell.flag) {
					cell.open = true;
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
		if (cell.value === 'mine') {
			throw new Error('Unreachable');
		}

		let flaggedNeighbors = 0;
		const { i, j } = cell;

		for (const [x, y] of deltas) {
			if (board[i + x]?.[j + y]?.flag) {
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

	function checkGameOver() {
		if (flags + openCells === totalNumberOfCells) {
			gameOver = true;
			won = true;
		}
	}

	function handleCellPress(i: number, j: number) {
		console.log(gameOver, won, flags, openCells, totalNumberOfCells);
		if (flags + openCells === totalNumberOfCells) {
			gameOver = true;
			won = true;
		}
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

		board = board;

		checkGameOver();
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

	function focusCell(i: number, j: number) {
		document.getElementById(`cell-${i}-${j}`)?.focus();
	}

	function handleCellKeydown(e: KeyboardEvent, i: number, j: number) {
		//Wrapping around could be configurable
		switch (e.code) {
			case 'ArrowUp':
			case 'KeyK':
				return focusCell(i - 1, j);
			case 'ArrowDown':
			case 'KeyJ':
				return focusCell(i + 1, j);
			case 'ArrowLeft':
			case 'KeyH':
				return focusCell(i, j - 1);
			case 'ArrowRight':
			case 'KeyL':
				return focusCell(i, j + 1);
			case 'Enter':
				return handleCellPress(i, j);
			case 'Space':
				return handleRightClick(i, j);
		}
	}

	let placedMines = 0;
	while (placedMines < mines) {
		const cell = board[randomInt(rows - 1)][randomInt(columns - 1)];
		if (cell.value !== 'mine') {
			cell.value = 'mine';
			placedMines += 1;
		}
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
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Minesweeper" />
</svelte:head>

<section>
	<h1>Minesweeper</h1>

	<section>
		<ul>
			<li><strong>Remaining Flags</strong> {mines - flags}</li>
			<li>{mines - flags}</li>
			<li><strong>Won</strong> {won} {gameOver}</li>
		</ul>
	</section>

	<!-- {@debug board} -->
	<div class="board" style="--board-columns: {columns}" class:game-over={gameOver}>
		{#each board as row, i}
			{#each row as cell, j}
				{@const { open, flag, value } = cell}
				{@const mine = value === 'mine'}
				<div
					tabindex={0}
					id="cell-{i}-{j}"
					role="cell"
					class="cell"
					class:open
					class:flag
					class:mine
					on:click={() => handleCellPress(i, j)}
					on:contextmenu|preventDefault={() => handleRightClick(i, j)}
					on:keydown={(e) => handleCellKeydown(e, i, j)}
				>
					<div class="cell-internal">
						{#if open}
							{#if mine}
								<img src={MineIcon} alt="A mine" />
							{:else if value > 0}
								{value}
							{/if}
						{:else if flag}
							<img src={FlagIcon} alt="A flag" />
							<!--- remove this if not in debug, could use an env --->
							<!-- {:else} -->
							<!-- 	{value} -->
						{/if}
					</div>
				</div>
			{/each}
		{/each}
	</div>
</section>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(var(--board-columns), 1fr);
		background-color: #2196f3;
	}

	.cell {
		background-color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.8);
		font-size: 30px;
		text-align: center;
	}

	.board.game-over {
		box-shadow: 2px 2px 20px 2px rgba(0, 0, 0, 0.5);
		/* border: 2px solid antiquewhite; */
	}

	.board.game-over > .cell.flag {
		background-color: darkred;
	}

	.board.game-over > .cell.flag.mine {
		background-color: greenyellow;
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

	/* .cell:not(.open):hover { */
	/* 	background-color: red; */
	/* } */

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
