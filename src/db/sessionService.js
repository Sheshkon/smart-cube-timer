import db from 'src/db/db.js';
import { mergeConsecutiveWords } from 'src/utils/string.js';

export const sessionService = {

  async getSolvesBySessionId(sessionId) {
    return db.solves
      .where('sessionId')
      .equals(parseInt(sessionId))
      .toArray();
  },

  async getAllSessions() {
    return db.sessions
      .toArray();
  },

  async addSession(name) {
    return db.transaction('rw', db.sessions, async () => {
      const sessionId = await db.sessions.add({
        name,
        createdAt: new Date().toISOString(),
      });

     return await db.sessions
       .where('id')
       .equals(sessionId)
       .first();
    });
  },

  async addSolveToSession(sessionId, solveData) {
    const _sessionId = parseInt(sessionId);

    return db.transaction('rw', db.sessions, db.solves, db.reconstructionSteps, async () => {
      const solveId = await db.solves.add({
        sessionId: _sessionId,
        time: solveData.formattedTime,
        date: new Date().toISOString(),
        timestamp: solveData.originalTime.asTimestamp,
        scramble: mergeConsecutiveWords(solveData?.reconstruction?.scramble?.plain),
        solution: mergeConsecutiveWords(solveData?.reconstruction?.solution?.plain),
        reconstruction: {
          method: solveData.reconstruction.method.displayName,
        },
      });

      await Promise.all(
        Object.entries(solveData.reconstruction.steps).map(([stepName, data]) => {
            db.reconstructionSteps.add({
              solveId,
              name: data.displayName,
              moves: mergeConsecutiveWords(data.plain),
              startTime: data.startTime,
              endTime: data.endTime,
              found: data.found,
            });
          },
        ),
      );

      // await db.sessions.update(_sessionId, {
      //   solves: [...(await db.sessions.get(_sessionId)).solves, solveId],
      // });

      const solve = await db.solves.get(solveId);
      const reconstructionSteps = await db.reconstructionSteps
        .where('solveId')
        .equals(solveId)
        .toArray();

      const stepsObject = {};
      reconstructionSteps.forEach(step => {
        stepsObject[step.name] = {
          plain: step.moves,
          startTime: step.startTime,
          endTime: step.endTime,
          found: step.found,
        };
      });

      return {
        ...solve,
        reconstruction: {
          method: solve.reconstruction?.method || '',
          steps: stepsObject,
        },
      };
    });
  },

  async deleteSolve(solveId) {
    return db.transaction('rw', db.solves, db.reconstructionSteps, async () => {
      await db.reconstructionSteps.where('solveId').equals(solveId).delete();

      await db.solves.delete(solveId);
    });
  },

  async deleteSolvesBySession(sessionId) {
    const _sessionId = parseInt(sessionId);
    return db.transaction('rw', db.solves, db.reconstructionSteps, async () => {
      const solveIds = await db.solves
        .where('sessionId')
        .equals(_sessionId)
        .primaryKeys();

      await db.reconstructionSteps
        .where('solveId')
        .anyOf(solveIds)
        .delete();

      await db.solves
        .where('sessionId')
        .equals(_sessionId)
        .delete();
    });
  },

  async deleteSession(sessionId) {
    const _sessionId = parseInt(sessionId);

    return db.transaction('rw', db.sessions, db.solves, db.reconstructionSteps, async () => {
      await this.deleteSolvesBySession(_sessionId);
      await db.sessions.delete(_sessionId);
    });
  },

  async getSolveWithReconstructionBySolveId(solveId) {
    return db.transaction('r', db.solves, db.reconstructionSteps, async () => {
      const reconstructionSteps = await db.reconstructionSteps
        .where('solveId')
        .equals(solveId)
        .toArray();

      const solve = await db.solves
        .where('id')
        .equals(solveId)
        .first();

      // Convert the array of steps into the expected object format
      const stepsObject = {};
      reconstructionSteps.forEach(step => {
        stepsObject[step.name] = {
          plain: step.moves,
          startTime: step.startTime,
          endTime: step.endTime,
          found: step.found,
        };
      });

      // Return the combined object with reconstruction data
      return {
        ...solve,
        reconstruction: {
          method: solve.reconstruction?.method || '',
          steps: stepsObject,
        },
      };
    });
  },

  async getBestSolveBySession(sessionId) {
    const _sessionId = parseInt(sessionId);

    return db.transaction('r', db.solves, async () => {
      const solves = await db.solves
        .where('sessionId')
        .equals(_sessionId)
        .sortBy('timestamp');

      return solves[0] || null;
    });
  },
};
