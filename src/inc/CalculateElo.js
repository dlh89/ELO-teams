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
    eloProbability(rating1, rating2) {
		return (
			(1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400)) // TODO where does 400 come from?
		);
	}

    updateElo(teamElo, opponentElo, isWin) {
		// get the prior probability ratings
		const winProbability = eloProbability(teamElo, opponentElo);
		const lossProbability = eloProbability(teamElo, opponentElo);

		const updatedElo = isWin ? this.K * (1 - winProbability) : this.K * (0 - lossProbability);

		return updatedElo;
	}
}

export default CalculateElo;