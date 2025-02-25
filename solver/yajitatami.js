/** The Yajitatami solver. */

function yaji_region_count(target, src_cell, arrow_direction) {
  /**
   * Generates a constraint for counting the number of {color} cells in a row / col.
   * A grid fact should be defined first.
   */
  const [src_r, src_c] = src_cell;
  let rule = "";

  if (arrow_direction === 1) {
    // left
    rule += `:- not edge_left(${src_r}, ${src_c}).\n`;
    rule += `:- #count { C1 : edge_left(${src_r}, C1), C1 <= ${src_c} } != ${target}.`;
  }

  if (arrow_direction === 2) {
    // right
    rule += `:- not edge_left(${src_r}, ${src_c + 1}).\n`;
    rule += `:- #count { C1 : edge_left(${src_r}, C1), C1 > ${src_c} } != ${target}.`;
  }

  if (arrow_direction === 0) {
    // up
    rule += `:- not edge_top(${src_r}, ${src_c}).\n`;
    rule += `:- #count { R1 : edge_top(R1, ${src_c}), R1 <= ${src_r} } != ${target}.`;
  }

  if (arrow_direction === 3) {
    // down
    rule += `:- not edge_top(${src_r + 1}, ${src_c}).\n`;
    rule += `:- #count { R1 : edge_top(R1, ${src_c}), R1 > ${src_r} } != ${target}.`;
  }

  return rule;
}

function yajitatami_rect_constraint() {
  /**
   * Generate a cell relevant constraint for rectangles with the width/height of 1.
   */
  let rule = ":- upleft(R, C), left(R + 1, C), up(R, C + 1).\n";
  rule += ":- grid(R, C), upleft(R, C), #count { R1, C1: adj_edge(R, C, R1, C1) } = 0.";
  return rule;
}

modules["yajitatami"] = {
  name: "Yajitatami",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.text.size > 0, "No clues found.");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_rect_region());
    solver.add_program_line(yajitatami_rect_constraint());
    solver.add_program_line(avoid_region_border_crossover());

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(bulb_src_color_connected([r, c], null, "edge"));
      fail_false(typeof clue === "string" && clue.includes("_"), "Please set all NUMBER to arrow sub and draw arrows.");
      const [num, d_val] = clue.split("_");
      fail_false(/^\d+$/.test(num) && /^\d+$/.test(d_val), `Invalid arrow or number clue at (${r}, ${c}).`);
      solver.add_program_line(count_reachable_src(parseInt(num), [r, c], "bulb", null, "edge"));
      solver.add_program_line(yaji_region_count(parseInt(num) + 1, [r, c], parseInt(d_val)));
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNj9MwEL33V6x8noM/0ubjVpaWS+kCu2i1iqKo7Qa2olWWtkHIVf/7vhmnBNSVEALKBVmePD+Px2/Gsbefm9mmogTNJaTJoLnISrc6la7bdrPcrarsgobN7qHeABBdjcf0YbbaVr289Sp6e59mfkj+VZYrq0i6UQX5t9nev878lPw1phQZcBMgo8gCjjp4K/OMLgNpNPA0BORld4CL5WaxqspJYN5kub8hxfu8kNUM1br+UqkQQsaLej1fMjGf7ZDM9mH52M5sm/v6U9P6muJAfhjkjp6R6zq5DINcRs/I5Sz+sty0OBxQ9ncQXGY5a3/fwaSD19kedprtlY15qSu5nHxCiNjXgXIdNeifeMWDE6+4jfU9lQRKd1RyumOanlBG28BxEY+caWV845CEkVTuxI7FWrE3yJS8E/tSrBbbFzsRnxEKYGJHJkFgiw2SPjASEzwAhlbGMfNHHBHGLcbaOGr9E/ggkRZbjTIC40vWIBnGBnfJuIBtRNaGOIJd2BdfshHKxjhCnIhjQuytSL4UG4kdSCoxH+kvHfofqJozyDpNfiort6jiDw2VPOe46OVqdP+xupjWm/VshUszbdbzanMc45U69NRXJT3HcVL0/+H6Rw8XH4E+85/8uxcrR3VxGchfkXpsylm5qPGT6eLsMnHXit4T",
    },
  ],
};
