import { createLizardAnims } from "@/anims/EnemyAnims";
import { createCharacterAnims } from "@/anims/CharacterAnims";
import { createChestAnims } from "@/anims/TreasureAnims";
import Lizard from "@/enemies/Lizard";
import Character, { Skin } from "@/characters/Character";
import { sceneEvents } from "@/events/EventsCenter";
import Chest from "@/items/Chest";

export class FoxGame extends Phaser.Scene {
  constructor() {
    super('LilFox')
  }

  private mapHeight: number = 100
  private mapLength: number = 100

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private character!: Character

  private terrainLayer: Phaser.Tilemaps.TilemapLayer
  private treasuresLayer: Phaser.Tilemaps.TilemapLayer
  private objectsLayer: Phaser.Tilemaps.TilemapLayer

  private foods: Phaser.GameObjects.Group

  private playerLizardsCollider?: Phaser.Physics.Arcade.Collider

  preload() {
    this.loadSkinSpriteSheet(Skin.DEFAULT)
    this.loadSkinSpriteSheet(Skin.BLUE)
    this.loadSkinSpriteSheet(Skin.KUMAMON)
    this.loadSkinSpriteSheet(Skin.SUNGLASSES)

    this.cursors = this.input.keyboard?.createCursorKeys()!;
  }

  create() {
    this.scene.run('game-ui')

    createCharacterAnims(this.anims)
    createLizardAnims(this.anims)
    createChestAnims(this.anims)

    const map = this.make.tilemap({ key: 'map' });
    const tileset1 = map.addTilesetImage('Tileset 1', 'tiles1');
    const tileset2 = map.addTilesetImage('DungeonTileset', 'tiles2');

    this.terrainLayer = map.createLayer('Terrain', tileset1!)!;
    this.treasuresLayer = map.createLayer('Treasures', tileset2!)!;
    this.objectsLayer = map.createLayer('Objects', tileset1!)!;

    this.objectsLayer?.setCollisionByProperty({ colides: true });

    const chests = this.physics.add.staticGroup({
      classType: Chest
    })
    const chestsLayer = map.getObjectLayer('Treasures')
    chestsLayer?.objects.forEach(chestObj => {
      chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! + chestObj.height! * 0.5, 'treasure')
    })


    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // objectsLayer?.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    // });


    this.character = new Character(this, 920, 920, "character");
    this.character.setSize(this.character.width * 0.5, this.character.height * 0.8)
    this.physics.add.existing(this.character, false);
    this.add.existing(this.character);
    this.physics.world.enableBody(this.character, Phaser.Physics.Arcade.DYNAMIC_BODY)


    this.cameras.main.startFollow(this.character, true, 0.05, 0.05);

    const lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const lizGo = go as Lizard
        if (!lizGo.body) return
        lizGo.body.onCollide = true
        lizGo.setDepth(2);
      }
    })
    lizards.get(950, 950, 'lizard')

    this.physics.add.collider(this.character, this.objectsLayer);
    this.physics.add.collider(lizards, this.objectsLayer);
    this.physics.add.collider(this.character, chests, this.handleCharacterChestCollision, undefined, this)
    this.physics.add.collider(lizards, chests)

    this.playerLizardsCollider = this.physics.add.collider(lizards, this.character, this.handleCharacterLizardCollision, undefined, this);

    this.foods = this.add.group({
      classType: Phaser.GameObjects.Image,
      createCallback: (go) => {
        this.physics.world.enable(go)
      }
    })

    this.physics.add.collider(this.character, this.foods, this.handleCollectFood, undefined, this);

    this.time.addEvent({
      delay: 3 * 1 * 1000,
      callback: this.spawnFood,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnFood() {
    let foodQuantityToSpawn = 210

    while (foodQuantityToSpawn > 0) {
      const x = Phaser.Math.Between(1, this.mapLength - 1)
      const y = Phaser.Math.Between(1, this.mapHeight - 1)

      if (this.objectsLayer.getTileAt(x, y) !== null)
        break

      const tileToReceiveFood = this.terrainLayer.getTileAt(x, y)
      this.foods.get(tileToReceiveFood.pixelX, tileToReceiveFood.pixelY, 'berry')
      foodQuantityToSpawn--
    }
  }

  private handleCollectFood(obj1: any, obj2: any) {
    this.character.eat()
    const food = obj2 as Phaser.GameObjects.Image
    food.destroy()
  }

  private handleCharacterChestCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const chest = obj2 as Chest
    this.character.setChest(chest)
  }

  private handleCharacterLizardCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const lizard = obj2 as Lizard
    const dx = this.character.x - lizard.x
    const dy = this.character.y - lizard.y

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(150)

    this.character.handleDamage(dir)

    sceneEvents.emit('player-health-changed', this.character.health)

    if (this.character.health <= 0) {
      this.playerLizardsCollider?.destroy()
    }
  }

  update(t: number, dt: number) {
    this.character.update(this.cursors)
  }

  changeSkin(skin: Skin) {
    this.character.skin = skin
  }

  loadSkinSpriteSheet(skinName: string) {
    this.load.spritesheet(
      `idle-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_idle_strip8.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      `crouch-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_crouch_strip8.png`,
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      `sit-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_sit_strip8.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      `sneak-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_sneak_strip4.png`,
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      `run-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_run_strip4.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      `walk-${skinName}`,
      `/assets/animations/fox/${skinName}/lilfox_walk_strip8.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
  }
}
