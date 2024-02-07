import PlatformGameCharacter from "@/characters/PlatformGameCharacter";
import { Events, sceneEvents } from "@/events/EventsCenter";

export default class MarioScene extends Phaser.Scene {

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  public character!: PlatformGameCharacter
  private terrainLayer: Phaser.Tilemaps.TilemapLayer
  private waterLayer: Phaser.Tilemaps.TilemapLayer

  private coins: Phaser.GameObjects.Group

  private collectedCoins: number = 0

  constructor() {
    super({

      key: 'MarioScene',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1700 },
          // debug: true
        },
      },
    })
  }


  preload() {
    this.cursors = this.input.keyboard?.createCursorKeys()!;
  }

  create() {
    const map = this.make.tilemap({ key: 'platform-level-map' });
    const tileset0 = map.addTilesetImage('nature-paltformer-tileset-16x16', 'tiles3');


    map.createLayer('Sky', tileset0!)!;
    this.waterLayer = map.createLayer('Water', tileset0!)!;
    this.terrainLayer = map.createLayer('Terrain', tileset0!)!;


    this.character = new PlatformGameCharacter(this, 30, 650, "character");

    this.character.setSize(this.character.width * 0.4, this.character.height * 0.4)
    this.physics.add.existing(this.character, false);
    this.add.existing(this.character);
    this.physics.world.enableBody(this.character, Phaser.Physics.Arcade.DYNAMIC_BODY)

    this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
    this.cameras.main.setBounds(25, 500, 3392, 100)

    this.terrainLayer?.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.character, this.terrainLayer, this.handleTerrainCollision, undefined, this);

    this.coins = this.add.group({
      classType: Phaser.GameObjects.Image,
      createCallback: (go) => {
        this.physics.world.enable(go);
        (go as any).body.allowGravity = false;
      }
    })

    map.getObjectLayer('Coins')!.objects.forEach(coin => {
      this.add.tween({
        yoyo: true,
        delay: 0,
        duration: 300,
        repeat: -1,
        y: {
          from: coin.y,
          start: coin.y,
          to: coin.y! - 1,
        },
        targets: this.coins.get(coin.x, coin.y, 'coin').setOrigin(0, 1),
      })
    })

    this.physics.add.collider(this.character, this.coins, this.handleCollectCoin, undefined, this);
  }

  handleCollectCoin(obj1: any, obj2: any) {
    obj2.destroy()
    this.collectedCoins++
    sceneEvents.emit(Events.PLAYER_COLLECTED_COIN, this.collectedCoins)
  }

  handleTerrainCollision() {
    this.character.isJumping = false
  }

  update(t: number, dt: number) {
    this.character.update(this.cursors)
  }

}
