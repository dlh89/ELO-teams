const startingElo = 1500;
const k = 30; // TODO why 30?

class CalculateElo {
    constructor() {
        this.startingElo = this.getStartingElo();
        this.k = this.getK();
    }

    getStartingElo() {
        return startingElo;
    }

    getK() {
        return k;
    }

    /**
     * Based on https://www.geeksforgeeks.org/elo-rating-algorithm/
     */
    getExpectedScore(rating1, rating2) {
		return (
			(1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400)) // TODO where does 400 come from?
		);
	}

    getNewPlayerRating(playerRating, actualScore, expectedScore)
    {
        // actualScore 1 for win, 0 for loss
        return Math.round(playerRating + this.k * (actualScore - expectedScore));
    }
}

export default CalculateElo;