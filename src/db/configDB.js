export const DB_NAME = 'session_data';

export const DB_VERSION = 3;
export const DEFAULT_SESSION_ID = 1;

export const DB_SCHEMA = {
  sessions: `
    ++id,
    name,
    createdAt
  `,
  solves: `
    ++id,
    sessionId,
    date,
    time,
    timestamp,
    scramble,
    solution,
    reconstruction.method,
    [sessionId+timestamp],
    [sessionId+date]
  `,
  reconstructionSteps: `
    ++id,
    solveId,
    name,
    startTime,
    endTime,
    found,
    [solveId+startTime]
  `,
  practiceScrambles: `
    ++id,
    sheetId,
    category,
    group,
    scramble,
    [sheetId+category],
    [sheetId+category+group]
  `,
  practiceScrambleMeta: `
    &sheetId,
    timestamp
  `,
};