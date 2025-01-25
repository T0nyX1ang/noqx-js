/**
 * Encoding for penpa-edit frontend.
 */

const PENPA_PREFIX = "m=edit&p=";
const PENPA_ABBREVIATIONS = [
  ['"qa"', "z9"],
  ['"pu_q"', "zQ"],
  ['"pu_a"', "zA"],
  ['"grid"', "zG"],
  ['"edit_mode"', "zM"],
  ['"surface"', "zS"],
  ['"line"', "zL"],
  ['"edge"', "zE"],
  ['"wall"', "zW"],
  ['"cage"', "zC"],
  ['"number"', "zN"],
  ['"sudoku"', "z1"],
  ['"symbol"', "zY"],
  ['"special"', "zP"],
  ['"board"', "zB"],
  ['"command_redo"', "zR"],
  ['"command_undo"', "zU"],
  ['"command_replay"', "z8"],
  ['"freeline"', "zF"],
  ['"freeedge"', "z2"],
  ['"thermo"', "zT"],
  ['"arrows"', "z3"],
  ['"d"', "zD"],
  ['"squareframe"', "z0"],
  ['"polygon"', "z5"],
  ['"deleteedge"', "z4"],
  ['"killercages"', "z6"],
  ['"nobulbthermo"', "z7"],
  ['"__a"', "z_"],
  ["null", "zO"],
];

function int_or_str(data) {
  // Convert the string to integer if possible.
  if (typeof data === "number") return data;
  return /^\d+$/.test(data) ? parseInt(data, 10) : data;
}

function style_convert(style) {
  // Convert the style to binary format.
  return parseInt(style.join(""), 2);
}

function category_to_direction(r, c, category) {
  // Convert the coordination with category to standard direction.
  if (category === 0) return [r, c, BaseDir.CENTER];
  if (category === 1) return [r + 1, c + 1, BaseDir.TOP_LEFT];
  if (category === 2) return [r + 1, c, BaseDir.TOP];
  if (category === 3) return [r, c + 1, BaseDir.LEFT];
  throw new Error("Invalid category type.");
}

class PenpaPuzzle extends BasePuzzle {
  // The constructor for Penpa+ Puzzle.

  constructor(name, content, param = {}) {
    super(name, content, param);
    this.cell_shape = null;
    this.problem = {};
    this.solution = {};
    this.parts = [];
  }

  decode() {
    // Remove prefix and decode
    const base64_str = atob(this.content.slice(PENPA_PREFIX.length));
    const zip_binary = Uint8Array.from(base64_str.split(""), (e) =>
      e.charCodeAt(0)
    );
    const inflate = new Zlib.RawInflate(zip_binary);
    const plain = inflate.decompress();
    const decrypted = new TextDecoder().decode(plain);

    this.parts = decrypted.split("\n");

    this._init_size();
    this._unpack_board();
  }

  _init_size() {
    const header = this.parts[0].split(",");
    if (
      header[0] === "square" ||
      header[0] === "sudoku" ||
      header[0] === "kakuro"
    ) {
      this.cell_shape = "square";
      this.margin = JSON.parse(this.parts[1]);
      const [top_margin, bottom_margin, left_margin, right_margin] =
        this.margin;
      this.row = parseInt(header[2], 10) - top_margin - bottom_margin;
      this.col = parseInt(header[1], 10) - left_margin - right_margin;
    } else {
      throw new Error(
        "Unsupported cell shape. Current only square shape is supported."
      );
    }
    console.log(
      `[Puzzle] Board initialized. Size: ${this.row}x${this.col}. Margin: ${this.margin}.`
    );
  }

  _unpack_surface() {
    for (const [index, color_code] of Object.entries(
      this.problem.surface || {}
    )) {
      const [coord] = this.index_to_coord(parseInt(index, 10));
      const point = new BasePoint(coord[0], coord[1]);
      if ([1, 3, 8].includes(color_code)) {
        this.surface.set(point, BaseColor.GRAY);
      }
      if (color_code === 4) {
        this.surface.set(point, BaseColor.BLACK);
      }
      if (color_code === 2) {
        this.surface.set(point, BaseColor.GREEN);
      }
    }
  }

