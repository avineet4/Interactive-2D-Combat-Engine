import { HitSplash } from "./HitSplash.js";

export class HeavyHitSplash extends HitSplash {
  constructor(x, y, playerId, onEnd) {
    super(x, y, playerId, onEnd);
    this.frames = [
      //!Player1
      [
        [14, 68, 15, 21],
        [7, 10],
      ],
      [
        [38, 70, 27, 23],
        [13, 11],
      ],
      [
        [73, 70, 27, 23],
        [13, 11],
      ],
      [
        [106, 66, 32, 31],
        [16, 15],
      ],

      //!Player2
      [
        [160, 68, 15, 21],
        [7, 10],
      ],
      [
        [185, 70, 27, 23],
        [13, 11],
      ],
      [
        [222, 70, 27, 23],
        [13, 11],
      ],
      [
        [255, 66, 32, 31],
        [16, 15],
      ],
    ];
  }

  update(time) {
    super.update(time);
  }

  draw(context, camera) {
    // Check if frames array exists and has items
    if (!this.frames || this.frames.length === 0) {
      console.warn("HeavyHitSplash: frames array is empty or undefined");
      return;
    }

    // Call parent class draw method
    super.draw(context, camera);
  }
}
