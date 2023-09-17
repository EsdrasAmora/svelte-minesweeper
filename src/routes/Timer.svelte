<svelte:options accessors />

<script>
	import { onDestroy } from 'svelte';

	export let timer = 0;
	/** @type NodeJS.Timeout */
	let interval;

	export function start() {
		clearInterval(interval);
		interval = setInterval(() => {
			timer++;
		}, 1000);
	}

	export function reset() {
		timer = 0;
	}

	export function stop() {
		clearInterval(interval);
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<span>{timer}</span>