  _unpack_text() {
    for (const [index, num_data] of Object.entries(this.problem.number || {})) {
      const [rc, category] = this.index_to_coord(parseInt(index, 10));
      const coord = category_to_direction(rc[0], rc[1], category);
      if (num_data[2] === "4") {
        let i = 0;
        for (const data of num_data[0].split("").map(int_or_str)) {
          this.text.set(new BasePoint(...coord, `tapa_${i++}`), data);
        }
      } else if (num_data[2] !== "7") {
        this.text.set(new BasePoint(...coord, "normal"), int_or_str(num_data[0]));
      }
    }
  }

  _unpack_sudoku() {
    for (const [index, num_data] of Object.entries(this.problem.sudoku || {})) {
      const idx_num = parseInt(index, 10);
      const [rc, category] = this.index_to_coord(Math.floor(idx_num / 4));
      const coord = category_to_direction(rc[0], rc[1], 0);
      const num_direction = (category - 1) * 4 + (idx_num % 4);
      this.text.set(
        new BasePoint(...coord, `sudoku_${num_direction}`),
        int_or_str(num_data[0])
      );
    }
  }

  _unpack_symbol() {
    for (const [index, symbol_data] of Object.entries(
      this.problem.symbol || {}
    )) {
      const [rc, category] = this.index_to_coord(parseInt(index, 10));
      if (Array.isArray(symbol_data[0])) {
        const symbol_name = `${symbol_data[1]}__${style_convert(symbol_data[0])}`;
        this.symbol.set(
          new BasePoint(
            ...category_to_direction(rc[0], rc[1], category),
            "multiple"
          ),
          symbol_name
        );
      } else {
        const symbol_name = `${symbol_data[1]}__${symbol_data[0]}`;
        const pos =
          this.puzzle_name === "nondango" && symbol_name === "circle_M__4"
            ? "nondango_mark"
            : "normal";
        this.symbol.set(
          new BasePoint(...category_to_direction(rc[0], rc[1], category), pos),
          symbol_name
        );
      }
    }
  }

  _unpack_edge() {
    for (const [index] of Object.entries(this.problem.edge || {})) {
      if (!index.includes(",")) {
        const [coord, category] = this.index_to_coord(parseInt(index, 10));
        if (category === 2) {
          this.edge.set(
            new BasePoint(coord[0] + 1, coord[1], BaseDir.TOP),
            false
          );
        }
        if (category === 3) {
          this.edge.set(
            new BasePoint(coord[0], coord[1] + 1, BaseDir.LEFT),
            false
          );
        }
        continue;
      }
      const [index_1, index_2] = index.split(",").map((i) => parseInt(i, 10));
      const [coord_1] = this.index_to_coord(index_1);
      const [coord_2] = this.index_to_coord(index_2);
      if (coord_1[0] === coord_2[0]) {
        this.edge.set(
          new BasePoint(coord_2[0] + 1, coord_2[1], BaseDir.TOP),
          true
        );
      } else if (coord_1[1] === coord_2[1]) {
        this.edge.set(
          new BasePoint(coord_2[0], coord_2[1] + 1, BaseDir.LEFT),
          true
        );
      } else if (
        coord_1[0] - coord_2[0] === 1 &&
        coord_2[1] - coord_1[1] === 1
      ) {
        this.edge.set(
          new BasePoint(coord_2[0], coord_2[1], BaseDir.DIAG_UP),
          true
        );
      } else if (
        coord_2[0] - coord_1[0] === 1 &&
        coord_1[1] - coord_2[1] === 1
      ) {
        this.edge.set(
          new BasePoint(coord_2[0], coord_2[1], BaseDir.DIAG_DOWN),
          true
        );
      }
    }
  }

