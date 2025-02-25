/** Variety rules and constraints which are not catagorized in other files. */

function nori_adjacent(color = "black", adj_type = 4) {
  /**
   * Generates a constraint for Norinori puzzles.
   * A grid rule and an adjacent rule should be defined first.
   */
  return `:- grid(R, C), ${color}(R, C), #count { R1, C1: ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1) } != 1.`;
}

function yaji_count(target, src_cell, arrow_direction, color = "black", unshade_clue = true) {
  /**
   * Generates a constraint for counting the number of {color} cells in a row / col.
   * A grid fact should be defined first.
   */
  const [src_r, src_c] = src_cell;
  const op = [0, 1].includes(arrow_direction) ? "<" : ">";

  const shade_clue = unshade_clue ? "" : ` not ${color}(${src_r}, ${src_c}),`;

  if ([1, 2].includes(arrow_direction)) {
    // left, right
    return `:-${shade_clue} #count { C1 : ${color}(${src_r}, C1), C1 ${op} ${src_c} } != ${target}.`;
  }

  if ([0, 3].includes(arrow_direction)) {
    // up, down
    return `:-${shade_clue} #count { R1 : ${color}(R1, ${src_c}), R1 ${op} ${src_r} } != ${target}.`;
  }

  throw new Error("Invalid direction.");
}
