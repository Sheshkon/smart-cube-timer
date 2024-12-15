type Result = {
    time: string;
    scramble: string | undefined;
};

const tableBody = document.getElementById("tableBody") as HTMLElement;

// Fetch data from localStorage
const getResults = (): Result[] => {
    const data = localStorage.getItem("scrambleEntries");
    return data ? JSON.parse(data) : [];
};

// Save data to localStorage
const saveResult = (result: Result) => {
    const entries = getResults();
    entries.push(result);
    localStorage.setItem("scrambleEntries", JSON.stringify(entries));
    populateTable()

};

// Add a new entry to the table
const addEntryToTable = (entry: Result, index: number, size) => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${size - index}:&nbsp</td>
    <td>${entry.time}</td>
    <td>${entry.scramble}</td>
  `;

    tableBody.appendChild(row);
};

// Populate the table with data from localStorage
const populateTable = () => {
    tableBody.innerHTML = ""; // Clear the table
    const entries = getResults();
    entries.reverse().forEach((entry, index) => addEntryToTable(entry, index, entries.length));
};


// Initialize the table on page load
populateTable();

export {
    saveResult
};
export type { Result };
