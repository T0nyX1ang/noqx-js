/** The Uso-one solver. */

function uso_one_constraints(adj_type = 4, color = "black") {
  /**
   * Generate the constraint for Uso-one.
   */
  const count_adj = `#count { R1, C1: ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1) }`;
  let rule = "{ wrong_clue(A, R, C) } :- clue(A, R, C, _).\n";
  rule += ":- clue(A, _, _, _), { wrong_clue(A, R, C) } != 1.\n";
  rule += `:- clue(A, R, C, N), not wrong_clue(A, R, C), ${count_adj} != N.\n`;
  rule += `:- clue(A, R, C, N), wrong_clue(A, R, C), ${count_adj} = N.\n`;
  return rule.trim();
}

modules["usoone"] = {
  name: "Uso-one",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("clue", 4));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(avoid_adjacent_color("gray"));
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(uso_one_constraints(4, "gray"));
    solver.add_program_line("ox_E__1(R, C) :- grid(R, C), clue(_, R, C, _), not wrong_clue(_, R, C).");
    solver.add_program_line("ox_E__7(R, C) :- grid(R, C), clue(_, R, C, _), wrong_clue(_, R, C).");

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      for (const [r, c] of ar) {
        const num = puzzle.text.get(new BasePoint(r, c, BaseDir.CENTER, "normal").toString());
        if (num !== undefined && num !== null) {
          fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
          solver.add_program_line(`not gray(${r}, ${c}).`);
          solver.add_program_line(`clue(${i}, ${r}, ${c}, ${num}).`);
        }
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "ox_E__1") {
        solver.add_program_line(`:- wrong_clue(_, ${r}, ${c}).`);
      }
      if (symbol_name === "ox_E__4" || symbol_name === "ox_E__7") {
        solver.add_program_line(`:- not wrong_clue(_, ${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    solver.add_program_line(display("ox_E__1"));
    solver.add_program_line(display("ox_E__7"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VXfT9tIEH7PX4H2eR+8P/xj/QY09IWGu4YTQlEUBTAlaoJpgk/IUf53vpld1zHK6Rqo6FU6JV5/M56d+WZ2d3b1rZouC6ki+ptM4o2fVRk/Okv4icLvfPY4L/IDeVg93pVLACnPTk7k7XS+KnqjYDXurWuX14ey/piPhBJSaDxKjGX9Z76uP+V1X9ZDfBIyg+7UG2nAfgsv+DuhY69UEfAgYMBLwPJpcuSlP/JRfS4FxTjimQTFovy7EIEDydfl4mpGiqvpIxJZ3c0ewpdVdVN+rYKtGm9kfeipDndQNS1Vgp4qoR1UKYNAtf8qqvPZfVE+7aLpxpsNSv0ZRCf5iDj/1cKshcN8jXGQr4VJMVVjfXk1hE0gmu9iHHVF3RUziLQ7vJioztek6yqNO8YpzW3jpg4ibTMvZsSqneuIRjtXRRTJbsnkrDVXqhtaKfreele6m5bSpkNGWftCJn9b8+2LeJbYb9knlGtjj0IrLvcljyc8ah7PsRqyNjx+4DHiMebxlG36WCStjNQaNdE4OArnzyABxg4Y5AnrVGqLwhA2ETCSYIy5Nsy1SuoY5BhbYCTCGHNp+QjHMTASYozznmLRCSeYS4vIGHGzEDfV1A8CxtwszM0Q14W46Bcm8pzxlkZ5bnhLoz0Ho2Fjg43OgH1c6KSJg73VwCEW8bdNLohLi8QY9WnypVwa+xj6uNEj3yb3hHJvMPJtcuc+1/CHTRZsMuqBjQ3qQJuTsEPNXaihQ1wX4jr4aerg4McFPw5+XPDjXFsfqonyeeEN7P3gDez94A0c6oaebJT3Y7RBPUOtNNU2+NHwo4MfqnPYS3iH+mOjXfB2O+bR8pjwNkypZfxgU8HqsmPae5nvMNvb37eXVLatzzcNHJRG87oT8q/0RzgRdCC7v/j30417IzGslrfT6wIXQP/mS3EwKJeL6RzSoFpcFctWHt5NHwqBu3fTE0+CH+5a9v/r+B2vYyp7tNel/PYb463HeVRfSvT7+kyKh2oynVyX2E+oGenRX3+J/r/GZ1+eu/VDiXtsD/2+/n9WXkNcUPvp/ymvHfbvvvtxIYhqVZb31B6fAQ==",
    },
    {
      url: "https://puzz.link/p?usoone/10/10/h0finm9ud78hcsnn18e8h34l4kautm6h8ok4ibgcgahdcgdjc2ddg7dhcgb7ablccgdk3eg11cl",
      test: false,
    },
  ],
};
