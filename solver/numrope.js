/** The Number Rope solver. */

function numrope_constraint() {
  /**
   * Generate a constraint for the number rope.
   * An adj_loop rule should be defined first.
   */
  let rule = "adj_count(R, C, N) :- grid(R, C), N = #count { R1, C1 : adj_loop(R, C, R1, C1) }.\n";
  rule += ":- adj_count(R, C, N), N > 2.\n";
  rule += ":- adj_count(R, C, 1), number(R, C, N), number(R1, C1, N1), adj_loop(R, C, R1, C1), |N - N1| != 1.\n";
  rule +=
    ":- adj_count(R, C, 2), number(R, C, N), N * 2 != #sum { N1, R1, C1 : number(R1, C1, N1), adj_loop(R, C, R1, C1) }.\n";
  return rule.trim();
}

modules["numrope"] = {
  name: "Number Rope",
  category: "num",
  aliases: ["numberrope"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(fill_num(Array.from({ length: 9 }, (_, i) => i + 1)));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(avoid_num_adjacent(4));
    solver.add_program_line(numrope_constraint());

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      fail_false(draw, `Line must be drawn at (${r}, ${c}).`);
      solver.add_program_line(`grid_direction(${r}, ${c}, "${d}").`);
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})`);
      solver.add_program_line(`hole(${r}, ${c}).`);
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);

      if (puzzle.surface.has(new BasePoint(r, c).toString())) {
        solver.add_program_line(`:- #sum { N, R, C: number(R, C, N), |${r} - R| + |${c} - C| = 1 } != ${num}.`);
      } else {
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZRNb9NAEIbv+RXVnudgr3dtr2+hNFxC+GhRVVlW5ARXjUhwSWIEjvLf+86OkxgJQRFQLsjx7LOT2dnXsx+bT025rijBE6UUUIgnCox/44B/h+dqsV1W2RkNm+1dvQYQvRqN6LZcbqpB3kUVg13rsnZI7YssV6EipfGGqqD2TbZrX2btmNpL/KXIwDeWIAu8ENTAa/8/07k4wwA8EeZhN8DFxwrSl4vtVwl9neXtFSme6Zkfz6hW9edKdUq4P69XswU7ZuUWn7O5W9x3/2ya9/WHposNiz21QxE8+bHg6CiY6TuCWdxfF+yK/R6lfwvJ0yxn9e9OmJ7wMtspbVRmSEWJNM43RnpWmjiQJvJNIk0aSiM9F6NBxkmXETIMaiSL7ZPnSgc9D+b5NobngofXtPPwfLlKTw6eEml6ITw7BvViWEhvECSF2Q72xtuRt9rbK9SA2sjb594G3lpvx/iQyJJBOgu5liIh3SctZFIy+B6OO5LmE3Qg3ZEjg1LyiIAMPoZHHCkOKdaebJ+sUJxSLJltn6xQ4shJZlAqlAbkJLPT5FAo9h0pCSmVzKBEyBlyVuL6lAolHaF0F76A196ee2u8jX3pEt5cj9x+hy2DxH7V9G+v2iPl5dr42+3w2D/fKwa5umzWt+W8wiEd48SfTer1qlyiN2lWs2p96OOe3A/UF+XfPMJg8//q/IdXJy9D8Es7+Al27E/k5KgvrqTeKSJ130zL6bzGhguKJ5eLM1YMHgA=",
    },
  ],
};
