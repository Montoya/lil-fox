import { Direction } from '@/utils/gridUtils'
import Phaser from 'phaser'

export default class CatOwner extends Phaser.Physics.Arcade.Sprite {

  private direction = Direction.RIGHT
  private moveEvent: Phaser.Time.TimerEvent

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.anims.play('cat_owner_walking_left')

    this.moveEvent = scene.time.addEvent({
      delay: 1700,
      loop: true,
      callback: () => this.changeDirection()
    })
  }

  changeDirection() {
    console.log('changing Direction')
    if (this.direction === Direction.RIGHT) {
      this.direction = Direction.LEFT
      this.anims.play('cat_owner_walking_right')
    } else {
      this.direction = Direction.RIGHT
      this.anims.play('cat_owner_walking_left')
    }
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    this.setSize(this.width, this.height * 0.6)
    this.body?.offset.setTo(0, 12);

    const speed = 30

    switch (this.direction) {
      case Direction.LEFT:
        this.setVelocity(-speed, 0)
        break
      case Direction.RIGHT:
        this.setVelocity(speed, 0)
        break
    }
  }

  destroy(fromScene?: boolean | undefined) {
    this.moveEvent.destroy()
    super.destroy(fromScene)
  }
}