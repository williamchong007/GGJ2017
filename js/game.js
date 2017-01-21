
/* global soundModule */
var yAxis = p2.vec2.fromValues(0, 1);
var PLATFORM_STEPS = 13;

class State extends Phaser.State {
  preload() {
    game.load.image('kuro', 'assets/sprites/KuroDefault.png');
    game.load.image('wall', 'assets/sprites/Wall.png');
  }


  create() {
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

    // to still collide with the world bounds
    game.physics.p2.updateBoundsCollisionGroup();

    for (let i = 0; i < 100; i++) {
      const wall = this.createWall(10 * i, 500);
    }
    this.musicFloors = [];
    const xInterval = game.width / PLATFORM_STEPS;
    for (let i = 0; i < PLATFORM_STEPS; i++) {
      const musicFloor = this.createMusicFloor(i * xInterval, 550);
      this.musicFloors.push(musicFloor);
    }

    this.player = game.add.sprite(300, 300, 'kuro');
    this.player.scale.setTo(4);
    //  Enable if for physics. This creates a default rectangular body.
    game.physics.p2.enable(this.player);

    this.player.body.setCollisionGroup(this.playerCollisionGroup);
    this.player.body.collides([this.playerCollisionGroup, this.musicFloorCollisionGroup]);

    soundModule.signal.add((...params) => { this.onSound(...params); });
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
    }
    else {
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
      this.player.body.moveUp(200);
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

  onSound(p1, p2) {
    console.log('onSound', p1, p2);
    var index = Math.round(p1);
    console.log('noteStrings', soundModule.noteStrings[index]);
    this.musicFloors.forEach((elem, id) => {
      if (id === index) {
        elem.body.moveUp( 50);
        elem.loadTexture('kuro');
      } else {
        elem.loadTexture('wall');

        if (elem.y < 560) {
          elem.body.moveDown(10);
        } else {
          elem.body.setZeroVelocity();
        }

        // elem.y = Phaser.Math.linear(elem.y, 500, 0.01);
      }
    });
  }

  createWall(x, y) {
    var wall = game.add.sprite(x, y, 'wall');
    game.physics.p2.enable(wall);
    wall.body.static = true;

    wall.body.setCollisionGroup(this.playerCollisionGroup);
    wall.body.collides([this.playerCollisionGroup]);
    return wall;
  }

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
  800, 600, Phaser.AUTO, 'wrapper', new State());