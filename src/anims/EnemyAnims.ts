import Phaser from "phaser";

const createLizardAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'lizard-idle',
    frames: anims.generateFrameNames('lizard_idle', {
      start: 0, end: 3, prefix: 'lizard_m_idle_anim_f', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })

  anims.create({
    key: 'lizard-run',
    frames: anims.generateFrameNames('lizard_run', {
      start: 0, end: 3, prefix: 'lizard_m_run_anim_f', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })

  anims.create({
    key: 'slug',
    frames: anims.generateFrameNames('slug', {
      start: 0, end: 3, prefix: 'slug_anim_f', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })
}

export {
  createLizardAnims
} 