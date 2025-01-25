/** Utility for reachable things and connectivity tests. */

function grid_color_connected(color = "black", adj_type = 4, grid_size = null) {
  validate_type(adj_type, [4, 8, "x", "loop", "loop_directed"]);
  const tag = tag_encode("reachable", "grid", "adj", adj_type, color);

  let initial;
  if (grid_size === null) {
    initial = `${tag}(R, C) :- (R, C) = #min{ (R1, C1): grid(R1, C1), ${color}(R1, C1) }.`;
  } else {
    const [R, C] = grid_size;
    initial = `${tag}(R, C) :- (_, R, C) = #min{ (|R1 - ${Math.floor(R / 2)}| + |C1 - ${Math.floor(
      C / 2
    )}|, R1, C1): grid(R1, C1), ${color}(R1, C1) }.`;
  }

  const propagation = `${tag}(R, C) :- ${tag}(R1, C1), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  const constraint = `:- grid(R, C), ${color}(R, C), not ${tag}(R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function border_color_connected(rows, cols, color = "black", adj_type = 4) {
  validate_type(adj_type, [4, 8, "x"]);
  const tag = tag_encode("reachable", "border", "adj", adj_type, color);
  const borders = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        borders.push([r, c]);
      }
    }
  }
  const initial = borders.map(([r, c]) => `${tag}(${r}, ${c}) :- ${color}(${r}, ${c}).`).join("\n");
  const propagation = `${tag}(R, C) :- ${tag}(R1, C1), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  const constraint = `:- grid(R, C), ${color}(R, C), not ${tag}(R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function area_color_connected(color = "black", adj_type = 4) {
  validate_type(adj_type, [4, 8, "x"]);
  const tag = tag_encode("reachable", "area", "adj", adj_type, color);
  const initial = `${tag}(A, R, C) :- area(A, _, _), (R, C) = #min{ (R1, C1): area(A, R1, C1), ${color}(R1, C1) }.`;
  const propagation = `${tag}(A, R, C) :- ${tag}(A, R1, C1), area(A, R, C), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  const constraint = `:- area(A, R, C), ${color}(R, C), not ${tag}(A, R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function grid_src_color_connected(src_cell, include_cells = null, exclude_cells = null, color = "black", adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
  } else {
    validate_type(adj_type, [4, 8, "x", "edge", "loop", "loop_directed"]);
  }

  const tag = tag_encode("reachable", "grid", "src", "adj", adj_type, color);
  const [r, c] = src_cell;
  let initial = `${tag}(${r}, ${c}, ${r}, ${c}).`;

  if (include_cells) {
    initial += "\n" + include_cells.map(([inc_r, inc_c]) => `${tag}(${r}, ${c}, ${inc_r}, ${inc_c}).`).join("\n");
  }

  if (exclude_cells) {
    initial += "\n" + exclude_cells.map(([exc_r, exc_c]) => `not ${tag}(${r}, ${c}, ${exc_r}, ${exc_c}).`).join("\n");
  }

  if (adj_type === "edge") {
    const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), grid(R, C), adj_edge(R, C, R1, C1).`;
    const constraint = `:- ${tag}(${r}, ${c}, R, C), ${tag}(${r}, ${c}, R, C + 1), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(${r}, ${c}, R, C), ${tag}(${r}, ${c}, R + 1, C), edge_top(R + 1, C).`;
    return `${initial}\n${propagation}\n${constraint}`;
  }

  const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), grid(R, C), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  return `${initial}\n${propagation}`;
}

function bulb_src_color_connected(src_cell, color = "black", adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
  } else {
    validate_type(adj_type, [4, "edge"]);
  }

  const tag = tag_encode("reachable", "bulb", "src", "adj", adj_type, color);
  const [r, c] = src_cell;
  const initial = `${tag}(${r}, ${c}, ${r}, ${c}).`;

  let bulb_constraint = "";
  if (adj_type === 4) {
    bulb_constraint = `${color}(R, C), adj_${adj_type}(R, C, R1, C1), (R - ${r}) * (C - ${c}) == 0`;
  }

  if (adj_type === "edge") {
    bulb_constraint = `adj_${adj_type}(R, C, R1, C1), (R - ${r}) * (C - ${c}) == 0`;
  }

  const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), ${bulb_constraint}.`;
  return `${initial}\n${propagation}`;
}

function count_reachable_src(target, src_cell, main_type = "grid", color = "black", adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
  } else if (main_type === "grid") {
    validate_type(adj_type, [4, 8, "x", "edge", "loop", "loop_directed"]);
  } else if (main_type === "bulb") {
    validate_type(adj_type, [4]);
  } else {
    throw new Error("Invalid main type, must be one of 'grid', 'bulb'.");
  }

  const [srcR, srcC] = src_cell;
  const tag = tag_encode("reachable", main_type, "src", "adj", adj_type, color);
  const [rop, num] = target_encode(target);

  return `:- { ${tag}(${srcR}, ${srcC}, R, C) } ${rop} ${num}.`;
}

function count_rect_src(target, src_cell, color = null, adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
  }

  const tag = tag_encode("reachable", "bulb", "src", "adj", adj_type, color);
  const [rop, num] = target_encode(target);
  const [srcR, srcC] = src_cell;
  const countR = `#count { R: ${tag}(${srcR}, ${srcC}, R, C) } = CR`;
  const countC = `#count { C: ${tag}(${srcR}, ${srcC}, R, C) } = CC`;

  return `:- ${countR}, ${countC}, CR * CC ${rop} ${num}.`;
}

