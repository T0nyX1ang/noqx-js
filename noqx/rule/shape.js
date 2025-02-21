/** Rules and constraints to detect certain shapes. */

const OMINOES = {
  1: {
    ".": [[0, 0]],
  },
  2: {
    I: [
      [0, 0],
      [1, 0],
    ],
  },
  3: {
    I: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    L: [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
  },
  4: {
    T: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
    O: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    I: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    L: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    S: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  },
  5: {
    F: [
      [0, 0],
      [0, 1],
      [1, -1],
      [1, 0],
      [2, 0],
    ],
    I: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    L: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 1],
    ],
    N: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
    P: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
    T: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
      [2, 1],
    ],
    U: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    V: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    W: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    X: [
      [0, 0],
      [1, -1],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
    Y: [
      [0, 0],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    Z: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  },
};

function get_neighbor(r, c, type = 4) {
  const shape_4 = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
  const shape_x = [
    [r - 1, c - 1],
    [r - 1, c + 1],
    [r + 1, c - 1],
    [r + 1, c + 1],
  ];

  if (type === 4) return shape_4;
  if (type === "x") return shape_x;
  if (type === 8) return shape_4.concat(shape_x);

  throw new Error("invalid_type, must be one of 4, 8, 'x'.");
}

function canonicalize_shape(shape) {
  shape.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
  });
  const [root_r, root_c] = shape[0];
  const dr = -root_r;
  const dc = -root_c;
  return shape.map(([r, c]) => [r + dr, c + dc]);
}

function get_variants(shape, allow_rotations, allow_reflections) {
  const functions = new Set();
  if (allow_rotations) functions.add((shape) => canonicalize_shape(shape.map(([r, c]) => [-c, r])));
  if (allow_reflections) functions.add((shape) => canonicalize_shape(shape.map(([r, c]) => [-r, c])));

  const result = new Set();
  const result_str = new Set();
  const initial_shape = canonicalize_shape(shape);
  result.add(initial_shape);
  result_str.add(initial_shape.toString()); // result_str as a shadow set for result

  let all_shapes_covered = false;
  while (!all_shapes_covered) {
    const new_shapes = new Set();
    const new_shapes_str = new Set(); // new_shapes_str as a shadow set for new_shapes

    const current_num_shapes = result_str.size;
    for (const f of functions) {
      for (const s of result) {
        const new_shape = f(s);
        if (!new_shapes_str.has(new_shape.toString())) {
          new_shapes.add(new_shape);
          new_shapes_str.add(new_shape.toString());
        }
      }
    }

    // manual union of string sets
    for (const s of new_shapes) {
      if (!result_str.has(s.toString())) {
        result_str.add(s.toString());
        result.add(s);
      }
    }

    all_shapes_covered = current_num_shapes === result_str.size;
  }
  return result;
}

function general_shape(name, id = 0, deltas = null, color = "black", type = "grid", adj_type = 4, simple = false) {
  validate_type(type, ["grid", "area"]);
  if (!deltas) throw new Error("Shape coordinates must be provided.");

  const tag = tag_encode("shape", name, color);
  const tag_be = tag_encode("belong_to_shape", name, color);
  const neighbor_type = [4, 8, "x"].includes(adj_type) ? adj_type : 4;
  let data = "";

  const variants = get_variants(deltas, true, true);
  for (const [i, variant] of Array.from(variants).entries()) {
    const valid = new Set();
    const belongs_to = new Set();
    for (const [dr, dc] of variant) {
      if (type === "grid") {
        valid.add(`grid(R + ${dr}, C + ${dc})`);
        valid.add(`${color}(R + ${dr}, C + ${dc})`);
        belongs_to.add(
          `${tag_be}(R + ${dr}, C + ${dc}, ${id}, ${i}) :- grid(R + ${dr}, C + ${dc}), ${tag}(R, C, ${id}, ${i}).`
        );
      }
      if (type === "area") {
        valid.add(`area(A, R + ${dr}, C + ${dc})`);
        valid.add(`${color}(R + ${dr}, C + ${dc})`);
        belongs_to.add(
          `${tag_be}(A, R + ${dr}, C + ${dc}, ${id}, ${i}) :- area(A, R + ${dr}, C + ${dc}), ${tag}(A, R, C, ${id}, ${i}).`
        );
      }
      for (const [nr, nc] of get_neighbor(dr, dc, neighbor_type)) {
        if (variant.some(([vr, vc]) => vr === nr && vc === nc)) {
          if (![4, 8, "x"].includes(adj_type) && (dr < nr || (dr === nr && dc < nc))) {
            valid.add(`adj_${adj_type}(R + ${dr}, C + ${dc}, R + ${nr}, C + ${nc})`);
            valid.add(`${color}(R + ${nr}, C + ${nc})`);
          }
        } else if (!simple) {
          if (color === "grid") {
            valid.add(`not adj_${adj_type}(R + ${dr}, C + ${dc}, R + ${nr}, C + ${nc})`);
          } else {
            valid.add(
              `{ not adj_${adj_type}(R + ${dr}, C + ${dc}, R + ${nr}, C + ${nc}); not ${color}(R + ${nr}, C + ${nc}) } > 0`
            );
          }
        }
      }
    }
    if (type === "grid") {
      data += `${tag}(R, C, ${id}, ${i}) :- grid(R, C), ${[...valid].join(", ")}.\n${[...belongs_to].join("\n")}\n`;
    }
    if (type === "area") {
      data += `${tag}(A, R, C, ${id}, ${i}) :- area(A, R, C), ${[...valid].join(", ")}.\n${[...belongs_to].join(
        "\n"
      )}\n`;
    }
  }

  return data.trim();
}

