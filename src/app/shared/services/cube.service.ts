import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TwistyPlayer } from 'cubing/twisty';
import { HardwareInfo } from '../models/hardwareInfo';

@Injectable({ providedIn: 'root' })
export class CubeService {
  twistyPlayer = new TwistyPlayer({
    puzzle: '3x3x3',
    visualization: 'PG3D',
    alg: '',
    experimentalSetupAnchor: 'start',
    background: 'none',
    controlPanel: 'none',
    hintFacelets: 'none',
    experimentalDragInput: 'auto',
    cameraLatitude: 0,
    cameraLongitude: 0,
    cameraLatitudeLimit: 0,
    tempoScale: 5,
  });

  private readonly hardwareInitialState: HardwareInfo = {
    name: '- n/a -',
    version: '- n/a -',
    softwareVersion: '- n/a -',
    productDate: '- n/a -',
    gyroSupported: 'NO',
  };

  private readonly state = {
    connection: new BehaviorSubject<boolean>(false),
    hardwareInfo: new BehaviorSubject<HardwareInfo>(this.hardwareInitialState),
    batteryLevel: new BehaviorSubject<number>(0),
    scramble: new BehaviorSubject<string[]>([]),
    timerState: new BehaviorSubject<string>('IDLE'),
    lastMoves: new BehaviorSubject<string[]>([]),
    solutionMoves: new BehaviorSubject<string[]>([]),
  };

  get twistyPlayerRef() {
    return this.twistyPlayer;
  }

  connection$: Observable<boolean> = this.state.connection.asObservable();
  hardwareInfo$: Observable<HardwareInfo> =
    this.state.hardwareInfo.asObservable();
  batteryLevel$: Observable<number> = this.state.batteryLevel.asObservable();
  scramble$: Observable<string[]> = this.state.scramble.asObservable();
  timerState$: Observable<string> = this.state.timerState.asObservable();
  lastMoves$: Observable<string[]> = this.state.lastMoves.asObservable();
  solutionMoves$: Observable<string[]> =
    this.state.solutionMoves.asObservable();

  setConnection(connection: boolean): void {
    this.state.connection.next(connection);
  }

  setHardwareInfo(hardwareInfo: Partial<HardwareInfo>): void {
    this.state.hardwareInfo.next({
      ...this.state.hardwareInfo.value,
      ...hardwareInfo,
    });
  }

  setBatteryLevel(batteryLevel: number): void {
    this.state.batteryLevel.next(batteryLevel);
  }

  setScramble(scramble: string[]): void {
    this.state.scramble.next(scramble);
  }

  setTimerState(timerState: string): void {
    this.state.timerState.next(timerState);
  }

  setLastMoves(lastMoves: string[]): void {
    this.state.lastMoves.next(lastMoves);
  }

  setSolutionMoves(solutionMoves: string[]): void {
    this.state.solutionMoves.next(solutionMoves);
  }
}
