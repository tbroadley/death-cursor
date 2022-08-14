/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let deathCursor;
let angel;
let lastMousePos;
let lastSoulAddedAt = 0;

let souls = [];
let score = 0;

class SoulObject extends EngineObject {
  constructor(startingPos, direction, speed) {
    super(startingPos, vec2(32, 32), 32, vec2(16, 16));
    this.velocity = vec2(0, speed).rotate((Math.PI / 2) * direction);
    this.damping = 1;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  mainCanvasSize = canvasFixedSize = vec2(640, 480);

  cameraPos = vec2(320, 240);
  cameraScale = 1;

  objectMaxSpeed = 5;

  deathCursor = new EngineObject(mousePos, vec2(64, 64), 2, vec2(32, 32));

  angel = new EngineObject(vec2(320, 240), vec2(64, 64), 6, vec2(32, 32));
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

    if (!isOverlapping(soul.pos, soul.size, cameraPos, vec2(640, 480))) {
      soul.destroy();
      soulsToRemove.add(soul);
    }
  }

  souls = souls.filter((it) => !soulsToRemove.has(it));

  if (lastMousePos) {
    const mouseMovement = mousePos.subtract(lastMousePos);

    if (mouseMovement.length() < 2) {
      deathCursor.tileIndex = 2;
    } else {
      deathCursor.tileIndex = mouseMovement.direction();
    }
  }

  lastMousePos = mousePos;

  const soulAddInterval = 1 - (clamp(time, 0, 60) / 60) * 0.5;

  if (time - lastSoulAddedAt > soulAddInterval) {
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

    const speed = 2 + (clamp(time, 0, 60) / 60) * 3;

    souls.push(new SoulObject(position, direction, speed));

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
