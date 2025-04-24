class StatsResult {
    constructor(originalTime, time, scramble, solution, plainSolution) {
        this.originalTime = originalTime;
        this.time = time;
        this.scramble = scramble;
        this.solution = solution;
        this.plainSolution = plainSolution
    }

    toString() {
        return `Original Time: ${this.originalTime}, Time: ${this.time}, Scramble: ${this.scramble}, Solution: ${this.solution}, Plain Solution: ${this.plainSolution}`;
    }
}

const getAvg = (results, count) => {

    if (results.length !== count) return null

    const minMax = results.reduce(
        (acc, current) => {
            if (current.originalTime.asTimestamp < acc.min.originalTime.asTimestamp) acc.min = current;
            if (current.originalTime.asTimestamp > acc.max.originalTime.asTimestamp) acc.max = current;
            acc.sum += current.originalTime.asTimestamp;
            return acc;
        },
        { min: results[0], max: results[0], sum: 0 } // Initial values
    );

    const total = minMax.sum - minMax.min.originalTime.asTimestamp - minMax.max.originalTime.asTimestamp

    return _getAVG(total, results.length - 2)
}

const _getAVG = (total, length) =>  {
    if(length < 0) return null
    const averageTimestamp = total / length;
    const averageMinutes = Math.floor(averageTimestamp / 60000);
    const averageSeconds = Math.floor((averageTimestamp % 60000) / 1000);
    const averageMilliseconds = Math.round(averageTimestamp % 1000);
    const result = `${averageMinutes}:${averageSeconds}.${averageMilliseconds}`;
    return result === "0:0.0" ? null : result;
}

export {
    StatsResult,
    getAvg
}