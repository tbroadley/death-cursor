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

const angelSpawnSound = new Sound([
  1,
  0,
  293.6648,
  0.03,
  0.14,
  0.13,
  2,
  1.3,
  ,
  ,
  ,
  ,
  0.08,
  ,
  580,
  ,
  0.01,
  0.42,
  0.1,
  0.17,
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

// prettier-ignore
const music = new Music([[[,0,92,,.01,.08,,.2,,,,.01],[,0,740,,,.15,2,.2,-.1,-.15,9,.02,,.1,.12,,.06]],[[[1,,4,,,,3,,,,1,,,7,1,,,,4,,,-1,3,,,,1,,,7,13,,,,9,,,,8,,,,6,,,4,1,,,,3,,,,,,4,1,3,,,,,,,,],[,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,]]],[0],110,{"title":"New Song","instruments":["Korg Bass","Flute"],"patterns":["Pattern 0"]}])
let musicSource;

document.addEventListener("click", () => {
  if (musicSource) return;

  musicSource = music.play(0.75);
});

function updateHighScore(score) {
  localStorage.tbroadleyJs13kGamesHighScore = max(
    localStorage.tbroadleyJs13kGamesHighScore ?? 0,
    score
  );
}

// game variables
let death;

let angels = [];
let lastAngelAddedAt = 0;

let souls = [];
let lastSoulAddedAt = 0;

let lastRoundStartedAt = 0;

let score = 0;
updateHighScore(score);

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
  constructor(position) {
    super(position, vec2(40, 64), 6, vec2(20, 32));
    this.setCollision(1, 1, 1);
  }
}

function removeSoulAsAngelTarget(soul) {
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

    if (!musicSource) {
      musicSource = music.play(0.75);
    }
  }

  if (state !== State.GAME) {
    return;
  }

  const relativeTime = time - lastRoundStartedAt;

  // Move Death towards mouse cursor if it's on the screen
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
      // Accelerate towards target soul
      const acceleration = angel.targetSoul.pos
        .subtract(angel.pos)
        .divide(vec2(2000, 2000));
      angel.applyAcceleration(acceleration);

      angel.velocity = angel.velocity.clampLength(5);
    }

    // Keep angels onscreen
    angel.pos = vec2(clamp(angel.pos.x, 0, 640), clamp(angel.pos.y, 0, 480));
  }

  const soulsToRemove = new Set();
  for (const soul of souls) {
    if (isOverlapping(death.pos, death.size, soul.pos, soul.size)) {
      soul.destroy();
      soulsToRemove.add(soul);

      removeSoulAsAngelTarget(soul);

      deathSoulPickupSound.play();

      score += 10;
      updateHighScore(score);
    }

    for (const angel of angels) {
      if (isOverlapping(angel.pos, angel.size, soul.pos, soul.size)) {
        soul.destroy();
        soulsToRemove.add(soul);

        removeSoulAsAngelTarget(soul);

        angelSoulPickupSound.play();
      }

      // TODO move this outside the loop over souls
      if (
        isOverlapping(
          death.pos,
          death.size.subtract(vec2(20, 20)), // Make Death's hitbox with respect to angels a bit more forgiving
          angel.pos,
          angel.size
        )
      ) {
        state = State.GAME_OVER_MENU;

        explosionSound.play();

        musicSource?.stop();
        musicSource = null;

        // Make cursor appear again
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

    // Remove souls that are offscreen
    if (!isOverlapping(soul.pos, soul.size, cameraPos, vec2(640, 480))) {
      soul.destroy();
      soulsToRemove.add(soul);

      removeSoulAsAngelTarget(soul);
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

  const soulAddInterval = 1 / angels.length;

  if (souls.length === 0 || relativeTime - lastSoulAddedAt > soulAddInterval) {
    let position;

    // Have the soul start from a random edge of the screen, moving across the screen perpendicular to the edge
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
        console.error(`Unexpected direction ${direction} when creating a soul`);
    }

    const speed = 2 + (relativeTime / 60) * 3;
    const soul = new SoulObject(position, direction, speed);
    souls.push(soul);

    // Find the first angel that shares a target with another angel. Reassign it to target the newly-created soul
    const angelTargets = new Set();
    for (const angel of angels) {
      if (angelTargets.has(angel.targetSoul)) {
        angel.targetSoul = soul;
        break;
      }

      angelTargets.add(angel.targetSoul);
    }

    lastSoulAddedAt = relativeTime;
  }

  if (angels.length === 0 || relativeTime - lastAngelAddedAt > 10) {
    // Spawn the angel on-screen but relatively far away from Death
    let angelPos;
    do {
      angelPos = vec2(randInt(0, 640), randInt(0, 480));
    } while (death.pos.subtract(angelPos).length() < 400);

    angels.push(new AngelObject(angelPos));

    if (angels.length > 1) {
      angelSpawnSound.play(null, 0.5);
    }

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
      drawTextScreen("Death Cursor", vec2(320, 180), 24);
      drawTextScreen(
        `You are Death.\nUse your mouse to collect souls before the angels do.\nDon't touch the angels.\nClick anywhere to begin.`,
        vec2(320, 300),
        12
      );

      break;
    case State.GAME:
      drawTextScreen(
        `Score: ${score}\nHigh score: ${localStorage.tbroadleyJs13kGamesHighScore}`,
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
        `Final score: ${score}\nHigh score: ${localStorage.tbroadleyJs13kGamesHighScore}\nClick anywhere to play again.`,
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
