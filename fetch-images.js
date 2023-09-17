import { writeFileSync, writeFile as wrF } from 'fs';
import { promisify } from 'node:util';

const writeFile = promisify(wrF);

const getBaseUrl = (val) => `https://minesweeper.online/img/skins/hd/d${val}.svg`;

await Promise.all(
	Array.from({ length: 10 }).map(async (_, idx) => {
		const res = await fetch(getBaseUrl(idx));
		// console.log(res.ok, res.body);
		const svg = await res.text();
		return writeFile(`./src/lib/images/digit-${idx}.svg`, svg);
		// console.log(await );
		// res.text();
	})
);
// console.log(batatas);