function all_shapes(name, color = "black", type = "grid") {
  validate_type(type, ["grid", "area"]);
  const tag = tag_encode("belong_to_shape", name, color);

  if (type === "grid") {
    return `:- grid(R, C), ${color}(R, C), not ${tag}(R, C, _, _).`;
  }
  if (type === "area") {
    return `:- area(A, R, C), ${color}(R, C), not ${tag}(A, R, C, _, _).`;
  }
}

function count_shape(target, name, id = null, color = "black", type = "grid") {
  validate_type(type, ["grid", "area"]);
  const tag = tag_encode("shape", name, color);
  const [rop, num] = target_encode(target);
  id = id === null ? "_" : id;

  if (type === "grid") {
    return `:- { ${tag}(R, C, ${id}, _) } ${rop} ${num}.`;
  }
  if (type === "area") {
    return `:- area(A, _, _), { ${tag}(A, R, C, _, ${id}) } ${rop} ${num}.`;
  }
}

function all_rect(color = "black", square = false) {
  if (color.startsWith("not")) {
    throw new Error("unsupported_color_prefix 'not', please define the color explicitly.");
  }

  const upleft = `upleft(R, C) :- grid(R, C), ${color}(R, C), not ${color}(R - 1, C), not ${color}(R, C - 1).\n`;
  let left = `left(R, C) :- grid(R, C), ${color}(R, C), upleft(R - 1, C), ${color}(R - 1, C), not ${color}(R, C - 1).\n`;
  left += `left(R, C) :- grid(R, C), ${color}(R, C), left(R - 1, C), ${color}(R - 1, C), not ${color}(R, C - 1).\n`;
  let up = `up(R, C) :- grid(R, C), ${color}(R, C), upleft(R, C - 1), ${color}(R, C - 1), not ${color}(R - 1, C).\n`;
  up += `up(R, C) :- grid(R, C), ${color}(R, C), up(R, C - 1), ${color}(R, C - 1), not ${color}(R - 1, C).\n`;
  let remain = `remain(R, C) :- grid(R, C), left(R, C - 1), up(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), left(R, C - 1), remain(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), remain(R, C - 1), up(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), remain(R, C - 1), remain(R - 1, C).\n`;

  let constraint = `:- grid(R, C), ${color}(R, C), not upleft(R, C), not left(R, C), not up(R, C), not remain(R, C).\n`;
  constraint += `:- grid(R, C), remain(R, C), not ${color}(R, C).\n`;

  if (square) {
    const c_min = `#min { C0: grid(R, C0 - 1), not ${color}(R, C0), C0 > C }`;
    const r_min = `#min { R0: grid(R0 - 1, C), not ${color}(R0, C), R0 > R }`;
    constraint += `:- upleft(R, C), MR = ${r_min}, MC = ${c_min}, MR - R != MC - C.\n`;
    constraint += `:- upleft(R, C), left(R + 1, C), not up(R, C + 1).\n`;
    constraint += `:- upleft(R, C), not left(R + 1, C), up(R, C + 1).\n`;
  }

  return (upleft + left + up + remain + constraint).trim();
}

