import {formatTime} from "src/utils/time.js";

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

export const getDiffWithLastSolve = (lastSolve, preLastSolve) => {
    const timestampDiff = lastSolve.originalTime.asTimestamp - preLastSolve.originalTime.asTimestamp

    const formattedTimeDiff = {
        formattedTime: formatTime(Math.abs(timestampDiff)),
        sign: Math.sign(timestampDiff)
    }

    const movesDiff = lastSolve.solution?.split(' ')?.length

    return {
        formattedTimeDiff,
        movesDiff,
    }

}
