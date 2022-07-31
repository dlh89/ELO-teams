/**
 * https://bost.ocks.org/mike/shuffle/
 * @param items
 */
const fisherYatesShuffle = (items) => {
    let currentIndex = items.length, currentItem, randomIndex;

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
}

export { fisherYatesShuffle }