import * as THREE from 'three';
import {
  computed,
  effect,
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
} from 'gan-web-bluetooth';
import { CubeEventType, TimerState } from '../models/cube';
import {
  cubeQuaternion,
  faceletsToPattern,
  HOME_ORIENTATION,
  SOLVED_STATE,
} from '../utilities/cube-util';
import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';

interface CubeState {
  connection: GanCubeConnection | null;
  hardwareInfo: HardwareInfo;
  batteryLevel: number;
  scramble: string[];
  timerState: TimerState;
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
    timerState: TimerState.IDLE,
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
  public timerState: Signal<TimerState> = computed(
    () => this.#state().timerState
  );
  public lastMoves: Signal<string[]> = computed(() => this.#state().lastMoves);
  #lastMovesEffect = effect(() => {
    if (this.lastMoves().length > 256) {
      this.setLastMoves(this.lastMoves().slice(-256));
    }
    if (this.timerState() === TimerState.READY) {
      this.setTimerState(TimerState.RUNNING);
    }
  });

  public solutionMoves: Signal<string[]> = computed(
    () => this.#state().solutionMoves
  );

  public basis: Signal<THREE.Quaternion | null> = computed(
    () => this.#state().basis
  );

  #disconnect: Subject<void> = new Subject();

  #cubeInitialized: boolean = false;

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

  public setTimerState(timerState: TimerState): void {
    this.#state.update((state) => ({ ...state, timerState }));
  }

  public setLastMoves(lastMoves: string[]): void {
    this.#state.update((state) => ({ ...state, lastMoves }));
  }

  public setSolutionMoves(solutionMoves: string[]): void {
    this.#state.update((state) => ({ ...state, solutionMoves }));
  }

  public setBasis(basis: THREE.Quaternion | null): void {
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
        this.#handleMoveEvent(event);
        break;
      case CubeEventType.FACELETS:
        this.#handleFaceletsEvent(event);
        break;
    }
  }

  #handleGyroEvent(event: any): void {
    let { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
    let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
    if (!this.basis()) this.setBasis(quat.clone().conjugate());
    cubeQuaternion.copy(
      quat.premultiply(this.basis()!).premultiply(HOME_ORIENTATION)
    );
  }

  #handleMoveEvent(event: any): void {
    this.twistyPlayer.experimentalAddMove(event.move, { cancel: false });
    this.setLastMoves([...this.lastMoves(), event]);

    if (this.timerState() !== TimerState.IDLE) {
      this.setSolutionMoves([...this.solutionMoves(), event]);
    }
  }

  #handleFaceletsEvent(event: any): void {
    if (event.facelets === SOLVED_STATE) {
      this.setLastMoves([]);
    }

    if (!this.#cubeInitialized) {
      if (event.facelets !== SOLVED_STATE) {
        const kpattern = faceletsToPattern(event.facelets);
        from(experimentalSolve3x3x3IgnoringCenters(kpattern))
          .pipe(
            tap((solution) => {
              this.twistyPlayer.alg = solution.invert();
            }),
            tap(() => {
              this.#cubeInitialized = true;
            })
          )
          .subscribe();
      } else {
        this.twistyPlayer.alg = '';
        this.#cubeInitialized = true;
      }
    }
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
