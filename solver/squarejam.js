/** The Square Jam solver. */

function squarejam_constraint(target, src_cell) {
  /**
   * Generate a constraint for squarejam size.
   */
  const tag = tag_encode("reachable", "bulb", "src", "adj", "edge", null);
  const [src_r, src_c] = src_cell;
  return `:- { ${tag}(${src_r}, ${src_c}, R, C) } != ${2 * target - 1}.`;
}

modules["squarejam"] = {
  name: "Square Jam",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(Array.from(puzzle.text.keys()).length > 0, "No clues found.");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_rect_region(true));
    solver.add_program_line(avoid_region_border_crossover());

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(bulb_src_color_connected([r, c], null, "edge"));
      if (Number.isInteger(num)) {
        solver.add_program_line(squarejam_constraint(num, [r, c]));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTRbpswFH3nKyo/3weMgWC/TFmX7CWj25qpqhCKSMrWqInoIEyTo/x7772QJvU6TVOmTpMmwtHh+BofjnPdfG2LugQNUoJKwAeJl0p8CKMY9IB+fn9Nl5tVac5g2G5uqxoJwMV4DJ+LVVN6WV+Ve1urjR2CfWsyEQjgW4oc7Aezte+MTcFe4pCAELUJMikgQDo60CseJ3beidJHnvYc6TXSxbJerMrZpFPem8xOQdA6r3k2UbGuvpWim8bPi2o9X5IwLzb4Mc3t8r4fadqb6q7ta2W+Azvs7I72dmmV3q462CXa2SX2jF36ipPtljdfyqadP+dV57sdZv4R3c5MRsY/HWhyoJdmi5iarYhimqrQSLcxIhqQ8OpISEjAjXsUtFMR+05FzBVHL00Cp0JHzjs0+zgWXB/a9SF9VijivRJIZ5JUoWNFKl76ieJmIJW7uFRP18L0JGd4zThmDBinGDFYxfiG0WeMGCdcM2K8YjxnDBljrhnQJv3WNp5uR4QhpqATbFHs/CDCINUvLWZBwkfE8RX9e0ruZWKETXWWVvW6WGFjpe16Xtb7ZzzGdp74LvjOFE4J/59sf+Nko/z9F26MU/s0w2gfewrsBYj7dlbMFhX+zzA/Go6l+tlA+KdmYHv/MPDiSeGJIfDPeFfgtubeAw==",
    },
    { url: "https://puzz.link/p?squarejam/11/11/zj1h2h3zl2h3h3zl2h1h3zj", test: false },
  ],
};
