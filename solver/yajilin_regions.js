/** The Regional Yajilin solver. */

modules["yajilin_regions"] = {
  name: "Regional Yajilin",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_cc(["black", "white"]));
    solver.add_program_line(fill_path("white"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(avoid_adjacent_color("black", 4));
    solver.add_program_line(grid_color_connected("white", "loop"));
    solver.add_program_line(single_loop("white"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "sudoku_0").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count(num, "black", "area", i));
        }
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("black", 2));
    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Zbfb9s2FIXf/VcEfOaDRVIipZch65q9eOm2ZCgKwwgcz129OXXnxEWnIP97P1LHc4e5+9EABQYMtukjSp/uuRLvlW5/3c23S1uN89cnyz+fUKXyc6kpv7E+l6u79bI7sae7u1ebLcLaZ2dn9uV8fbscTXXUbHTft11/avuvu6mpjDWOX2Vmtv+uu++/6fpz21+wy9jA3GQ4yCGfHuTzsj+rJ8NkNUafoz0a+QK5WG0X6+XVZJj5tpv2l9bkOF8WOktzs3m7NPKRtxebm+tVnrie35HM7avVG+253f24+WWnY6vZg+1PB7uTI3b9wW6Wg92sjtjNWTza7nr1evnumNN29vDAFf8er1fdNNv+4SDTQV5094znZay6e9OOA2cI2Qs65bN9UZyZtnJseenmoN0Y7aQzvZ/PNOsma/8B6zOr40Nm8zGEf1FMnJXRlfESj7b3ZfyqjOMy1mWclGOeYtpVzjrHaR2rqvLoKB3Q2Ci6RrfSLGBP6KIjupJmcWerRbdoP2g3RpNa0bDZdtGwQayDDWIdbBDrYYNYX6FraTwHefZ4DvLs8RzkOcDWYgNsLTbA1mIDbC02wNZ7lnxr5Rvw3MhzwHMjzwHPjTzXsI3YGrYRW8NGsTVsFFvDxj1LvlH5NniO8tzgOcpzg+coz01uImIb2CQ2wiaxETaJjbBJbCTfpHwjnpM8RzwneY54buU5wbZiE2wrNsG2YhNsK5bG5sd7NqKVb0poeU4tWp5bOmQumqJhK7EtbCW2hc3lUzRsNbDEQQ8scdBDvsRBD56Jgx48Ewc9eCaO9bncioZ1YqkFr1ogDlosteBVC8RBD/kSx3rVAnHQg2fioAfPxEGLdbBeLLXgVQvEQYulFrxqgTho5UsteNUCcdDyTC141QJxrK/FethaLLXgVQvEQYulFrxqgTho5UsteNUCcdDyTC34fS1wf39fP9xH12b/NJXnpbU8KWMoY1NaTsxN8x+2Ve6W6cKHzfXTepwJnoxYQYaM8gXzReXUUFRhTswPnfBvrU+5A/lR/sdP/d+bm42m5mK3fTlfLHn8TXgMnpxvtjfzNVvnu5vr5Xa/zYvHw8i8M+WXn0E8sP9/F/ns7yL56o8/4Y3kMS8Gj63kaX9Bb7f9M2ve7K7mV4sNy4vL9lfzlOa/mj9+nsm+2j++kwbwkZ1DTzi+k2bypx2f/arTh8x2+dNq83q+Pvlt/vOKpWNmo/c=",
    },
    {
      url: "https://puzz.link/p?yajilin-regions/11/18/c6c69alhlhg1lhhh4h91gdict8jomt4aemu3001i3tk00uuff1g3vovve81oiu2k1sfvmrto68g2g22g222g222111111111g11g11111h",
      test: false,
    },
  ],
};
