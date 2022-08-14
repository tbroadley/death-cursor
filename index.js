/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let deathCursor;
let lastMousePos;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  canvasFixedSize = vec2(640, 480);

  deathCursor = new EngineObject(mousePos, vec2(4, 4), 0, vec2(32, 32));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (mousePosScreen.x) deathCursor.pos = mousePos;

  if (lastMousePos) {
    const mouseMovement = mousePos.subtract(lastMousePos);

    if (mouseMovement.length() < 0.1) {
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
function gameRenderPost() {}

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
