export interface CubeCommand {
  type: string;
}

export const CubeCommands: Record<string, CubeCommand> = {
  RESET: { type: 'REQUEST_RESET' },
  HARDWARE: { type: 'REQUEST_HARDWARE' },
  FACELETS: { type: 'REQUEST_FACELETS' },
  BATTERY: { type: 'REQUEST_BATTERY' },
};

export enum CubeEventType {
  FACELETS = 'FACELETS',
  MOVE = 'MOVE',
  GYRO = 'GYRO',
}
