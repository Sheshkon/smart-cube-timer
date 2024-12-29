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
import { GanCubeConnection } from 'gan-web-bluetooth';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cube',
  imports: [MatButtonModule],
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CubeComponent {
  @ViewChild('cubeContainer', { static: true }) cubeContainer!: ElementRef;
  public isConnected = computed(() => !!this.#connection());
  #isConnected$: Observable<boolean> = toObservable(this.isConnected);

  #cubeService = inject(CubeService);

  #connection: Signal<GanCubeConnection | null> = this.#cubeService.connection;

  #afterNextRender = afterNextRender(() => {
    const twistyPlayer: TwistyPlayer = this.#cubeService.twistyPlayer;

    if (this.cubeContainer.nativeElement && twistyPlayer) {
      this.cubeContainer.nativeElement.appendChild(twistyPlayer);

      this.#startAnimation(twistyPlayer);
    }
  });

  public onConnect(): void {
    this.#cubeService.handleConnection();
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
