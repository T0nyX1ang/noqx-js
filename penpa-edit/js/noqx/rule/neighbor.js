/** Utility for neighbor-relevant (primary to connected) rules. */

function adjacent(_type = 4, includeSelf = false) {
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
  let rule = includeSelf ? `adj_${_type}(R, C, R, C) :- grid(R, C).\n` : "";

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
      "adj_edge(R, C, R, C + 1) :- grid(R, C), grid(R, C + 1), !edge_left(R, C + 1).\n";
    rule +=
      "adj_edge(R, C, R + 1, C) :- grid(R, C), grid(R + 1, C), !edge_top(R + 1, C).\n";
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

function avoidAdjacentColor(color = "black", adjType = 4) {
  /**
   * Generates a constraint to avoid adjacent {color} cells based on adjacent definition.
   *
   * An adjacent rule should be defined first.
   */
  return `:- ${color}(R, C), ${color}(R1, C1), adj_${adjType}(R, C, R1, C1).`;
}

function areaAdjacent(adjType = 4, color = null) {
  /**
   * Generate a rule for getting the adjacent areas.
   *
   * An adjacent rule should be defined first.
   */
  let areaAdj = `area(A, R, C), area(A1, R1, C1), adj_${adjType}(R, C, R1, C1), A < A1`;
  if (color) {
    areaAdj += `, ${color}(R, C), ${color}(R1, C1)`;
  }

  return `${tagEncode("area_adj", adjType, color)}(A, A1) :- ${areaAdj}.`;
}

function countAdjacent(target, srcCell, color = "black", adjType = 4) {
  /**
   * Generates a constraint for counting the number of {color} cells adjacent to a cell.
   *
   * An adjacent rule should be defined first.
   */
  const [srcR, srcC] = srcCell;
  const [rop, num] = targetEncode(target);
  return `:- #count { R, C: ${color}(R, C), adj_${adjType}(R, C, ${srcR}, ${srcC}) } ${rop} ${num}.`;
}

function countAdjacentEdges(target, srcCell) {
  /**
   * Return a rule that counts the adjacent lines around a cell.
   *
   * An edge rule should be defined first.
   */
  const [srcR, srcC] = srcCell;
  const [rop, num] = targetEncode(target);
  const v1 = `edge_left(${srcR}, ${srcC})`;
  const v2 = `edge_left(${srcR}, ${srcC + 1})`;
  const h1 = `edge_top(${srcR}, ${srcC})`;
  const h2 = `edge_top(${srcR + 1}, ${srcC})`;
  return `:- { ${v1}; ${v2}; ${h1}; ${h2} } ${rop} ${num}.`;
}

function avoidNumAdjacent(adjType = 4) {
  /**
   * Generate a constraint to avoid adjacent cells with the same number.
   *
   * An adjacent rule should be defined first.
   */
  return `:- number(R, C, N), number(R1, C1, N), adj_${adjType}(R, C, R1, C1).`;
}

function areaSameColor(color = "black") {
  /** Ensure that all cells in the same area have the same color. */
  return `:- area(A, R, C), area(A, R1, C1), ${color}(R, C), !${color}(R1, C1).`;
}

function areaBorder(_id, srcCells, edge) {
  /** Generates a fact for the border of an area. */
  const edges = new Set();
  for (const [r, c] of srcCells) {
    if (edge.get(new Point(r, c, BaseDir.TOP)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "u").`);
      if (srcCells.has([r - 1, c])) {
        edges.add(`area_border(${_id}, ${r - 1}, ${c}, "d").`);
      }
    }

    if (edge.get(new Point(r + 1, c, BaseDir.TOP)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "d").`);
      if (srcCells.has([r + 1, c])) {
        edges.add(`area_border(${_id}, ${r + 1}, ${c}, "u").`);
      }
    }

    if (edge.get(new Point(r, c, BaseDir.LEFT)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "l").`);
      if (srcCells.has([r, c - 1])) {
        edges.add(`area_border(${_id}, ${r}, ${c - 1}, "r").`);
      }
    }

    if (edge.get(new Point(r, c + 1, BaseDir.LEFT)) === true) {
      edges.add(`area_border(${_id}, ${r}, ${c}, "r").`);
      if (srcCells.has([r, c + 1])) {
        edges.add(`area_border(${_id}, ${r}, ${c + 1}, "l").`);
      }
    }
  }

  return Array.from(edges).join("\n");
}
