/**
 * Generating commonly used facts and rules for the solver.
 */

function display(item = "black", size = 2) {
  /** Generates a rule for displaying specific items with a certain size. */
  return `#show ${item}/${size}.`;
}

function defined(item, size = 2) {
  /** Generates a rule for defined specific items with a certain size. */
  return `#defined ${item}/${size}.`;
}

function grid(rows, cols, with_holes = false) {
  /** Generates facts for a grid. This fact can be extended with holes. */
  if (with_holes) {
    return `grid(R, C) :- R = 0..${rows - 1}, C = 0..${
      cols - 1
    }, not hole(R, C).`;
  }
  return `grid(0..${rows - 1}, 0..${cols - 1}).`;
}

function area(_id, src_cells) {
  /** Generates facts for areas. */
  return src_cells.map(([r, c]) => `area(${_id}, ${r}, ${c}).`).join("\n");
}

function shade_c(color = "black") {
  /**
   * Generate a rule that a cell is either {color} or not {color}.
   * A grid fact should be defined first.
   */
  return `{ ${color}(R, C) } :- grid(R, C).`;
}

function shade_cc(colors) {
  /**
   * Generates a rule that enforces several different {color} cells.
   * A grid fact should be defined first.
   */
  return `{ ${colors.map((c) => `${c}(R, C)`).join("; ")} } = 1 :- grid(R, C).`;
}

function invert_c(color = "black", invert = "white") {
  /** Generates a rule for inverting colors. */
  return `${invert}(R, C) :- grid(R, C), not ${color}(R, C).`;
}

function edge(rows, cols) {
  /**
   * Generates facts for grid edges.
   * Note grid borders are set outside.
   */
  let fact = `vertical_range(0..${rows - 1}, 0..${cols}).\n`;
  fact += `horizontal_range(0..${rows}, 0..${cols - 1}).\n`;
  fact += `{ edge_left(R, C) } :- vertical_range(R, C).\n`;
  fact += `{ edge_top(R, C) } :- horizontal_range(R, C).\n`;
  fact += `edge_left(0..${rows - 1}, 0).\n`;
  fact += `edge_left(0..${rows - 1}, ${cols}).\n`;
  fact += `edge_top(0, 0..${cols - 1}).\n`;
  fact += `edge_top(${rows}, 0..${cols - 1}).`;
  return fact;
}

function direction(directions) {
  /** Generates facts for directions. */
  const formatted_dirs = Array.isArray(directions) ? directions : [directions];
  return `direction(${formatted_dirs.map((d) => `"${d}"`).join("; ")}).`;
}

function fill_path(color = "black", directed = false) {
  /**
   * Generate a rule that a cell is on a path.
   * A grid fact and a direction fact should be defined first.
   */
  if (directed) {
    let rule = `{ grid_in(R, C, D): direction(D) } <= 1 :- grid(R, C), ${color}(R, C).\n`;
    rule += `{ grid_out(R, C, D): direction(D) } <= 1 :- grid(R, C), ${color}(R, C).`;
    return rule;
  }
  return `{ grid_direction(R, C, D): direction(D) } :- grid(R, C), ${color}(R, C).`;
}

function fill_num(_range, _type = "grid", _id = "A", color = null) {
  /**
   * Generate a rule that a cell numbered within {_range}.
   * {_range} should have the format "low..high", or "x;y;z" for a list of numbers.
   * A grid fact or an area fact should be defined first.
   */
  const color_part = color ? `; ${color}(R, C)` : "";
  _range = Array.from(new Set(_range)).sort((a, b) => a - b); // canonicize the range
  let i = 0,
    range_seq = [];

  while (i < _range.length) {
    let start = i;
    while (i < _range.length - 1 && _range[i + 1] - _range[i] === 1) {
      i++;
    }
    let end = i;
    if (start < end) {
      range_seq.push(`${_range[start]}..${_range[end]}`);
    } else {
      range_seq.push(`${_range[start]}`);
    }
    i++;
  }

  const range_str = range_seq.join(";");

  if (_type === "grid") {
    return `{ number(R, C, (${range_str}))${color_part} } = 1 :- grid(R, C).`;
  }

  if (_type === "area") {
    return `{ number(R, C, (${range_str}))${color_part} } = 1 :- area(${_id}, R, C).`;
  }

  throw new Error("Invalid type, must be one of 'grid', 'area'.");
}

function unique_num(color = "black", _type = "row") {
  /**
   * Generates a constraint for unique {color} numbered cells in a(an) row / column / area.
   * {color} can be set to "grid" for wildcard colors.
   * A number rule should be defined first.
   */
  if (_type === "row") {
    return `:- grid(_, C), number(_, _, N), { ${color}(R, C) : number(R, C, N) } > 1.`;
  }

  if (_type === "col") {
    return `:- grid(R, _), number(_, _, N), { ${color}(R, C) : number(R, C, N) } > 1.`;
  }

  if (_type === "area") {
    return `:- area(A, _, _), number(_, _, N), { ${color}(R, C) : area(A, R, C), number(R, C, N) } > 1.`;
  }

  throw new Error("Invalid type, must be one of 'row', 'col', 'area'.");
}

function count(target, color = "black", _type = "grid", _id = null) {
  /**
   * Generates a constraint for counting the number of {color} cells in a grid / row / column / area.
   * A grid fact should be defined first.
   */
  const [rop, num] = target_encode(target);

  if (_id === null) {
    _id = _type === "row" ? "R" : _type === "col" ? "C" : null;
  }

  if (_type === "grid") {
    return `:- #count { grid(R, C) : ${color}(R, C) } ${rop} ${num}.`;
  }

  if (_type === "row") {
    return `:- grid(${_id}, _), #count { C : ${color}(${_id}, C) } ${rop} ${num}.`;
  }

  if (_type === "col") {
    return `:- grid(_, ${_id}), #count { R : ${color}(R, ${_id}) } ${rop} ${num}.`;
  }

  if (_type === "area") {
    return `:- #count { R, C : area(${_id}, R, C), ${color}(R, C) } ${rop} ${num}.`;
  }

  throw new Error("Invalid type, must be one of 'grid', 'row', 'col', 'area'.");
}
