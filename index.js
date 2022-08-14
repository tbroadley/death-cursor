/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let death;

let angel;

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

class AngelObject extends EngineObject {
  targetSoul = null;

  constructor(position, size, tileIndex, tileSize) {
    super(position, size, tileIndex, tileSize);
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  mainCanvasSize = canvasFixedSize = vec2(640, 480);

  cameraPos = vec2(320, 240);
  cameraScale = 1;

  objectMaxSpeed = 20;

  death = new EngineObject(mousePos, vec2(64, 64), 2, vec2(32, 32));

  angel = new EngineObject(
    vec2(640 - 100, 480 - 100),
    vec2(64, 64),
    6,
    vec2(32, 32)
  );
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  death.velocity = mousePos.subtract(death.pos);

  if (!angel.targetSoul && souls.length > 0) {
    // Go for the closest soul
    angel.targetSoul = souls.sort(
      (a, b) =>
        angel.pos.subtract(a.pos).length() - angel.pos.subtract(b.pos).length()
    )[0];
  }

  if (angel.targetSoul) {
    const acceleration = angel.targetSoul.pos
      .subtract(angel.pos)
      .divide(vec2(1000, 1000));

    angel.applyAcceleration(acceleration);

    const angelMaxSpeed = 5 + (clamp(time, 0, 60) / 60) * 5;
    angel.velocity = angel.velocity.clampLength(angelMaxSpeed);
  }

  angel.pos = vec2(clamp(angel.pos.x, 0, 640), clamp(angel.pos.y, 0, 480));

  const soulsToRemove = new Set();
  for (const soul of souls) {
    if (isOverlapping(death.pos, death.size, soul.pos, soul.size)) {
      soul.destroy();
      soulsToRemove.add(soul);
      angel.targetSoul = null;
      score += 10;
    }

    if (isOverlapping(angel.pos, angel.size, soul.pos, soul.size)) {
      soul.destroy();
      soulsToRemove.add(soul);
      angel.targetSoul = null;
      score -= 10;
    }

    if (isOverlapping(death.pos, death.size, angel.pos, angel.size)) {
      paused = true;
    }

    if (!isOverlapping(soul.pos, soul.size, cameraPos, vec2(640, 480))) {
      soul.destroy();
      soulsToRemove.add(soul);
    }
  }

  souls = souls.filter((it) => !soulsToRemove.has(it));

  if (death.velocity.length() < 1) {
    death.tileIndex = 2;
  } else {
    death.tileIndex = death.velocity.direction();
  }

  if (angel.velocity.length() < 1) {
    angel.tileIndex = 6;
  } else {
    angel.tileIndex = angel.velocity.direction() + 4;
  }

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
