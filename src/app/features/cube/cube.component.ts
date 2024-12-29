import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CubeService } from '../../shared/services/cube.service';
import { cubeQuaternion } from '../../shared/utilities/cube-util';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { TwistyPlayer } from 'cubing/twisty';
import { GanCubeCommand, GanCubeConnection } from 'gan-web-bluetooth';
import { toObservable } from '@angular/core/rxjs-interop';
import { CubeCommands, TimerState } from '../../shared/models/cube';

@Component({
  selector: 'app-cube',
  imports: [MatButtonModule],
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CubeComponent {
  #cubeService = inject(CubeService);

  @ViewChild('cubeContainer', { static: true }) cubeContainer!: ElementRef;

  public timerState = this.#cubeService.timerState;
  public timerStateEnum = TimerState;

  public basis = this.#cubeService.basis;

  public isConnected = computed(() => !!this.#connection());
  #isConnected$: Observable<boolean> = toObservable(this.isConnected);

  #connection: Signal<GanCubeConnection | null> = this.#cubeService.connection;

  #twistyPlayer = this.#cubeService.twistyPlayer;

  #afterNextRender = afterNextRender(() => {
    if (this.cubeContainer.nativeElement && this.#twistyPlayer) {
      this.cubeContainer.nativeElement.appendChild(this.#twistyPlayer);

      this.#startAnimation(this.#twistyPlayer);
    }
  });

  public onConnect(): void {
    this.#cubeService.handleConnection();
  }

  public resetGyro(): void {
    this.#cubeService.setBasis(null);
  }

  public resetState(): void {
    this.#connection()?.sendCubeCommand(<GanCubeCommand>CubeCommands['RESET']);
    this.#twistyPlayer.alg = '';
  }

  #startAnimation(twistyPlayer: TwistyPlayer): void {
    let animationFrameId: number | null = null;

    this.#isConnected$
      .pipe(
        switchMap((isConnected) => {
          if (!isConnected) {
            if (animationFrameId !== null) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
            return of(null);
          }
          return from(twistyPlayer.experimentalCurrentVantages()).pipe(
            map((vantageList) => [...vantageList][0]),
            switchMap((twistyVantage) =>
              twistyVantage?.scene?.scene()
                ? from(twistyVantage?.scene?.scene()).pipe(
                    switchMap((twistyScene) =>
                      of({ twistyVantage, twistyScene })
                    )
                  )
                : throwError(() => new Error('No scene avaialble'))
            ),
            tap(({ twistyVantage, twistyScene }) => {
              const animateCubeOrientation = () => {
                twistyScene?.quaternion.slerp(cubeQuaternion, 0.25);
                twistyVantage?.render();
                animationFrameId = requestAnimationFrame(
                  animateCubeOrientation
                );
              };

              if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }
              animateCubeOrientation();
            }),
            catchError((err) => {
              console.error(err);
              return of(null);
            })
          );
        })
      )
      .subscribe();
  }
}
