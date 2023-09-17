<script context="module" lang="ts">
	type CellOpenVariant = 'mine' | number;
	type GameState = 'playing' | 'won' | 'lost' | 'idle';
	type Cell = { open: boolean; flag: boolean; value: CellOpenVariant; i: number; j: number };
	type Click = { row: number; column: number; time: number };
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
	//TODO: add difficult selector
	const difficult = {
		easy: { rows: 8, columns: 8, mines: 10 },
		medium: { rows: 15, columns: 8, mines: 10 },
		hard: { rows: 15, columns: 15, mines: 10 }
	};
	function randomInt(max: number) {
		return Math.round(Math.random() * max);
	}
</script>

<script lang="ts">
	import MineIcon from '$lib/images/bomb.svg?url';
	import FlagIcon from '$lib/images/flag.svg?url';
	import Timer from './Timer.svelte';

	let columns = 8;
	let rows = 8;
	let openCells = 0;
	let gameState: GameState = 'idle';
	let mines = 10;
	let flags = 0;
	let timer: Timer;
	//TODO:  Generate clip from click history
	let clicks: Click[] = [];
	let board: Cell[][] = [];

	resetGame();
	$: totalNumberOfCells = rows * columns;
	// $: console.log({ flags, openCells, totalNumberOfCells });

	function resetGame() {
		columns = 8;
		rows = 8;
		openCells = 0;
		gameState = 'idle';
		mines = 10;
		flags = 0;
		timer?.reset();
		clicks = [];
		board = Array.from({ length: columns }).map((_, i) =>
			Array.from({ length: columns }).map((_, j) => ({ open: false, flag: false, value: 0, i, j }))
		);

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
			gameState = 'lost';
			timer.stop();
			revealAllMines();
			return false;
		}
		revealEmptyNeighborsRecursively(cell);
		return true;
	}

	function checkGameOver() {
		if (flags + openCells === totalNumberOfCells) {
			gameState = 'won';
			timer.stop();
		}
	}

	function handleCellPress(i: number, j: number) {
		clicks.push({ row: i, column: j, time: timer.timer! });
		if (gameState === 'idle') {
			timer.start();
			gameState = 'playing';
		}
		const cell = board[i][j];

		if (gameState === 'won' || gameState === 'lost' || cell.flag) {
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

	function handlePlaceFlag(i: number, j: number) {
		clicks.push({ row: i, column: j, time: timer.timer! });
		const cell = board[i][j];
		if (gameState !== 'playing' || cell.open) {
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
				return handlePlaceFlag(i, j);
		}
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Minesweeper" />
</svelte:head>

<section>
	<h1>Minesweeper</h1>

	<div class="board-header">
		<span>{mines - flags} </span>
		<span>{gameState} </span>
		<Timer bind:this={timer} />
	</div>
	<div class="v-s-separator" />
	<div
		class="board"
		style="--board-columns: {columns}"
		class:game-over={gameState === 'won' || gameState === 'lost'}
	>
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
					on:contextmenu|preventDefault={() => handlePlaceFlag(i, j)}
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
							<!-- - remove this if not in debug, could use an env - -->
							<!-- {:else} -->
							<!-- 	{value} -->
						{/if}
					</div>
				</div>
			{/each}
		{/each}
	</div>
	<div class="v-m-separator" />
	<div class="board-footer">
		<button on:click={resetGame}>Restart</button>
	</div>
</section>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(var(--board-columns), 1fr);
	}

	.v-m-separator {
		height: 36px;
	}

	.v-s-separator {
		height: 12px;
	}

	.board-header {
		display: flex;
		justify-content: space-around;
		width: 60%;
	}

	.board-footer {
		display: flex;
		justify-content: space-around;
		width: 70%;
	}

	.cell {
		background-color: #c6c6c6;
		box-shadow: 0px 0px 1px 2px rgba(0, 0, 0, 0.8);
		font-size: 30px;
		text-align: center;
	}

	.board.game-over > .cell.flag {
		background-color: darkred;
	}

	.board.game-over > .cell.flag.mine {
		background-color: greenyellow;
	}

	.cell.open {
		background-color: #e3d5c3;
		/* background-color: purple; */
	}

	.cell.open.mine {
		background-color: orange;
	}

	.cell:hover,
	.cell:focus {
		filter: brightness(110%);
	}

	.cell:not(.open):hover,
	.cell:not(.open):focus {
		transform: translateY(-1px);
		/* translateX(2px); */
	}

	.cell:active {
		background: green;
	}

	.cell-internal {
		display: flex;
		width: 64px;
		height: 64px;
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
