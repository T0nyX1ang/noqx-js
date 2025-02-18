/** The Araf solver. */

function araf_region_clue_count(src_cell) {
  /**
   * Generates a constraint for counting the number of clues in a row / col.
   */
  const [src_r, src_c] = src_cell;
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  let rule = `araf_link(${src_r}, ${src_c}, R, C) :- ${tag}(${src_r}, ${src_c}, R, C), clue(R, C, _), (R, C) != (${src_r}, ${src_c}).\n`;
  rule += `:- #count { R1, C1 : araf_link(${src_r}, ${src_c}, R1, C1) } != 1.`;
  return rule;
}

function araf_region_count(src_cell) {
  /**
   * Generates a constraint for counting the number of cells in an araf area.
   */
  const [src_r, src_c] = src_cell;
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  const cnt_area = `N = #count { R0, C0: ${tag}(${src_r}, ${src_c}, R0, C0) }, (N - N1) * (N - N2) >= 0`;
  const rule = `:- araf_link(${src_r}, ${src_c}, R, C), clue(${src_r}, ${src_c}, N1), clue(R, C, N2), ${cnt_area}.`;
  return rule;
}

modules["araf"] = {
  name: "Araf",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.text.size > 0, "No clues found.");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(avoid_unknown_src(null, "edge"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);

      const exclude = [];
      for (const [point1, num1] of puzzle.text.entries()) {
        const [r1, c1, d1, pos1] = extract_point(point1);
        validate_direction(r1, c1, d1);
        validate_type(pos1, "normal");
        fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
        if (Math.abs(r - r1) + Math.abs(c - c1) >= Math.max(parseInt(num), parseInt(num1))) {
          exclude.push([r1, c1]);
        }

        if ((r !== r1 || c !== c1) && Math.abs(parseInt(num) - parseInt(num1)) <= 1) {
          exclude.push([r1, c1]);
        }
      }

      solver.add_program_line(`clue(${r}, ${c}, ${parseInt(num)}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, exclude, null, "edge"));
      solver.add_program_line(araf_region_clue_count([r, c]));
      solver.add_program_line(araf_region_count([r, c]));
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
      data: "m=edit&p=7VRRb9owEH7nV1R+9oPPCcHJG+tgL4xua6eqiiIUaLqigdIFMk1G/PfeXcIcb7BpQur2MIWcvs93dr4zd7f5UudVIWN8AiOVBHwCo/g1If1U+9wst6siuZDDevtYVgikvBqP5UO+2hS9tI3KejsbJ3Yo7ZskFVpIfkFk0r5PdvZtYqfSXqNLSMC1CSIQUiMcOXjLfkKXzSIoxNMGRwjvEC6W1WJVzCbNQe+S1N5IQd95xbsJinX5tRDNNuaLcj1f0sI832Iym8flU+vZ1Pfl57qNhWwv7bCROzoiN2jlhg1s5BI6IpeyOFtucf+p2NTzY1rjbL/HO/+AamdJSsI/OmgcvE52aKfJTmiDW0MZNX+L0LFHA0AaOap9b+DTPlJwNPK8IQXHjg482g+RBo7SUR3qi4x8VRGpct+NKAVHB/53jfIped2HDMnoeElG31GS4U6OKdipAkVHOzcougAnE5SfBQDpHnQ4ndfZr+k83eEU78SB/jHev3AI/GSA/xCXDQSk5+DHcgAuiju2Y7aa7Q3WjLQB29dsFds+2wnHjNjesr1kG7KNOGZAVfdHdXm+HKw/zDc2mB2OLYix3gKsbxVLDXixhEEhxlo6YI3FgBiMkVo162AGiCn+t+ml2vC87D79f2sl66VihNPjYlpW63yFE2Rar+dFdeA4r/c98U3wi20BMvw/wv/GCKf7Vy/cMOf2b4pX+73XpL2S4qme5bNFiXWG98fuQ/udcrcd+Ss3NukJ96FvT7qbVj7uxmnxk+PFLxiHiMir/EFkvWc=",
    },
    { url: "https://puzz.link/p?araf/10/10/1h4h1h7i6h6heldh34n5icrai8nc9hblahah3ibh-32h-32hd", test: false },
    { url: "https://pzplus.tck.mn/p?araf/10/11/1l6p7q4467h5g55q7g7647g1q-108g-10h-1075-10q9p-10ld", test: false },
  ],
};
