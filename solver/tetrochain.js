/** The Tetrochain solver. */

function avoid_adjacent_same_omino(num = 4, color = "black") {
  /**
   * Generates a constraint to avoid adjacent ominos with the same type.
   * An adjacent rule, an omino rule should be defined first.
   */
  const tag = tag_encode("belong_to_shape", "omino", num, color);
  let rule = `:- not ${color}(R, C + 1), not ${color}(R + 1, C), ${tag}(R, C, T, _), ${tag}(R + 1, C + 1, T, _).\n`;
  rule += `:- not ${color}(R, C), not ${color}(R + 1, C + 1), ${tag}(R + 1, C, T, _), ${tag}(R, C + 1, T, _).`;
  return rule;
}

modules["tetrochain"] = {
  name: "Tetrochain",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(grid_color_connected("black", 8, [puzzle.row, puzzle.col]));

    solver.add_program_line(all_shapes("omino_4", "black"));
    solver.add_program_line(avoid_adjacent_same_omino(4, "black"));

    for (const [i, o_type] of Object.keys(OMINOES[4]).entries()) {
      const o_shape = OMINOES[4][o_type];
      solver.add_program_line(general_shape("omino_4", i, o_shape, "black", "grid", 4));
    }

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);

      fail_false(typeof clue === "string" && clue.includes("_"), "Please set all NUMBER to arrow sub and draw arrows.");
      const [num, d_val] = clue.split("_");
      fail_false(/^\d+$/.test(num) && /^\d+$/.test(d_val), `Invalid arrow or number clue at (${r}, ${c}).`);
      solver.add_program_line(yaji_count(parseInt(num), [r, c], parseInt(d_val), "black"));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("black"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVRb9MwEH7Pr6juCaRDimOna/NWxspLyYAWTVMURWnItLCUjKRB4Kr/fXeXSA20D+yBTUjI9ZevX87nz+fabb61aZ2jcvmjJ0hPakZNpHuTsXS3b6tiW+bBCGft9raqiSBezud4k5ZN7kR9VOzs7DSwM7Rvgwg8QOkKYrQfgp19F9gQ7ZJeARrSFsQUoEf04kCv5D2z805ULvGwS6iIXhPNijor82TRKe+DyK4QeJ7XMpopbKrvOXQp5HtWbdYFC+t0S4tpbov7/k3Tfq7u2j5WxXu0s87u8oRdfbDLtLPL7IRdXsVftjuN93sq+0cynAQRe/90oJMDXQY7wjDYgRnzUC9hr7xDlNFXki3hCvfS2O2ihpJ/NPDMHEvTo1xTSW8SPZAklz8cqFyZ0gxHKlcmMIk70PSJOP17PlqskiVfC84FPcEVVQStFnwj6Ar6gguJuRC8EjwXNIJjiTnjmv5h1YHtegiaimC6LXgCb5HuzvOvzf/3tNiJYNnWN2mW088/bDfrvB6FVb1JS6D7Zu/AD5Aeab6+/l9Bz3QF8Ra4j7qInv+ERlRdOif2EuG+TdIkq0qgfzFk3fiP07U60p98tXTs4Wf6pbhLbTt6waxJv77ib/R8CbHzAA==",
    },
    {
      url: "https://puzz.link/p?tetrochain/9/9/c33d37k32d35k31d32k22d41t34",
      test: false,
    },
  ],
};
