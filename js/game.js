
/* global soundModule */
var yAxis = p2.vec2.fromValues(0, 1);
var PLATFORM_STEPS = 10;
const DEADLINE_HEIGHT =  160;
const PLAYER_INIT_LIFE_COUNT = 4;

class State extends Phaser.State {
  preload() {
    game.load.image('character', 'assets/sprites/character.png');
    game.load.image('wall', 'assets/sprites/platform.png');
    game.load.image('background', 'assets/sprites/dayBG.png');
    game.load.image('spears', 'assets/sprites/spikes.png');
  }


  create() {
    game.add.tileSprite(0, 0, 1280, 720, 'background');

    this.lifeText = game.add.text(20, 20, "4", {
        font: "20px Arial",
        fill: "#ff0044",
        align: "center"
    });

    this.lifeText.anchor.setTo(0, 0);

    game.stage.backgroundColor = "#4488AA";

    this.cursors = game.input.keyboard.createCursorKeys();

    this.jumpTimer = 0;

    //  Enable p2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);

    game.physics.p2.gravity.y = 200;
    game.physics.p2.world.defaultContactMaterial.friction = 0.3;
    game.physics.p2.world.setGlobalStiffness(1e5);

    //  Create our collision groups. One for the player, one for the music floors
    this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
    this.musicFloorCollisionGroup = game.physics.p2.createCollisionGroup();
    this.deadCollisionGroup = game.physics.p2.createCollisionGroup();

    // to still collide with the world bounds
    game.physics.p2.updateBoundsCollisionGroup();

    // for (let i = 0; i < 100; i++) {
    //   const wall = this.createWall(100 * i, 500);
    // }
    this.musicFloors = [];
    const xInterval = game.width / PLATFORM_STEPS;
    for (let i = 0; i < PLATFORM_STEPS; i++) {
      const musicFloor = this.createMusicFloor(i * xInterval, 510);
      this.musicFloors.push(musicFloor);
    }

    this.player = game.add.sprite(300, 300, 'character');
    this.player.lifeCount = PLAYER_INIT_LIFE_COUNT;
    this.player.scale.setTo(1);
    //  Enable if for physics. This creates a default rectangular body.
    game.physics.p2.enable(this.player);

    this.player.body.setCollisionGroup(this.playerCollisionGroup);
    this.player.body.collides([this.playerCollisionGroup, this.musicFloorCollisionGroup, this.deadCollisionGroup]);

    this.deadzones = this.setupDeadZones();

    soundModule.signal.add((...params) => { this.onSound(...params); });
  }

  setupDeadZones() {
    var currentX = 0;
    var output = [];
    const deadline_y = game.height - DEADLINE_HEIGHT/2;
    while (currentX < game.width) {
      var deadzone = game.add.sprite(currentX, deadline_y, 'spears');
      game.physics.p2.enable(deadzone);
      deadzone.body.static=true;
      deadzone.body.setCollisionGroup(this.deadCollisionGroup);
      deadzone.body.collides([this.playerCollisionGroup], this.hurtPlayer, this);
      output.push(deadzone);
      currentX += deadzone.width;
    }
    return output;
  }

  update() {

    if (this.cursors.left.isDown) {
      this.player.body.moveLeft(200);

      // if (player.facing != 'left') {
      //   player.facing = 'left';
      // }
    }
    else if (this.cursors.right.isDown) {
      this.player.body.moveRight(200);

      // if (player.facing != 'right') {
      //   player.facing = 'right';
      // }
    } else {
      this.player.body.velocity.x = 0;

      // if (player.facing != 'idle') {

      //   if (player.facing == 'left') {
      //   }
      //   else {
      //   }

      //   player.facing = 'idle';
      // }
    }

    if (this.cursors.up.isDown && game.time.now > this.jumpTimer && this.checkIfCanJump()) {
      this.player.body.moveUp(300);
      this.jumpTimer = game.time.now + 750;
    }
  }

  checkIfCanJump() {

    var result = false;

    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
      var c = game.physics.p2.world.narrowphase.contactEquations[i];

      if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data) {
        var d = p2.vec2.dot(c.normalA, yAxis);

        if (c.bodyA === this.player.body.data) {
          d *= -1;
        }

        if (d > 0.5) {
          result = true;
        }
      }
    }

    return result;

  }

  hurtPlayer(sprite1, sprite2) {
    console.log("hurtPlayer");
    this.player.lifeCount--;
    this.lifeText.setText(this.player.lifeCount);
  }

  onSound(y0Pitch, y1Pitch, y0Amplitude, y1Amplitude) {
    const normalized0 = y0Pitch / 6.5;
    const normalized1 = y1Pitch / 6.5;
    var index = Math.round(normalized0 * PLATFORM_STEPS);
    var singIndex = Math.round(normalized0 * 11);
    // console.log('noteStrings', soundModule.noteStrings[index]);
    //console.log('onSound',
      // normalized0, soundModule.noteStrings[singIndex],
      // normalized1, '');
    this.musicFloors.forEach((elem, id) => {
      if (Math.abs(id - index) < 3) {
        // const heightLimit = 500 - y0Amplitude * 70;
        const heightLimit = 500 - 400;
        if (elem.y > heightLimit) {
          elem.body.moveUp(300);
        } else {
          elem.body.y = heightLimit;
          elem.body.setZeroVelocity();
        }
        elem.loadTexture('wall');
      } else {
        elem.loadTexture('wall');

        if (elem.y < game.height - DEADLINE_HEIGHT) {
          elem.body.moveDown(50);
        } else if (elem.y < game.height) {
          elem.body.moveDown(25);
        } else {
          elem.body.y = game.height;
          elem.body.setZeroVelocity();
        }

        // elem.y = Phaser.Math.linear(elem.y, 500, 0.01);
      }
    });
  }

  // createWall(x, y) {
  //   var wall = game.add.sprite(x, y, 'wall');
  //   game.physics.p2.enable(wall);
  //   wall.body.static = true;

  //   wall.body.setCollisionGroup(this.playerCollisionGroup);
  //   wall.body.collides([this.playerCollisionGroup]);
  //   return wall;
  // }

  createMusicFloor(x, y) {
    var wall = game.add.sprite(x, y, 'wall');
    game.physics.p2.enable(wall);
    wall.body.kinematic = true;

    wall.body.setCollisionGroup(this.musicFloorCollisionGroup);
    wall.body.collides([this.playerCollisionGroup, this.musicFloorCollisionGroup]);
    return wall;
  }
}

var game = new Phaser.Game(
  1280, 720, Phaser.AUTO, 'wrapper', new State());