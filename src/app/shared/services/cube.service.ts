import {
  computed,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { catchError, from, of, Subject, take, takeUntil, tap } from 'rxjs';
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

interface CubeState {
  connection: GanCubeConnection | null;
  hardwareInfo: HardwareInfo;
  batteryLevel: number;
  scramble: string[];
  timerState: GanTimerState;
  lastMoves: string[];
  solutionMoves: string[];
  basis: THREE.Quaternion | null;
}

@Injectable({ providedIn: 'root' })
export class CubeService {
  public readonly twistyPlayer = new TwistyPlayer({
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

  readonly #hardwareInitialState: HardwareInfo = {
    name: '- n/a -',
    version: '- n/a -',
    softwareVersion: '- n/a -',
    productDate: '- n/a -',
    gyroSupported: 'NO',
  };

  #state: WritableSignal<CubeState> = signal({
    connection: null,
    hardwareInfo: this.#hardwareInitialState,
    batteryLevel: 0,
    scramble: [],
    timerState: GanTimerState.IDLE,
    lastMoves: [],
    solutionMoves: [],
    basis: null,
  });

  public connection: Signal<GanCubeConnection | null> = computed(
    () => this.#state().connection
  );
  public hardwareInfo: Signal<HardwareInfo> = computed(
    () => this.#state().hardwareInfo
  );
  public batteryLevel: Signal<number> = computed(
    () => this.#state().batteryLevel
  );
  public scramble: Signal<string[]> = computed(() => this.#state().scramble);
  public timerState: Signal<GanTimerState> = computed(
    () => this.#state().timerState
  );
  public lastMoves: Signal<string[]> = computed(() => this.#state().lastMoves);
  public solutionMoves: Signal<string[]> = computed(
    () => this.#state().solutionMoves
  );
  #basis: Signal<THREE.Quaternion | null> = computed(() => this.#state().basis);

  #disconnect: Subject<void> = new Subject();

  public setConnection(connection: GanCubeConnection | null): void {
    this.#state.update((state) => ({ ...state, connection }));
  }

  public setHardwareInfo(hardwareInfo: HardwareInfo): void {
    this.#state.update((state) => ({ ...state, hardwareInfo }));
  }

  public setBatteryLevel(batteryLevel: number): void {
    this.#state.update((state) => ({ ...state, batteryLevel }));
  }

  public setScramble(scramble: string[]): void {
    this.#state.update((state) => ({ ...state, scramble }));
  }

  public setTimerState(timerState: GanTimerState): void {
    this.#state.update((state) => ({ ...state, timerState }));
  }

  public setLastMoves(lastMoves: string[]): void {
    this.#state.update((state) => ({ ...state, lastMoves }));
  }

  public setSolutionMoves(solutionMoves: string[]): void {
    this.#state.update((state) => ({ ...state, solutionMoves }));
  }

  #setBasis(basis: THREE.Quaternion | null): void {
    this.#state.update((state) => ({ ...state, basis }));
  }

  public handleConnection(): void {
    const currentConn = this.connection();

    if (currentConn) {
      from(currentConn.disconnect()).subscribe(() => {
        this.setConnection(null);
        this.#disconnect.next();
      });
    } else {
      from(connectGanCube(this.#customMacAddressProvider))
        .pipe(
          take(1),
          tap((conn) => {
            this.setConnection(conn);
            conn.events$
              .pipe(takeUntil(this.#disconnect))
              .subscribe((e) => this.#handleCubeEvent(e));
          }),
          catchError((err) => {
            console.error('Failed to connect', err);
            this.setConnection(null);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  #handleCubeEvent(event: GanCubeEvent): void {
    switch (event.type) {
      case CubeEventType.GYRO:
        this.#handleGyroEvent(event);
        break;
      case CubeEventType.MOVE:
        // handleMoveEvent(event);
        break;
      case CubeEventType.FACELETS:
        // handleFaceletsEvent(event);
        break;
    }
  }

  #handleGyroEvent(event: any): void {
    let { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
    let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
    if (!this.#basis()) this.#setBasis(quat.clone().conjugate());
    cubeQuaternion.copy(
      quat.premultiply(this.#basis()!).premultiply(HOME_ORIENTATION)
    );
  }

  async #customMacAddressProvider(
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