  _unpack_line() {
    for (const [index, data] of Object.entries(this.problem.line || {})) {
      if (!index.includes(",")) {
        const [coord, category] = this.index_to_coord(parseInt(index, 10));
        if (category === 2) {
          this.line.set(
            new BasePoint(coord[0], coord[1], BaseDir.CENTER, "d"),
            false
          );
          this.line.set(
            new BasePoint(coord[0] + 1, coord[1], BaseDir.CENTER, "u"),
            false
          );
        }
        if (category === 3) {
          this.line.set(
            new BasePoint(coord[0], coord[1], BaseDir.CENTER, "r"),
            false
          );
          this.line.set(
            new BasePoint(coord[0], coord[1] + 1, BaseDir.CENTER, "l"),
            false
          );
        }
        continue;
      }
      const [index_1, index_2] = index.split(",").map((i) => parseInt(i, 10));
      const [coord_1] = this.index_to_coord(index_1);
      const [coord_2, category] = this.index_to_coord(index_2);
      const hashi_num =
        this.puzzle_name === "hashi" ? (data === 30 ? "_2" : "_1") : "";
      if (category === 0) {
        const dd = coord_1[0] === coord_2[0] ? "rl" : "du";
        this.line.set(
          new BasePoint(
            coord_1[0],
            coord_1[1],
            BaseDir.CENTER,
            dd[0] + hashi_num
          ),
          true
        );
        this.line.set(
          new BasePoint(
            coord_2[0],
            coord_2[1],
            BaseDir.CENTER,
            dd[1] + hashi_num
          ),
          true
        );
      } else {
        const eqxy = coord_1[0] === coord_2[0] && coord_1[1] === coord_2[1];
        const d = category === 2 ? (eqxy ? "d" : "u") : eqxy ? "r" : "l";
        this.line.set(
          new BasePoint(coord_1[0], coord_1[1], BaseDir.CENTER, d + hashi_num),
          true
        );
      }
    }
  }

  _unpack_board() {
    // Must unpack solution board first, then edit board
    for (const p of [4, 3]) {
      const json_str = PENPA_ABBREVIATIONS.reduce(
        (s, abbr) => s.replaceAll(abbr[1], abbr[0]),
        this.parts[p]
      );
      this.problem = JSON.parse(json_str);
      this._unpack_surface();
      this._unpack_text();
      this._unpack_sudoku();
      this._unpack_symbol();
      this._unpack_edge();
      this._unpack_line();
    }
    console.log("[Puzzle] Board unpacked.");
  }

  index_to_coord(index) {
    const [top_margin, bottom_margin, left_margin, right_margin] = this.margin;
    const real_row = this.row + top_margin + bottom_margin + 4;
    const real_col = this.col + left_margin + right_margin + 4;
    const category = Math.floor(index / (real_row * real_col));
    index %= real_row * real_col;
    const r = Math.floor(index / real_col) - 2 - top_margin;
    const c = (index % real_col) - 2 - left_margin;
    return [[r, c], category];
  }

  encode() {
    // Rebuild solution
    const solution_str = PENPA_ABBREVIATIONS.reduce(
      (s, abbr) => s.replaceAll(abbr[1], abbr[0]),
      this.parts[4]
    );
    this.solution = JSON.parse(solution_str);
    this._pack_board();
    const encoded = JSON.stringify(this.solution);
    this.parts[4] = PENPA_ABBREVIATIONS.reduce(
      (s, abbr) => s.replaceAll(abbr[0], abbr[1]),
      encoded
    );

    const puz_data = this.parts.join("\n");
    const u8text = new TextEncoder().encode(puz_data);
    var deflate = new Zlib.RawDeflate(u8text);
    var compressed = deflate.compress();
    var char8 = Array.from(compressed, (e) => String.fromCharCode(e)).join("");
    return PENPA_PREFIX + btoa(char8);
  }

