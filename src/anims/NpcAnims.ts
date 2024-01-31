import Phaser from "phaser";

const createCatAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'cat_swinging_tail',
    frames: anims.generateFrameNames('cat_swinging_tail', {
      start: 0, end: 3, prefix: 'tile00', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })

  anims.create({
    key: 'cat_licking',
    frames: anims.generateFrameNames('cat_licking', {
      start: 16, end: 18, prefix: 'tile0', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 6
  })

  anims.create({
    key: 'cat_cleaning_head',
    frames: anims.generateFrameNames('cat_cleaning_head', {
      start: 24, end: 26, prefix: 'tile0', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 6
  })

  anims.create({
    key: 'cat_walking',
    frames: anims.generateFrameNames('cat_walking', {
      start: 35, end: 44, prefix: 'tile0', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })
}

const createCatOwnerAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'cat_owner_walking_left',
    frames: anims.generateFrameNames('cat_owner_walking_left', {
      start: 59, end: 62, prefix: 'tile0', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })

  anims.create({
    key: 'cat_owner_walking_right',
    frames: anims.generateFrameNames('cat_owner_walking_right', {
      start: 5, end: 8, prefix: 'tile17', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 8
  })

  anims.create({
    key: 'cat_owner_standing',
    duration: 1000,
    frames: anims.generateFrameNames('cat_owner_standing', {
      start: 0, end: 1, prefix: 'tile00', suffix: '.png'
    }),
    repeat: -1,
    frameRate: 4
  })
}

export {
  createCatAnims,
  createCatOwnerAnims,
} 