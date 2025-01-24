/** Initializations of the base encodings. */

class BaseColor {
  static GREEN = Symbol("GREEN");
  static GRAY = Symbol("GRAY");
  static BLACK = Symbol("BLACK");
  static DARK = [BaseColor.GRAY, BaseColor.BLACK];
}

class BaseDir {
  static CENTER = Symbol("center");
  static TOP = Symbol("top");
  static LEFT = Symbol("left");
  static TOP_LEFT = Symbol("top_left");
  static DIAG_UP = Symbol("diag_up");
  static DIAG_DOWN = Symbol("diag_down");
}

class BasePoint {
  constructor(r, c, d = BaseDir.CENTER, pos = "normal") {
    this.r = r;
    this.c = c;
    this.d = d;
    this.pos = pos;
  }
}

class BasePuzzle {
  constructor(name, content, param = {}) {
    this.puzzle_name = name;
    this.param = param;
    this.content = content;

    this.col = 0;
    this.row = 0;
    this.margin = [0, 0, 0, 0]; // top, bottom, left, right

    this.surface = new Map();
    this.text = new Map();
    this.symbol = new Map();
    this.edge = new Map();
    this.line = new Map();
  }

  clear() {
    this.surface.clear();
    this.text.clear();
    this.symbol.clear();
    this.edge.clear();
    this.line.clear();
  }

  decode() {
    throw new Error("Not implemented");
  }

  encode() {
    throw new Error("Not implemented");
  }
}
