/** Utility for neighbor-relevant (primary to connected) rules. */

function adjacent(_type = 4, include_self = false) {
  /**
   * Generates a rule for getting the adjacent neighbors.
   * If _type = 4, then only orthogonal neighbors are considered.
   * If _type = x, then only diagonal neighbors are considered.
   * If _type = 8, then both orthogonal and diagonal neighbors are considered.
   * If _type = edge, then only the neighbors on unblocked edges are considered.
   * If _type = loop, then only the neighbors on the loop are considered.
   * If _type = loop_directed, then only the neighbors on the directed loop are considered.
   *
   * A grid fact should be defined first.
   */
  let rule = include_self ? `adj_${_type}(R, C, R, C) :- grid(R, C).\n` : "";

  if (_type === 4) {
    rule +=
      "adj_4(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| + |C - C1| == 1.";
    return rule;
  }

  if (_type === "x") {
    rule +=
      "adj_x(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| = 1, |C - C1| == 1.";
    return rule;
  }

  if (_type === 8) {
    rule +=
      "adj_8(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| + |C - C1| == 1.\n";
    rule +=
      "adj_8(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| = 1, |C - C1| == 1.";
    return rule;
  }

  if (_type === "edge") {
    rule +=
      "adj_edge(R, C, R, C + 1) :- grid(R, C), grid(R, C + 1), not edge_left(R, C + 1).\n";
    rule +=
      "adj_edge(R, C, R + 1, C) :- grid(R, C), grid(R + 1, C), not edge_top(R + 1, C).\n";
    rule += "adj_edge(R, C, R1, C1) :- adj_edge(R1, C1, R, C).";
    return rule;
  }

  if (_type === "loop") {
    rule +=
      'adj_loop(R0, C0, R, C) :- R = R0, C = C0 + 1, grid(R, C), grid(R0, C0), grid_direction(R, C, "l").\n';
    rule +=
      'adj_loop(R0, C0, R, C) :- R = R0 + 1, C = C0, grid(R, C), grid(R0, C0), grid_direction(R, C, "u").\n';
    rule += "adj_loop(R0, C0, R, C) :- adj_loop(R, C, R0, C0).";
    return rule;
  }

  if (_type === "loop_directed") {
    rule +=
      'adj_loop_directed(R0, C0, R, C) :- R = R0, C = C0 + 1, grid(R, C), grid(R0, C0), grid_in(R, C, "l").\n';
    rule +=
      'adj_loop_directed(R0, C0, R, C) :- R = R0 + 1, C = C0, grid(R, C), grid(R0, C0), grid_in(R, C, "u").\n';
    rule +=
      'adj_loop_directed(R0, C0, R, C) :- R = R0, C = C0 + 1, grid(R, C), grid(R0, C0), grid_out(R, C, "l").\n';
    rule +=
      'adj_loop_directed(R0, C0, R, C) :- R = R0 + 1, C = C0, grid(R, C), grid(R0, C0), grid_out(R, C, "u").\n';
    rule +=
      "adj_loop_directed(R0, C0, R, C) :- adj_loop_directed(R, C, R0, C0).";
    return rule;
  }

  throw new Error(`Invalid adjacent type: ${_type}.`);
}

function avoid_adjacent_color(color = "black", adj_type = 4) {
  /**
   * Generates a constraint to avoid adjacent {color} cells based on adjacent definition.
   *
   * An adjacent rule should be defined first.
   */
  return `:- ${color}(R, C), ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1).`;
}

function area_adjacent(adj_type = 4, color = null) {
  /**
   * Generate a rule for getting the adjacent areas.
   *
   * An adjacent rule should be defined first.
   */
  let area_adj = `area(A, R, C), area(A1, R1, C1), adj_${adj_type}(R, C, R1, C1), A < A1`;
  if (color) {
    area_adj += `, ${color}(R, C), ${color}(R1, C1)`;
  }

  return `${tag_encode("area_adj", adj_type, color)}(A, A1) :- ${area_adj}.`;
}

function count_adjacent(target, src_cell, color = "black", adj_type = 4) {
  /**
   * Generates a constraint for counting the number of {color} cells adjacent to a cell.
   *
   * An adjacent rule should be defined first.
   */
  const [src_r, src_c] = src_cell;
  const [rop, num] = target_encode(target);
  return `:- #count { R, C: ${color}(R, C), adj_${adj_type}(R, C, ${src_r}, ${src_c}) } ${rop} ${num}.`;
}

function count_adjacent_edges(target, src_cell) {
  /**
   * Return a rule that counts the adjacent lines around a cell.
   *
   * An edge rule should be defined first.
   */
  const [src_r, src_c] = src_cell;
  const [rop, num] = target_encode(target);
  const v1 = `edge_left(${src_r}, ${src_c})`;
  const v2 = `edge_left(${src_r}, ${src_c + 1})`;
  const h1 = `edge_top(${src_r}, ${src_c})`;
  const h2 = `edge_top(${src_r + 1}, ${src_c})`;
  return `:- { ${v1}; ${v2}; ${h1}; ${h2} } ${rop} ${num}.`;
}

function avoid_num_adjacent(adj_type = 4) {
  /**
   * Generate a constraint to avoid adjacent cells with the same number.
   *
   * An adjacent rule should be defined first.
   */
  return `:- number(R, C, N), number(R1, C1, N), adj_${adj_type}(R, C, R1, C1).`;
}

function area_same_color(color = "black") {
  /** Ensure that all cells in the same area have the same color. */
  return `:- area(A, R, C), area(A, R1, C1), ${color}(R, C), not ${color}(R1, C1).`;
}

function area_border(_id, src_cells, edge) {
  /** Generates a fact for the border of an area. */
  const edges = new Set();
  for (const [r, c] of src_cells) {
    if (edge.get(new Point(r, c, BaseDir.TOP)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "u").`);
      if (src_cells.has([r - 1, c])) {
        edges.add(`area_border(${_id}, ${r - 1}, ${c}, "d").`);
      }
    }

    if (edge.get(new Point(r + 1, c, BaseDir.TOP)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "d").`);
      if (src_cells.has([r + 1, c])) {
        edges.add(`area_border(${_id}, ${r + 1}, ${c}, "u").`);
      }
    }

    if (edge.get(new Point(r, c, BaseDir.LEFT)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "l").`);
      if (src_cells.has([r, c - 1])) {
        edges.add(`area_border(${_id}, ${r}, ${c - 1}, "r").`);
      }
    }

    if (edge.get(new Point(r, c + 1, BaseDir.LEFT)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c + 1}, "r").`);
      if (src_cells.has([r, c + 1])) {
        edges.add(`area_border(${_id}, ${r}, ${c + 1}, "l").`);
      }
    }
  }

  return Array.from(edges).join("\n");
}
