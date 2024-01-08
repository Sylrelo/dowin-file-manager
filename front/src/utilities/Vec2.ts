export class Vec2 {
  #x: number = 0;
  #y: number = 0;

  constructor(x: number, y: number) {
    this.#x = x;
    this.#y = y;
  }

  sub(input: Vec2): Vec2 {
    return new Vec2(this.x - input.x, this.y - input.y);
  }

  add(input: Vec2): Vec2 {
    return new Vec2(this.x + input.x, this.y + input.y);
  }

  get lenght(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }
}

