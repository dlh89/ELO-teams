/**
 * https://bost.ocks.org/mike/shuffle/
 * @param items
 */
const fisherYatesShuffle = (items) => {
	let currentIndex = items.length,
		currentItem,
		randomIndex;

	// While there remain elements to shuffle…
	while (currentIndex) {
		// Pick a remaining element…
		randomIndex = Math.floor(Math.random() * currentIndex--);

		// And swap it with the current element.
		currentItem = items[currentIndex];
		items[currentIndex] = items[randomIndex];
		items[randomIndex] = currentItem;
	}

	return items;
};

/**
 * Randomly sort an equal (or as close as possible) number of 'a' and 'b' values
 *
 * @param {number} playerCount Number of players to sort into teams
 * @returns {Array} Randomly sorted array with values of a/b
 */
const getRandomTeams = (playerCount) => {
	let teams = [];
	let aTotal = Math.round(playerCount / 2);
	let aCount = 0;

	for (let i = 0; i < playerCount; i++) {
		if (aCount < aTotal) {
			aCount++;
			teams.push('a');
		} else {
			teams.push('b');
		}
	}

	teams = fisherYatesShuffle(teams);

	return teams;
};

const getDateString = (date) => {
	// 1970-10-31 format

	const dateObject = new Date(date);
	const currentDateString = `${dateObject.getFullYear()}-${String(
		dateObject.getMonth() + 1
	).padStart(2, '0')}-${dateObject.getDate()}`;

	return currentDateString;
};

const getTimeString = (date) => {
	// 00:00:00 format

	const dateObject = new Date(date);
	const currentTimeString = `${dateObject.getHours()}:${dateObject.getMinutes()}:${String(
		dateObject.getSeconds()
	).padStart(2, '0')}`;

	return currentTimeString;
};

export { fisherYatesShuffle, getRandomTeams, getDateString, getTimeString };
