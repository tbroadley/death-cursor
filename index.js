/*
    LittleJS Hello World Starter Game
*/

"use strict";

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

const deathSoulPickupSound = new Sound([
  1,
  0.05,
  1874,
  0.02,
  0.02,
  0.17,
  1,
  1.1,
  ,
  -0.1,
  ,
  0.02,
  ,
  0.1,
  ,
  ,
  ,
  0.85,
  0.04,
]);

const angelSoulPickupSound = new Sound([
  1,
  0.05,
  383,
  0.02,
  0.02,
  0.17,
  1,
  1.1,
  ,
  -0.1,
  -90,
  0.06,
  ,
  0.1,
  ,
  ,
  ,
  0.85,
  0.04,
]);

const explosionSound = new Sound([
  1.4,
  ,
  865,
  0.04,
  0.14,
  0.51,
  1,
  3.33,
  0.9,
  ,
  ,
  ,
  0.07,
  0.5,
  -5.4,
  0.3,
  ,
  0.43,
  0.1,
  0.15,
]);

// game variables
let death;

let angels = [];
let lastAngelAddedAt = 0;

let souls = [];
let lastSoulAddedAt = 0;

let lastRoundStartedAt = 0;

let score = 0;

const State = {
  START_MENU: "START_MENU",
  GAME: "GAME",
  GAME_OVER_MENU: "GAME_OVER_MENU",
};
let state = State.START_MENU;

class SoulObject extends EngineObject {
  constructor(startingPos, direction, speed) {
    super(startingPos, vec2(20, 16), 64, vec2(10, 8));
    this.velocity = vec2(0, speed).rotate((Math.PI / 2) * direction);
    this.damping = 1;
  }
}

class AngelObject extends EngineObject {
  targetSoul = null;

  constructor(position) {
    super(position, vec2(40, 64), 6, vec2(20, 32));
    this.setCollision(1, 1, 1);
  }
}

function clearAngelTargetSouls(soul) {
  for (const angel of angels) {
    if (angel.targetSoul === soul) {
      angel.targetSoul = null;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  mainCanvasSize = canvasFixedSize = vec2(640, 480);

  cameraPos = vec2(320, 240);
  cameraScale = 1;

  objectMaxSpeed = 20;

  death = new EngineObject(vec2(320, 240), vec2(40, 64), 2, vec2(20, 32));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (
    mouseWasPressed(0) &&
    (state === State.START_MENU || state === State.GAME_OVER_MENU)
  ) {
    if (state == State.GAME_OVER_MENU) {
      for (const angel of angels) {
        angel.destroy();
      }
      angels = [];

      for (const soul of souls) {
        soul.destroy();
      }
      souls = [];

      lastRoundStartedAt = time;
      lastSoulAddedAt = 0;
      lastAngelAddedAt = 0;

      score = 0;
    }

    state = State.GAME;

    document.querySelector("body").style.cursor = "none";
  }

  if (state !== State.GAME) {
    return;
  }

  const relativeTime = time - lastRoundStartedAt;

  if (mousePosScreen.x) {
    death.velocity = mousePos.subtract(death.pos);
  }

  for (const angel of angels) {
    if (!angel.targetSoul && souls.length > 0) {
      const existingTargetSouls = new Set(
        angels.map((it) => it.targetSoul).filter((it) => !!it)
      );

      const soulsByDistance = souls.sort(
        (a, b) =>
          angel.pos.subtract(a.pos).length() -
          angel.pos.subtract(b.pos).length()
      );

      angel.targetSoul =
        soulsByDistance.find((it) => !existingTargetSouls.has(it)) ??
        soulsByDistance[0];
    }

    if (angel.targetSoul) {
      const acceleration = angel.targetSoul.pos
        .subtract(angel.pos)
        .divide(vec2(1000, 1000));

      angel.applyAcceleration(acceleration);

      const angelMaxSpeed = 5 + (clamp(relativeTime, 0, 60) / 60) * 5;
      angel.velocity = angel.velocity.clampLength(angelMaxSpeed);
    }

    angel.pos = vec2(clamp(angel.pos.x, 0, 640), clamp(angel.pos.y, 0, 480));
  }

  const soulsToRemove = new Set();
  for (const soul of souls) {
    if (isOverlapping(death.pos, death.size, soul.pos, soul.size)) {
      soul.destroy();
      soulsToRemove.add(soul);

      clearAngelTargetSouls(soul);

      deathSoulPickupSound.play();

      score += 10;
    }

    for (const angel of angels) {
      if (isOverlapping(angel.pos, angel.size, soul.pos, soul.size)) {
        soul.destroy();
        soulsToRemove.add(soul);

        clearAngelTargetSouls(soul);

        angelSoulPickupSound.play();
      }

      if (isOverlapping(death.pos, death.size, angel.pos, angel.size)) {
        state = State.GAME_OVER_MENU;

        explosionSound.play();

        document.querySelector("body").style.cursor = "inherit";

        death.velocity = vec2(0, 0);

        for (const angel of angels) {
          angel.velocity = vec2(0, 0);
        }

        for (const soul of souls) {
          soul.velocity = vec2(0, 0);
        }

        return;
      }
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

  for (const angel of angels) {
    if (angel.velocity.length() < 1) {
      angel.tileIndex = 6;
    } else {
      angel.tileIndex = angel.velocity.direction() + 4;
    }
  }

  const soulAddInterval = 0.5 - (clamp(relativeTime, 0, 60) / 60) * 0.25;

  if (souls.length === 0 || relativeTime - lastSoulAddedAt > soulAddInterval) {
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

    const speed = 2 + (clamp(relativeTime, 0, 60) / 60) * 3;

    souls.push(new SoulObject(position, direction, speed));

    lastSoulAddedAt = relativeTime;
  }

  if (angels.length === 0 || relativeTime - lastAngelAddedAt > 10) {
    let angelPos;
    do {
      angelPos = vec2(randInt(0, 640), randInt(0, 480));
    } while (death.pos.subtract(angelPos).length() < 400);

    angels.push(new AngelObject(angelPos));

    lastAngelAddedAt = relativeTime;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  switch (state) {
    case State.START_MENU:
      /**
       * Soulbusters
       * Death Cursor
       * Soulcycle(tm)
       * The Bad Place
       */
      drawTextScreen("Game name TBD", vec2(320, 180), 24);
      drawTextScreen(
        `You are Death.\nCollect souls before the angels do. Don't run into the angels.\nClick anywhere to begin.`,
        vec2(320, 300),
        12
      );

      break;
    case State.GAME:
      drawTextScreen(
        `Score: ${score}`,
        vec2(610, 450),
        12,
        new Color(1, 1, 1),
        0,
        new Color(),
        "right",
        fontDefault
      );
      break;
    case State.GAME_OVER_MENU:
      drawRectScreenSpace(vec2(320, 200), vec2(200, 60), new Color(0, 0, 0));
      drawTextScreen("Game Over", vec2(320, 200), 24);

      drawRectScreenSpace(vec2(320, 310), vec2(200, 60), new Color(0, 0, 0));
      drawTextScreen(
        `Final score: ${score}\nHigh score: TBD\nClick anywhere to play again.`,
        vec2(320, 300),
        12
      );

      break;
  }
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
