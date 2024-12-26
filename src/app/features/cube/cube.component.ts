import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CubeService } from '../../shared/services/cube.service';
import { cubeQuaternion } from '../../shared/utilities/cube-util';
import { TwistyPlayer } from 'cubing/twisty';

@Component({
  selector: 'app-cube',
  imports: [MatButtonModule],
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss',
})
export class CubeComponent implements OnInit {
  @ViewChild('cubeContainer', { static: true }) cubeContainer!: ElementRef;

  constructor(private _cubeService: CubeService) {}

  ngOnInit(): void {
    const twistyPlayerRef: any = this._cubeService.twistyPlayerRef;

    if (this.cubeContainer.nativeElement && twistyPlayerRef) {
      this.cubeContainer.nativeElement.appendChild(twistyPlayerRef);

      this.startAnimation(twistyPlayerRef);
    }
  }

  private async startAnimation(twistyPlayerRef: any): Promise<void> {
    const vantageList = await twistyPlayerRef.experimentalCurrentVantages();
    const twistyVantage = vantageList[0];
    const twistyScene = await twistyVantage?.scene?.scene();

    const animateCubeOrientation = () => {
      twistyScene?.quaternion.slerp(cubeQuaternion, 0.25);
      twistyVantage?.render();

      requestAnimationFrame(animateCubeOrientation);
    };

    animateCubeOrientation();
  }
}
