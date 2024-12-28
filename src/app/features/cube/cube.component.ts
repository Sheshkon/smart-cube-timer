import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
import { AsyncPipe } from '@angular/common';
import { TwistyPlayer } from 'cubing/twisty';

@Component({
  selector: 'app-cube',
  imports: [MatButtonModule, AsyncPipe],
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CubeComponent implements AfterViewInit {
  @ViewChild('cubeContainer', { static: true }) cubeContainer!: ElementRef;

  private _cubeService = inject(CubeService);

  isConnected$: Observable<boolean> = this._cubeService.connection$.pipe(
    map(Boolean)
  );

  public ngAfterViewInit(): void {
    const twistyPlayer: TwistyPlayer = this._cubeService.twistyPlayer;

    if (this.cubeContainer.nativeElement && twistyPlayer) {
      this.cubeContainer.nativeElement.appendChild(twistyPlayer);

      this.startAnimation(twistyPlayer);
    }
  }

  public onConnect(): void {
    this._cubeService.handleConnection();
  }

  private startAnimation(twistyPlayer: TwistyPlayer): void {
    let animationFrameId: number | null = null;

    this.isConnected$
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
