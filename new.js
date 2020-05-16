"use strict";
const axios = require("axios");
const _ = require("underscore");
const YAML = require("yaml");
const fs = require("fs");
const qs = require("qs");
const chartistSvg = require("svg-chartist");
let config;

async function readSingleDeck(name) {
	const path = `${config.path}/${name}`
	const deck = (await fs.promises.readFile(path, "utf8"));
	let data;
	try {
		data = await axios.post("https://api.mycard.moe/ygopro/identifier/production", qs.stringify({
			deck
		}));
	} catch (e) {
		console.log(`${name} => FAIL ${e.status}`);
		return null;
	}
	const deckType = data.data.deck;
	if (deckType === "迷之卡组") {
		console.log(`${name} => UNKNOWN`);
		return null;
	}
	console.log(`${name} => ${deckType}`);
	return deckType;
}

async function main() {
	config = YAML.parse(await fs.promises.readFile("./config.yaml", "utf8"));
	const files = (await fs.promises.readdir(config.path)).filter(m => m.endsWith(".ydk"));
	console.log(`${files.length} decks found at ${config.path} .`);
	const decks = await Promise.all(files.map(readSingleDeck));
	console.log(`Finished reading decks. Generating chart.`);
	const deckCounts = _.countBy(decks, m => m);
	const labels = Object.keys(deckCounts).map(name => {
		return `${name}: ${deckCounts[name]}`;
	});
	const series = Object.keys(deckCounts).map(name => {
		const encryptedDeckName = Buffer.from(name, "utf-8").toString("base64");
		return {
			name,
			value: deckCounts[name]
		}
	});
	const pieData = {
		labels,
		series
	}
	const data = await chartistSvg("pie", pieData, {
		options: config.options
	});
	console.log(`Done.`);
	await fs.promises.writeFile(config.output, data);
}

main();
