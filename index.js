/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let deathCursor;
let lastMousePos;
let lastSoulAddedAt = 0;

let souls = [];
let score = 0;

class SoulObject extends EngineObject {
  constructor(startingPos, direction) {
    super(startingPos, vec2(32, 32), 16, vec2(16, 16));
    this.velocity = vec2(0, 1).rotate((Math.PI / 2) * direction);
    this.damping = 1;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  mainCanvasSize = canvasFixedSize = vec2(640, 480);

  cameraPos = vec2(320, 240);
  cameraScale = 1;

  deathCursor = new EngineObject(mousePos, vec2(64, 64), 2, vec2(32, 32));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (mousePosScreen.x) deathCursor.pos = mousePos;

  const soulsToRemove = new Set();
  for (const soul of souls) {
    if (isOverlapping(deathCursor.pos, deathCursor.size, soul.pos, soul.size)) {
      soul.destroy();
      soulsToRemove.add(soul);
      score += 10;
    }
  }

  souls = souls.filter((it) => !soulsToRemove.has(it));

  if (lastMousePos) {
    const mouseMovement = mousePos.subtract(lastMousePos);

    if (mouseMovement.length() === 0) {
      deathCursor.tileIndex = 2;
    } else {
      deathCursor.tileIndex = mouseMovement.direction();
    }
  }

  lastMousePos = mousePos;

  if (time - lastSoulAddedAt > 1) {
    let position;

    const direction = randInt(0, 4);
    switch (direction) {
      case 0:
        position = vec2(randInt(0, 640 - 16), 0);
        break;
      case 1:
        position = vec2(640, randInt(0, 480 - 16));
        break;
      case 2:
        position = vec2(randInt(0, 640 - 16), 480);
        break;
      case 3:
        position = vec2(0, randInt(0, 480 - 16));
        break;
      default:
        console.error(`Wasn't expecting ${direction}`);
    }

    souls.push(new SoulObject(position, direction));

    lastSoulAddedAt = time;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  drawTextScreen(`Score: ${score}`, vec2(600, 400), 12);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(
  gameInit,
  gameUpdate,
  gameUpdatePost,
  gameRender,
  gameRenderPost,
  "tiles.png"
);
