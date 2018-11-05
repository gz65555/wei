import gameOption from "./gameOption";

export default class GameLayer extends Tiny.Container {

  target = Tiny.Sprite.fromImage(Tiny.resources.target);

  inKnives = new Tiny.Container();

  outKnives = new Tiny.Container();

  canThrow = true;

  knife: Tiny.Sprite = null;

  throwAction: Tiny.Action = null;

  constructor() {
    super();

    this.addChild(this.inKnives);
    this.addChild(this.outKnives);

    this.target.anchor.x = 0.5;
    this.target.anchor.y = 0.5;
    setHorizontalCenter(this.target);
    this.target.y = Tiny.WIN_SIZE.height / 2;
    this.addChild(this.target);

    this.throwAction = Tiny.MoveTo(gameOption.throwSpeed, {x: this.target.x, y: this.target.y});

    this.knife = this.createKnife();

    Tiny.app.onUpdate(this.update.bind(this));

    this.hitArea = new Tiny.Rectangle(0, 0, Tiny.WIN_SIZE.width, Tiny.WIN_SIZE.height);
    this.interactive = true;
    this.on('pointerdown', this.onPointDown.bind(this))
  }

  onPointDown() {
    if (this.canThrow) {
      this.canThrow = false;

      this.throwAction.onComplete = () => {
        const isHitKnife = this.inKnives.children.some(knife => this.isHitKnife(knife, this.knife));
        if (!isHitKnife) {
          this.inKnives.addChild(this.knife);
          this.knife = this.createKnife();
          this.canThrow = true;
        } else {
          this.knife.anchor.y = 0.5;
          const tween = new Tiny.TWEEN.Tween(this.knife).to({
            rotation: 5,
            y: Tiny.WIN_SIZE.height
          }, gameOption.throwSpeed * 4).onComplete(() => {
            this.onGameEnd();
          });
          tween.start();
        }
      };

      this.knife.runAction(this.throwAction);
    }
  }

  createKnife() {
    const knife = Tiny.Sprite.fromImage(Tiny.resources.knife);
    knife.anchor.x = 0.5;
    setHorizontalCenter(knife);
    knife.y = this.target.y + 420;
    this.outKnives.addChild(knife);
    return knife;
  }

  update() {
    const deltaRotation = gameOption.rotationSpeed / 180 * Math.PI;
    this.target.rotation += deltaRotation;
    this.inKnives.children.forEach(knife => {
      knife.rotation += deltaRotation;
    })
  }

  isHitKnife(knife1, knife2) {
    let deltaRotation = knife1.rotation - knife2.rotation;
    deltaRotation = (deltaRotation / Math.PI * 180) % 360;
    if (deltaRotation > 180) {
      deltaRotation -= 360;
      deltaRotation = -deltaRotation;
    }
    return deltaRotation < gameOption.minAngle;
  }

  onGameEnd() {
    this.inKnives.removeChildren();
    this.outKnives.removeChild(this.knife);
    this.knife = this.createKnife();
    this.canThrow = true;
  }
}

function setHorizontalCenter(sprite) {
  sprite.x = (Tiny.WIN_SIZE.width - sprite.width) / 2 + sprite.width * sprite.anchor.x;
}
