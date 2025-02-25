/** The Geradeweg solver. */

function count_geradeweg_constraint(target, src_cell) {
  /** Count the number of geradeweg segments. */
  const [r, c] = src_cell;
  let rule = `:- segment(${r}, ${c}, N1, N2, "T"), |${r} - N1| != ${target}.\n`;
  rule += `:- segment(${r}, ${c}, N1, N2, "T"), |${c} - N2| != ${target}.\n`;
  rule += `:- segment(${r}, ${c}, N1, N2, "V"), |${r} - N1| + |${r} - N2| != ${target}.\n`;
  rule += `:- segment(${r}, ${c}, N1, N2, "H"), |${c} - N1| + |${c} - N2| != ${target}.\n`;
  return rule.trim();
}

modules["geradeweg"] = {
  name: "Geradeweg",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("clue"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("geradeweg"));
    solver.add_program_line(fill_path("geradeweg"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("geradeweg", "loop"));
    solver.add_program_line(single_loop("geradeweg"));
    solver.add_program_line(loop_sign("geradeweg"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(loop_segment([r, c]));
      solver.add_program_line(`:- segment(${r}, ${c}, N1, N2, "T"), |${r} - N1| != |${c} - N2|.`);

      if (Number.isInteger(num)) {
        solver.add_program_line(count_geradeweg_constraint(num, [r, c]));
        if (num > 0) {
          solver.add_program_line(`geradeweg(${r}, ${c}).`);
        } else {
          solver.add_program_line(`not geradeweg(${r}, ${c}).`);
        }
      } else {
        solver.add_program_line(`geradeweg(${r}, ${c}).`);
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
      data: "m=edit&p=7VZRb9owEH7nV1R+voc4tpOQl6nrur0wuq2dqiqKEKVZiwajg7JVQfz3fndJG+gwtNpWadIUcnznz7mcv7MPZt/n/WlBOuCPSQjfuKxO5A6TSO6gvk6GN6Mi3aP9+c3VZApAdNSlL/3RrGhl9aS8tSjbablP5bs0U1qRCnFrlVP5MV2U79OyS+UxKEUaY51qUgh42MBT4RkdVIM6AO5WOAI8AxwMp4NR0etUgT6kWXlCit/zWp5mqMaTH4Wq82B/MBmfD3ngvH+Dtcyuhtc1M5tfTL7O67k6X1K5X6Xb2ZCuadJlWKXL6G+lOxp+K243ZdrOl0so/gm59tKM0/7cwKSBx+kCtpsulAnwqKGoKooybbjhg2tjuLpxk3WXJzeu41CNG7HbhIrcGhvbNTbhyI2rg5BXFECvh5Fo7XkdcGq28TXzKxFCvc7LQld4w/ms8Jb9Fd4+iidSrPqPMnY8X71ayVhWrMz9CATXIvuZ2LdiQ7EnqAqVRuwbsYFYJ7Yjcw7Fnoo9EGvFRjIn5ro+q/K/k46yoVFpO8EWCFFHAawvg8igdALs/QhLycBoYtIAhWQQgREaDSoFZC05aArkEorreQFZvIBRjIZUoYR4lzJqk6uiOOxg1Mc8UacMcbmzrV/u3xvLW5nqoBnsdSfTcX+EltCdj8+L6b2P9rtsqVslN445mvn/jvzyHZnVD17sdP6ZZpFB2PrEUnlE6nre6/cGE+wxaFeRcoh9pJxrD1kddQ9ZnX5/WDQEHyk9wkdK2/CR0kl8CUlz2UyiEW4m0AY9hI18oayHwKI9oTwEft1i0s6rv0bWmOKlHVoLfr18dBSC9soFCrS3SKC2BHdW+wiPnjEKu5nw6Rk7j2zPIZ5C/ZrAlqS3LHSLODtl3VmWnWXduS12bqud2xITXrz74V+Auiym/YviZ3Gp8tYd",
    },
    {
      url: "https://puzz.link/p?geradeweg/v:/17/17/0000i000i0000000i3g0g2i000000g1m3g000000j3g2j0000000g1k1g00000000000i00000000j0k0h2g0g2g1i.g.h4l1g3q2g2g2g0h2h0g2k1g00k00h3g0h000h1h000h0000000k000000000000g2g2g0000000000000i000000000000000g0000000000000000g00000000",
      test: false,
    },
  ],
};
