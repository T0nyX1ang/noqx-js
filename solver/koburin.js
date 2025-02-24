/** The Koburin solver. */

modules["koburin"] = {
  name: "Koburin",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("gray"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("{ black(R, C); white(R, C) } = 1 :- grid(R, C), not gray(R, C).");
    solver.add_program_line(fill_path("white"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(avoid_adjacent_color("black", 4));
    solver.add_program_line(grid_color_connected("white", "loop"));
    solver.add_program_line(single_loop("white"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`gray(${r}, ${c}).`);
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent(num, [r, c], "black", 4));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`hole(${r}, ${c}).`);
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("black"));
    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZRb9pADH7nV1R+9kMud4SQl4l1ZS+MboOpqqIIBZaqUaFhgUzVIf57fb4wGE2qRpVoNU3hrC+fz8lnH7ay+lXEeYJCmJ/00UFCqNoeLyFcXk55jdP1PAnOsFesb7OcAOJlv4838XyVtMJyV9Ta6G6ge6g/ByEIQHBpCYhQfws2+kugh6hH5AJUxA3sJpfgxR5esd+gc0sKh/CwxASvCc7SfDZPJgPLfA1CPUYw7/nI0QbCIvudQKnD3M+yxTQ1xDReUzKr23RZelbFz+yuKPeKaIu6Z+UOKuTKvVwDrVyDKuSaLF4vd77MqoR2o+2WCv6dpE6C0Kj+sYf+Ho6CDdlhsAHp7XK0pwLKNcSHPeEpQ8gDonMUIhyOoYP9wwhxvEfIY8Z9EtXmJx8ynmMY54DxOerwOb7/1x5KTHB612z7bF22Y8oetWT7ia3Dts12wHsu2F6xPWer2Hq8p2Pq98IKgySpytb5NaJA+XRIXR+hI7sWqA4qyloiSLlDxHn0QstJOjT5wmxCSX1dcbX/XTZqhTAq8pt4llAbDdL75GyY5Yt4TnfDYjFN8t09za9tCx6AVyjNOPw/0k4+0kzxnUaD7e2nQKhHSJ2lLxGWxSSezDL6d1HVQqp32cA1TtvT9ZHU5vWR1PnVThoeVY46kcS3m/FeQ76uOMpXTR3dytSecXQc/z06qo/oOce7zKP5Cb5xHrXVPUXZm76cPgeeOE4+++izAe6LPL2LpwlErUc=",
    },
  ],
};