  _pack_surface() {
    for (const [point, color] of this.surface.entries()) {
      const index = this.coord_to_index([point.r, point.c], 0);
      let color_code = null;
      if (color === BaseColor.BLACK) {
        color_code = 4;
      }
      if (color === BaseColor.GRAY) {
        color_code = 8;
      }
      if (color_code && !this.problem.surface[`${index}`]) {
        this.solution.surface = this.solution.surface || {};
        this.solution.surface[`${index}`] = color_code;
      }
    }
  }

  _pack_text() {
    for (const [point, data] of this.text.entries()) {
      const index = this.coord_to_index([point.r, point.c], 0);
      if (!this.problem.number[`${index}`]) {
        this.solution.number = this.solution.number || {};
        this.solution.number[`${index}`] = [String(data), 2, "1"];
      }
    }
  }

  _pack_symbol() {
    for (const [point, symbol_name] of this.symbol.entries()) {
      const [shape, style] = symbol_name.split("__");
      const index = this.coord_to_index([point.r, point.c], 0);
      this.solution.symbol = this.solution.symbol || {};
      if (this.puzzle_name === "nondango") {
        this.solution.symbol[`${index}`] = [parseInt(style, 10), shape, 1];
      } else if (!this.problem.symbol[`${index}`]) {
        this.solution.symbol[`${index}`] = [parseInt(style, 10), shape, 1];
      }
    }
  }

  _pack_edge() {
    for (const point of this.edge.keys()) {
      let coord_1 = [point.r - 1, point.c - 1];
      let coord_2 = [point.r - 1, point.c - 1];
      if (point.d === BaseDir.TOP) {
        coord_2 = [point.r - 1, point.c];
      }
      if (point.d === BaseDir.LEFT) {
        coord_2 = [point.r, point.c - 1];
      }
      if (point.d === BaseDir.DIAG_UP) {
        coord_1 = [point.r, point.c - 1];
        coord_2 = [point.r - 1, point.c];
      }
      if (point.d === BaseDir.DIAG_DOWN) {
        coord_2 = [point.r, point.c];
      }
      const index_1 = this.coord_to_index(coord_1, 1);
      const index_2 = this.coord_to_index(coord_2, 1);
      const key = `${index_1},${index_2}`;
      this.solution.edge = this.solution.edge || {};
      if (!this.problem.edge[key]) {
        this.solution.edge[key] = 3;
      }
    }
  }

  _pack_line() {
    for (const point of this.line.keys()) {
      const index_1 = this.coord_to_index([point.r, point.c], 0);
      let index_2;
      if (point.pos.startsWith("r")) {
        index_2 = this.coord_to_index([point.r, point.c], 3);
      } else if (point.pos.startsWith("d")) {
        index_2 = this.coord_to_index([point.r, point.c], 2);
      } else if (point.pos.startsWith("l")) {
        index_2 = this.coord_to_index([point.r, point.c - 1], 3);
      } else if (point.pos.startsWith("u")) {
        index_2 = this.coord_to_index([point.r - 1, point.c], 2);
      } else {
        throw new Error("Unsupported line direction.");
      }
      this.solution.line = this.solution.line || {};
      if (this.puzzle_name === "hashi") {
        this.solution.line[`${index_1},${index_2}`] = point.pos.endsWith("_1")
          ? 3
          : 30;
      } else if (!this.problem.line[`${index_1},${index_2}`]) {
        this.solution.line[`${index_1},${index_2}`] = 3;
      }
    }
  }

  _pack_board() {
    this._pack_surface();
    this._pack_text();
    this._pack_symbol();
    this._pack_edge();
    this._pack_line();
    console.log("[Solution] Board packed.");
  }

  coord_to_index(coord, category = 0) {
    const [top_margin, bottom_margin, left_margin, right_margin] = this.margin;
    const real_row = this.row + top_margin + bottom_margin + 4;
    const real_col = this.col + left_margin + right_margin + 4;
    return (
      category * real_row * real_col +
      (coord[0] + 2 + top_margin) * real_col +
      (coord[1] + 2 + left_margin)
    );
  }
}
