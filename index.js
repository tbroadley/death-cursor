/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let deathCursor;
let lastMousePos;

let souls = [];
let score = 0;

class SoulObject extends EngineObject {
  constructor(startingPos, direction) {
    super(startingPos, vec2(2, 2), 16, vec2(16, 16));
    this.velocity = vec2(0, 0.1).rotate(90 * direction);
    this.damping = 1;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  canvasFixedSize = vec2(640, 480);
  mainCanvasSize = vec2(640, 480);

  deathCursor = new EngineObject(mousePos, vec2(4, 4), 0, vec2(32, 32));

  souls.push(new SoulObject(vec2(0, -10), 0));
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
