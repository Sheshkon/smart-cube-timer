import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  from,
  Observable,
  of,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { TwistyPlayer } from 'cubing/twisty';
import { HardwareInfo } from '../models/hardwareInfo';
import {
  connectGanCube,
  GanCubeConnection,
  GanCubeEvent,
  GanTimerState,
} from 'gan-web-bluetooth';
import { CubeEventType } from '../models/cube';
import * as THREE from 'three';
import { cubeQuaternion, HOME_ORIENTATION } from '../utilities/cube-util';

@Injectable({ providedIn: 'root' })
export class CubeService {
  readonly twistyPlayer = new TwistyPlayer({
    puzzle: '3x3x3',
    visualization: 'PG3D',
    alg: '',
    experimentalSetupAnchor: 'start',
    background: 'none',
    controlPanel: 'none',
    hintFacelets: 'none',
    experimentalDragInput: 'none',
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
    connection: new BehaviorSubject<GanCubeConnection | null>(null),
    hardwareInfo: new BehaviorSubject<HardwareInfo>(this.hardwareInitialState),
    batteryLevel: new BehaviorSubject<number>(0),
    scramble: new BehaviorSubject<string[]>([]),
    timerState: new BehaviorSubject<GanTimerState>(GanTimerState.IDLE),
    lastMoves: new BehaviorSubject<string[]>([]),
    solutionMoves: new BehaviorSubject<string[]>([]),
    basis: new BehaviorSubject<THREE.Quaternion | null>(null),
  };

  connection$: Observable<GanCubeConnection | null> =
    this.state.connection.asObservable();
  hardwareInfo$: Observable<HardwareInfo> =
    this.state.hardwareInfo.asObservable();
  batteryLevel$: Observable<number> = this.state.batteryLevel.asObservable();
  scramble$: Observable<string[]> = this.state.scramble.asObservable();
  timerState$: Observable<GanTimerState> = this.state.timerState.asObservable();
  lastMoves$: Observable<string[]> = this.state.lastMoves.asObservable();
  solutionMoves$: Observable<string[]> =
    this.state.solutionMoves.asObservable();

  setConnection(connection: GanCubeConnection | null): void {
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

  setTimerState(timerState: GanTimerState): void {
    this.state.timerState.next(timerState);
  }

  setLastMoves(lastMoves: string[]): void {
    this.state.lastMoves.next(lastMoves);
  }

  setSolutionMoves(solutionMoves: string[]): void {
    this.state.solutionMoves.next(solutionMoves);
  }

  handleConnection(): void {
    const currentConn = this.state.connection.value;

    if (currentConn) {
      from(currentConn.disconnect()).subscribe(() => {
        this.state.connection.next(null);
      });
    } else {
      from(connectGanCube(this.customMacAddressProvider))
        .pipe(
          take(1),
          tap((conn) => {
            this.setConnection(conn);
            conn.events$
              .pipe(takeUntil(this.connection$.pipe(filter((v) => v === null))))
              .subscribe((e) => {
                this.handleCubeEvent(e);
              });
          }),
          catchError((err) => {
            console.error('Failed to connect', err);
            this.state.connection.next(null);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  private handleCubeEvent(event: GanCubeEvent): void {
    switch (event.type) {
      case CubeEventType.GYRO:
        this.handleGyroEvent(event);
        break;
      case CubeEventType.MOVE:
        // handleMoveEvent(event);
        break;
      case CubeEventType.FACELETS:
        // handleFaceletsEvent(event);
        break;
    }
  }

  private handleGyroEvent(event: any): void {
    let { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
    let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
    if (!this.state.basis.value)
      this.state.basis.next(quat.clone().conjugate());
    cubeQuaternion.copy(
      quat.premultiply(this.state.basis.value!).premultiply(HOME_ORIENTATION)
    );
  }

  private async customMacAddressProvider(
    device: any,
    isFallbackCall?: boolean
  ): Promise<string | null> {
    if (isFallbackCall) {
      return (
        prompt(
          'Unable to determine cube MAC address!\nPlease enter MAC address manually:'
        ) || null
      );
    } else {
      return typeof device.watchAdvertisements === 'function'
        ? null
        : prompt(
            'Seems like your browser does not support Web Bluetooth watchAdvertisements() API. Enable the following flag in Chrome:\n\nchrome://flags/#enable-experimental-web-platform-features\n\nor enter cube MAC address manually:'
          ) || null;
    }
  }
}
