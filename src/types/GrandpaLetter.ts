import { Events, sceneEvents } from "@/events/EventsCenter"
import Interactable from "./Interactable"
import GameUI from "@/scenes/GameUI"
import { Singleton } from "@/utils/GlobalAccessSingleton"

export default class GrandpaLetter implements Interactable {
  public x: number = 0
  public y: number = 0
  scene: Phaser.Scene
  public hasPlayerInteracted: boolean = false
  public interactionCount: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x
    this.y = y
    this.scene = scene
  }

  handleInteraction(): void {
    this.hasPlayerInteracted = true
    this.interactionCount++

    if (this.interactionCount === 1) {
      this.showLetter("This is te content of the letter")
    } else if (this.interactionCount === 2) {
      this.hideLetter()
      this.interactionCount = 0

      sceneEvents.emit(Events.GRANDPA_LETTER_READ)
    }
  }

  showLetter(message: string) {
    const gameUi: GameUI = Singleton.getInstance().gameUi
    gameUi.showDialog(message)
  }

  hideLetter() {
    const gameUi: GameUI = Singleton.getInstance().gameUi
    gameUi.hideDialog()
  }
}