function avoid_unknown_src(color = "black", adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
    const tag = tag_encode("reachable", "grid", "src", "adj", adj_type);
    return `:- grid(R, C), not ${tag}(_, _, R, C).`;
  }

  validate_type(adj_type, [4, 8, "loop", "loop_directed"]);
  const tag = tag_encode("reachable", "grid", "src", "adj", adj_type, color);

  return `:- grid(R, C), ${color}(R, C), not ${tag}(_, _, R, C).`;
}

function clue_bit(r, c, id, nbit) {
  let rule = `clue(${r}, ${c}).\n`;
  for (let i = 0; i < nbit; i++) {
    if ((id >> i) & 1) {
      rule += `clue_bit(${r}, ${c}, ${i}).\n`;
    }
  }
  return rule.trim();
}

function num_binary_range(num) {
  const nbit = Math.floor(Math.log2(num)) + 1;
  const rule = `bit_range(0..${nbit - 1}).\n`;
  return [rule.trim(), nbit];
}

function grid_bit_color_connected(color = "black", adj_type = "loop") {
  validate_type(adj_type, [4, 8, "x", "loop", "loop_directed"]);

  const tag = tag_encode("reachable", "grid", "bit", "adj", adj_type);
  let rule = `{ ${tag}(R, C, B) } :- grid(R, C), ${color}(R, C), bit_range(B).\n`;
  rule += `${tag}(R, C, B) :- clue_bit(R, C, B).\n`;
  rule += `not ${tag}(R, C, B) :- grid(R, C), ${color}(R, C), bit_range(B), clue(R, C), not clue_bit(R, C, B).\n`;
  rule += `${tag}(R, C, B) :- ${tag}(R1, C1, B), grid(R, C), bit_range(B), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).\n`;
  rule += `not ${tag}(R, C, B) :- not ${tag}(R1, C1, B), grid(R, C), grid(R1, C1), bit_range(B), ${color}(R, C), ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1).\n`;
  return rule.trim();
}

function avoid_unknown_src_bit(color = "black", adj_type = 4) {
  const tag = tag_encode("reachable", "grid", "bit", "adj", adj_type);
  return `:- grid(R, C), ${color}(R, C), not ${tag}(R, C, _).`;
}

function grid_branch_color_connected(color = "black", adj_type = 4) {
  if (color === null) {
    validate_type(adj_type, ["edge"]);
  } else {
    validate_type(adj_type, [4, 8, "x", "edge"]);
  }

  const tag = tag_encode("reachable", "grid", "branch", "adj", adj_type, color);

  if (adj_type === "edge") {
    const initial = `${tag}(R, C, R, C) :- grid(R, C).`;
    const propagation = `${tag}(R0, C0, R, C) :- ${tag}(R0, C0, R1, C1), grid(R, C), adj_edge(R, C, R1, C1).`;
    const constraint = `:- ${tag}(R, C, R, C + 1), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(R, C, R + 1, C), edge_top(R + 1, C).\n`;
    constraint += `:- ${tag}(R, C + 1, R, C), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(R + 1, C, R, C), edge_top(R + 1, C).`;
    return `${initial}\n${propagation}\n${constraint}`;
  }

  const initial = `${tag}(R, C, R, C) :- grid(R, C), ${color}(R, C).`;
  const propagation = `${tag}(R0, C0, R, C) :- ${tag}(R0, C0, R1, C1), grid(R, C), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  return `${initial}\n${propagation}`;
}
