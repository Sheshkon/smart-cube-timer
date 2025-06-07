export const DB_NAME = 'session_data';

export const DB_VERSION = 2;
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
    reconstruction.method
  `,
  reconstructionSteps: `
    ++id,
    solveId,
    name,
    startTime,
    endTime,
    found
  `,

  practiceScrambles: `
    ++id,
    sheetId,
    category,
    scramble,
    [sheetId+category] 
  `,
  // Название таблицы в meta должно совпадать
  practiceScrambleMeta: `
    &sheetId,
    timestamp
  `,
};