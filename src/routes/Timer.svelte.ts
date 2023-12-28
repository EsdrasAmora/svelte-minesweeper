export default class Timer {
	time = $state(0);
	interval = $state(setInterval(() => {}, 100_000));

	constructor() {
		$effect(() => {
			return () => this.stop();
		});
	}

	start() {
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			this.time++;
		}, 1000);
	}

	reset() {
		this.time = 0;
		clearInterval(this.interval);
	}

	stop() {
		clearInterval(this.interval);
	}
}
