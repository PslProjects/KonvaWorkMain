import Konva from 'konva';
import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-circuit-simulator',
  templateUrl: './circuit-simulator.component.html',
  styleUrls: ['./circuit-simulator.component.css']
})
export class CircuitSimulatorComponent implements AfterViewInit {
  stage: any;
  layer: any;

  ngAfterViewInit(): void {
    this.stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.drawCircuit();
  }

  

  drawCircuit() {
    // Label: PND-TSS
    const pndTssLabel = new Konva.Label({
      x: 100,
      y: 30,
    });
    pndTssLabel.add(new Konva.Tag({
      fill: 'green',
      cornerRadius: 5,
    }));
    pndTssLabel.add(new Konva.Text({
      text: 'PND-TSS',
      fontSize: 14,
      padding: 5,
      fill: 'white',
    }));
    this.layer.add(pndTssLabel);

    // Label: KLK-SSP
    const klkLabel = new Konva.Label({
      x: 300,
      y: 30,
    });
    klkLabel.add(new Konva.Tag({
      fill: 'red',
      cornerRadius: 5,
    }));
    klkLabel.add(new Konva.Text({
      text: 'KLK-SSP',
      fontSize: 14,
      padding: 5,
      fill: 'white',
    }));
    this.layer.add(klkLabel);

    // Line between PND-TSS to KLK-SSP
    const mainLine = new Konva.Line({
      points: [150, 60, 350, 60],
      stroke: 'black',
      strokeWidth: 4,
      lineCap: 'round',
    });
    this.layer.add(mainLine);

    // Circles on the main line
    [180, 220, 260, 300, 340].forEach((x) => {
      const node = new Konva.Circle({
        x: x,
        y: 60,
        radius: 5,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
      });
      this.layer.add(node);
    });

    // Downward vertical lines and circuit breakers
    const verticalYStart = 60;
    const verticalHeight = 80;

    [220, 300].forEach((x) => {
      // Line
      const line = new Konva.Line({
        points: [x, verticalYStart, x, verticalYStart + verticalHeight],
        stroke: 'black',
        strokeWidth: 2,
      });
      this.layer.add(line);

      // Breaker (rectangle)
      const breaker = new Konva.Rect({
        x: x - 8,
        y: verticalYStart + 30,
        width: 16,
        height: 16,
        stroke: 'black',
        strokeWidth: 2,
        fill: 'gray',
      });
      this.layer.add(breaker);
    });

    this.layer.draw();
  }
}
