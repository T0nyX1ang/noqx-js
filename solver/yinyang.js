/** The Yin-Yang solver. */

function exclude_checkboard_yinyang() {
  /**
   * Exclude checkboard shape.
   */
  let rule = ":- circle_M__1(R, C), circle_M__2(R, C + 1), circle_M__2(R + 1, C), circle_M__1(R + 1, C + 1).\n";
  rule += ":- circle_M__2(R, C), circle_M__1(R, C + 1), circle_M__1(R + 1, C), circle_M__2(R + 1, C + 1).";
  return rule;
}

function exclude_border_color_changes(rows, cols) {
  /**
   * Exclude border color changes more than twice.
   */
  let rule = "";
  for (let r = 0; r < rows - 1; r++) {
    const rev_r = rows - 1 - r;
    rule += `changed(${r}, 0) :- circle_M__1(${r}, 0), circle_M__2(${r + 1}, 0).\n`;
    rule += `changed(${r}, 0) :- circle_M__2(${r}, 0), circle_M__1(${r + 1}, 0).\n`;
    rule += `changed(${rev_r}, ${cols - 1}) :- circle_M__1(${rev_r}, ${cols - 1}), circle_M__2(${rev_r - 1}, ${cols - 1}).\n`; // prettier-ignore
    rule += `changed(${rev_r}, ${cols - 1}) :- circle_M__2(${rev_r}, ${cols - 1}), circle_M__1(${rev_r - 1}, ${cols - 1}).\n`; // prettier-ignore
  }

  for (let c = 0; c < cols - 1; c++) {
    const rev_c = cols - 1 - c;
    rule += `changed(0, ${c}) :- circle_M__1(0, ${c}), circle_M__2(0, ${c + 1}).\n`;
    rule += `changed(0, ${c}) :- circle_M__2(0, ${c}), circle_M__1(0, ${c + 1}).\n`;
    rule += `changed(${rows - 1}, ${rev_c}) :- circle_M__1(${rows - 1}, ${rev_c}), circle_M__2(${rows - 1}, ${rev_c - 1}).\n`; // prettier-ignore
    rule += `changed(${rows - 1}, ${rev_c}) :- circle_M__2(${rows - 1}, ${rev_c}), circle_M__1(${rows - 1}, ${rev_c - 1}).\n`; // prettier-ignore
  }

  rule += ":- { changed(R, C) } > 2.\n";
  return rule.trim();
}

modules["yinyang"] = {
  name: "Yin-Yang",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("circle_M__1"));
    solver.add_program_line(invert_c("circle_M__1", "circle_M__2"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(avoid_rect(2, 2, "circle_M__1"));
    solver.add_program_line(avoid_rect(2, 2, "circle_M__2"));
    solver.add_program_line(grid_color_connected("circle_M__1", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(grid_color_connected("circle_M__2", 4, [puzzle.row, puzzle.col]));

    solver.add_program_line(exclude_checkboard_yinyang());
    solver.add_program_line(exclude_border_color_changes(puzzle.row, puzzle.col));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_M__1") {
        solver.add_program_line(`circle_M__1(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not circle_M__1(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("circle_M__1"));
    solver.add_program_line(display("circle_M__2"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVda9tAEHzXryj7vAWtTifL9+a6cV+c9CMuIQgRHFdtRO2o9UfbnNF/995K4IAXCqWloRR5h/Hcenck7+k2X3fzdYVE4WNyjJEZpjaTIEok4v6a1dtl5Z7haLe9a9ZMEF9PJvhxvtxUUdFnldHeD50foX/lCiBASDgISvRv3d6fO1g0q9sa0F/yOiDxwrTLTJieHemVrAc27kSKmV/0nOk100W9Xiyrm2mnvHGFnyGEZi/k14HCqvlWQW8mfO8MsHC7/H7Xa5vdh+bzrs+iskU/+olbc3QbaOc2MMVtuIlHbs9/q9th2bb80N+x3xtXBOvvjzQ/0ku3Z7wQJMFrtwcz4DIJt3lsDWyiqpmmZqmqqnWzoabmsaqq3YZqBYrVdhTnuqwXIdJl9WEQWV1WbRPpBpOQTSey0Q2mRs1O9ZZWN2h1Jza0PK090G9+EGqfZudKbR60iYxbIjjjaURvBF8KxoJWcCo5Z4JXgmPBVDCTnEGY51+e+D9kpzD8slQu+++qZVTAuFl9aTb1tgJ+8bcR/ACJwoRz5P9Z8FfOgvAHxE9tfzw1O7xj4aG+f/4wv/8EZXQA",
    },
    {
      url: "https://puzz.link/p?yinyang/22/18/00000000000000030190030000900003000000900130020006000l0000090000i0020009400030200060000002empf01900001009901030130900031009a00009000",
      test: false,
    },
  ],
};
