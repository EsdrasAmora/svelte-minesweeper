<script>
	import { onDestroy } from 'svelte';

	let timer = 0;
	const interval = setInterval(() => {
		timer++;
	}, 1000);

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<span>{timer}</span>