function all_rect_region(square = false) {
  const upleft = `upleft(R, C) :- grid(R, C), edge_left(R, C), edge_top(R, C).\n`;
  let left = `left(R, C) :- grid(R, C), upleft(R - 1, C), edge_left(R, C), not edge_top(R, C).\n`;
  left += `left(R, C) :- grid(R, C), left(R - 1, C), edge_left(R, C), not edge_top(R, C).\n`;
  let up = `up(R, C) :- grid(R, C), upleft(R, C - 1), edge_top(R, C), not edge_left(R, C).\n`;
  up += `up(R, C) :- grid(R, C), up(R, C - 1), edge_top(R, C), not edge_left(R, C).\n`;
  let remain = `remain(R, C) :- grid(R, C), left(R, C - 1), up(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), left(R, C - 1), remain(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), remain(R, C - 1), up(R - 1, C).\n`;
  remain += `remain(R, C) :- grid(R, C), remain(R, C - 1), remain(R - 1, C).\n`;

  let constraint = `:- grid(R, C), { upleft(R, C); left(R, C); up(R, C); remain(R, C) } != 1.\n`;
  constraint += `:- grid(R, C), remain(R, C), left(R, C + 1), not edge_left(R, C + 1).\n`;
  constraint += `:- grid(R, C), remain(R, C), up(R + 1, C), not edge_top(R + 1, C).\n`;
  constraint += `:- grid(R, C), remain(R, C), upleft(R, C + 1), not edge_left(R, C + 1).\n`;
  constraint += `:- grid(R, C), remain(R, C), upleft(R + 1, C), not edge_top(R + 1, C).\n`;

  if (square) {
    const c_min = `#min { C0: grid(R, C0 - 1), edge_left(R, C0), C0 > C }`;
    const r_min = `#min { R0: grid(R0 - 1, C), edge_top(R0, C), R0 > R }`;
    constraint += `:- upleft(R, C), MR = ${r_min}, MC = ${c_min}, MR - R != MC - C.\n`;
  }

  const rect = `:- grid(R, C), left(R, C), remain(R, C + 1), edge_left(R, C + 1).\n`;
  rect += `:- grid(R, C), remain(R, C), remain(R, C + 1), edge_left(R, C + 1).\n`;
  rect += `:- grid(R, C), up(R, C), remain(R + 1, C), edge_top(R + 1, C).\n`;
  rect += `:- grid(R, C), remain(R, C), remain(R + 1, C), edge_top(R + 1, C).`;

  return upleft + left + up + remain + constraint + rect;
}

function avoid_rect(rect_r, rect_c, color = "black", corner = [null, null]) {
  let [corner_r, corner_c] = corner;
  corner_r = corner_r !== null ? corner_r : "R";
  corner_c = corner_c !== null ? corner_c : "C";

  let rect_pattern;
  if (corner_r !== "R" && corner_c !== "C") {
    rect_pattern = Array.from({ length: rect_r }, (_, r) =>
      Array.from({ length: rect_c }, (_, c) => `${color}(${corner_r + r}, ${corner_c + c})`)
    ).flat();
  } else {
    rect_pattern = Array.from({ length: rect_r }, (_, r) =>
      Array.from({ length: rect_c }, (_, c) => `${color}(${corner_r} + ${r}, ${corner_c} + ${c})`)
    ).flat();
    rect_pattern.push(`grid(${corner_r}, ${corner_c})`);
    rect_pattern.push(`grid(${corner_r} + ${rect_r - 1}, ${corner_c} + ${rect_c - 1})`);
  }

  return `:- ${rect_pattern.join(", ")}.`;
}

function no_rect(color = "black") {
  /**
   * Generate a constraint to avoid all-shaped rectangles.
   *
   * A grid rule should be defined first.
   */
  const tag = tag_encode("reachable", "Lshape", "adj", 4, color);

  const mutual = "grid(R, C), grid(R + 1, C + 1)";
  let initial = `${tag}(R, C) :- ${mutual}, ${color}(R, C), ${color}(R, C + 1), ${color}(R + 1, C), not ${color}(R + 1, C + 1).\n`;
  initial += `${tag}(R, C) :- ${mutual}, ${color}(R, C), ${color}(R, C + 1), ${color}(R + 1, C + 1), not ${color}(R + 1, C).\n`;
  initial += `${tag}(R, C) :- ${mutual}, ${color}(R, C), ${color}(R + 1, C), ${color}(R + 1, C + 1), not ${color}(R, C + 1).\n`;
  initial += `${tag}(R + 1, C + 1) :- ${mutual}, not ${color}(R, C), ${color}(R, C + 1), ${color}(R + 1, C), ${color}(R + 1, C + 1).\n`;

  const propagation = `${tag}(R, C) :- ${tag}(R1, C1), ${color}(R, C), adj_4(R, C, R1, C1).\n`;
  const constraint = `:- grid(R, C), ${color}(R, C), not ${tag}(R, C).`;

  return initial + propagation + constraint;
}

function avoid_region_border_crossover() {
  /**
   * Avoid the crossover of the region border.
   */
  const no_rect_adjacent_by_point = [
    "edge_left(R, C + 1)",
    "edge_left(R + 1, C + 1)",
    "edge_top(R + 1, C)",
    "edge_top(R + 1, C + 1)",
  ];
  return `:- grid(R, C), ${no_rect_adjacent_by_point.join(", ")}.`;
}
