export default class StatsResult {
    constructor(originalTime, time, scramble, solution, plainSolution) {
        this.originalTime = originalTime;
        this.formattedTime = time;
        this.scramble = scramble;
        this.solution = solution;
        this.plainSolution = plainSolution
    }

    toString() {
        return `Original Time: ${this.originalTime}, Time: ${this.formattedTime}, Scramble: ${this.scramble}, Solution: ${this.solution}, Plain Solution: ${this.plainSolution}`;
    }
}
