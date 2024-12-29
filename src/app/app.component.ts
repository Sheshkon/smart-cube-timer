import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrambleComponent } from './features/scramble/scramble.component';
import { CubeComponent } from './features/cube/cube.component';
import { StatsComponent } from './features/stats/stats.component';

@Component({
  selector: 'app-root',
  imports: [ScrambleComponent, CubeComponent, StatsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'smart-cube-timer';
}
