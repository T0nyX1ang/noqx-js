/** The Masyu solver. */

function masyu_black_rule() {
  /**
   * Generate a rule for black masyu.
   * A straight rule, a turning rule, and an loop_adjacent rule should be defined first.
   */
  let black_rule = ":- grid(R, C), black(R, C), not turning(R, C).\n";
  black_rule += ":- grid(R, C), black(R, C), turning(R, C), adj_loop(R, C, R1, C1), not straight(R1, C1).";
  return black_rule;
}

function masyu_white_rule() {
  /**
   * Generate a rule for white masyu rule.
   * A straight rule and a turning rule should be defined first.
   */
  let white_rule = ":- grid(R, C), white(R, C), not straight(R, C).\n";
  white_rule += ":- grid(R, C), white(R, C), straight(R, C), { turning(R1, C1): adj_loop(R, C, R1, C1) } = 0.";
  return white_rule;
}

modules["masyu"] = {
  name: "Masyu",
  category: "loop",
  aliases: ["mashu"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(defined("white"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("masyu"));
    solver.add_program_line(fill_path("masyu"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("masyu", "loop"));
    solver.add_program_line(single_loop("masyu"));
    solver.add_program_line(loop_straight("masyu"));
    solver.add_program_line(loop_turning("masyu"));
    solver.add_program_line(masyu_black_rule());
    solver.add_program_line(masyu_white_rule());

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      solver.add_program_line(`masyu(${r}, ${c}).`);
      if (symbol_name === "circle_L__1") {
        solver.add_program_line(`white(${r}, ${c}).`);
      }
      if (symbol_name === "circle_L__2") {
        solver.add_program_line(`black(${r}, ${c}).`);
      }
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVNb9pAEL37V0R7nsOO1xjbN5qGXlzSllQRsizkUFdYNTXFuEoX8d8zO7ZKqkykfgmpUmV2eLxZ8JvHzLr90hW7ElC7l4mA3ukKMOLlRyEvPVw31b4ukwuYdPt1syMAcD2dwseibksvG3bl3sHGiZ2AfZVkylfAC1UO9m1ysK8TuwA7p5QCJC4lhAp8glcneMt5hy57EjXh2YAJLgiuqt2qLpdpz7xJMnsDyt3nBX/bQbVpvpaq/xp/XjWbu8oRd8WeimnX1XbItN2H5lM37MX8CHbSy00FueYk18FerkOCXFfFH8utq8/lvaQ0zo9HcvwdaV0mmZP9/gSjE5wnB4ozjshxkRxUMKafQbrPY20qiCR2hCLri2wssaER2UBixyORDUVWvFukRVasOBIrjsWKY7Fi1GJxqMXqUIsyUIs6EEUzEEU3EEU70Bf9QCMWiUau0jjd/hM6kIsP5OLlrkOp7ahPp9ytPscbamawhuNLjprjiGPKe6443nK85BhwDHnP2I3Dbw/Mr8qhoSEL4oh6FMl+B9A3wDYaZ2f4CI8I0z/qsI6B9hH+yXoy05/cP170g/8al3uZSumsu5g1u01R04k3XxfbUtFT5eipe8UrIwch+P+gOf+DxrmvzzY9f2eYMzL2+9SBvQa17ZbFctVQd5F7fXoYxGfT/Ww+lx7GVU7T5MsJOhueJM7uHZ0dalO03zqVew8=",
    },
    {
      url: "https://puzz.link/p?masyu/21/15/000a0l2943300030l00200i10j0063c60091000670303010606j3600133013ia16l0110000600306b2063000300020960ai301030",
      test: false,
    },
  ],
};
