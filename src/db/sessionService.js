import db from 'src/db/db.js';
import { mergeConsecutiveWords } from 'src/utils/string.js';

export const sessionService = {

  async getSolvesBySessionId(sessionId) {
    return db.solves
      .where('sessionId')
      .equals(sessionId)
      .toArray();
  },

  async createSession(name) {
    try {
      return await db.sessions.add({
        name,
        createdAt: new Date().toISOString(),
        solves: [],
      });
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async addSolveToSession(sessionId, solveData) {
    console.log('data: ', sessionId, solveData);

    return db.transaction('rw', db.sessions, db.solves, db.reconstructionSteps, async () => {
      const solveId = await db.solves.add({
        sessionId: sessionId,
        time: solveData.formattedTime,
        date: new Date().toISOString(),
        timestamp: solveData.originalTime.asTimestamp,
        scramble: mergeConsecutiveWords(solveData?.reconstruction?.scramble?.plain),
        solution: mergeConsecutiveWords(solveData?.reconstruction?.solution?.plain),
        reconstruction: {
          method: solveData.reconstruction.method,
        },
      });

      await Promise.all(
        Object.entries(solveData.reconstruction.steps).map(([stepName, data]) => {
            db.reconstructionSteps.add({
              solveId,
              name: stepName,
              moves: data.plain,
              startTime: data.startTime,
              endTime: data.endTime,
              found: data.found,
            });
          },
        ),
      );

      await db.sessions.update(sessionId, {
        solves: [...(await db.sessions.get(sessionId)).solves, solveId],
      });

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
          found: step.found
        };
      });

      return {
        ...solve,
        reconstruction: {
          method: solve.reconstruction?.method || '',
          steps: stepsObject
        }
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
    return db.transaction('rw', db.solves, db.reconstructionSteps, async () => {
      const solveIds = await db.solves
        .where('sessionId')
        .equals(sessionId)
        .primaryKeys();

      await db.reconstructionSteps
        .where('solveId')
        .anyOf(solveIds)
        .delete();

      await db.solves
        .where('sessionId')
        .equals(sessionId)
        .delete();
    });
  },

  async deleteSession(sessionId) {
    return db.transaction('rw', db.sessions, db.solves, db.reconstructionSteps, async () => {
      await this.deleteSolvesBySession(sessionId);
      await db.sessions.delete(sessionId);
    });
  },


  async getSolveWithReconstructionBySolveId(solveId) {
    return db.transaction('r', db.solves, db.reconstructionSteps, async () => {
      const reconstructionSteps = await db.reconstructionSteps
        .where('solveId')
        .equals(solveId)
        .toArray();

      // Get the solve information
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
          found: step.found
        };
      });

      // Return the combined object with reconstruction data
      return {
        ...solve,
        reconstruction: {
          method: solve.reconstruction?.method || '',
          steps: stepsObject
        }
      };
    });
  }
};
