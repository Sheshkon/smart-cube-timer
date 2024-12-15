import {GanTimerTime} from "gan-web-bluetooth";

type Result = {
    originalTime: GanTimerTime | undefined;
    scramble: string | undefined;
    time: string;
};

type Stats = {
    currentAVG: string | null;
    avg5: string | null;
    avg12: string | null;
    avg100: string | null;
}

const sessionTableBody = document.getElementById("sessionTableBody") as HTMLElement;
const statsTableBody = document.getElementById("statsTableBody") as HTMLElement;

// Fetch data from localStorage
const getResults = (): Result[] => {
    const data = localStorage.getItem("session");
    return data ? JSON.parse(data) : [];
};

function getStats(results: Result[]) {
    const sortedTotalResults = results
        .sort((a, b) => a.originalTime!.asTimestamp - b.originalTime!.asTimestamp)

    const sum5 = sortedTotalResults.length >= 5 ?
        sortedTotalResults.slice(1, 4).reduce((sum, entry) => sum + entry.originalTime!.asTimestamp, 0)
        : 0;

    const sum12 = sortedTotalResults.length >= 12 ?
        sortedTotalResults.slice(1, 11).reduce((sum, entry) => sum + entry.originalTime!.asTimestamp, 0)
        : 0;
    const sum100 = sortedTotalResults.length >= 100 ?
        sortedTotalResults.slice(1, 99).reduce((sum, entry) => sum + entry.originalTime!.asTimestamp, 0)
        : 0;
    const total = sortedTotalResults.slice(1, sortedTotalResults.length - 1).reduce((sum, entry) => sum + entry.originalTime!.asTimestamp, 0);

    if (total == 0) {
        return null
    }

    return {
        currentAVG: getAVG(total, sortedTotalResults.length - 2) ?? "",
        avg5: getAVG(sum5, 3) ?? "",
        avg12: getAVG(sum12, 10) ?? "",
        avg100: getAVG(sum100, 98) ?? "",
    }
}

function getAVG(total: number, length: number) {
    const averageTimestamp = total / length;
    const averageMinutes = Math.floor(averageTimestamp / 60000);
    const averageSeconds = Math.floor((averageTimestamp % 60000) / 1000);
    const averageMilliseconds = Math.round(averageTimestamp % 1000);
    const result = `${averageMinutes}:${averageSeconds}.${averageMilliseconds}`;

    return result === "0:0.0" ? null : result;
}

// Save data to localStorage
const saveResult = (result: Result) => {
    const results = getResults();
    results.push(result);
    localStorage.setItem("session", JSON.stringify(results));
    const stats = getStats(results)
    populateTable(stats)

};

// Add a new entry to the table
const addSessionRowToTable = (result: Result, index: number, size: number) => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${size - index}:&nbsp</td>
    <td>${result.time}</td>
    <td>${result.scramble}</td>
  `;

    sessionTableBody.appendChild(row);
};

// Populate the table with data from localStorage
const populateTable = (stats: Stats | null) => {
    sessionTableBody.innerHTML = ""; // Clear the table
    const entries = getResults();
    entries.reverse().forEach((entry, index) =>
        addSessionRowToTable(entry, index, entries.length));

    addStatsRow(stats)
};

function addStatsRow(stats: Stats | null) {
    const row = document.createElement("tr");
    statsTableBody.innerHTML = ''
    row.innerHTML = (stats !== null) ?
        `
    <td>${stats.currentAVG}</td>
    <td>${stats.avg5}</td>
    <td>${stats.avg12}</td>
    <td>${stats.avg100}</td>
  ` : ""
    statsTableBody.appendChild(row);
}


// Initialize the table on page load
populateTable(getStats(getResults()));

export {
    saveResult
};
export type {Result};
