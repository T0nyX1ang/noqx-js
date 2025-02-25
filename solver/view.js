/** The View solver. */

function bulb_num_color_connected(color = "white", adj_type = 4) {
  /**
   * Generate a constraint to check the reachability of color cells starting from a bulb.
   */
  const tag = tag_encode("reachable", "bulb", "branch", "adj", adj_type, color);

  const initial = `${tag}(R, C, R, C) :- number(R, C, _).`;
  const bulb_constraint = `${color}(R, C), adj_${adj_type}(R, C, R1, C1), (R - R0) * (C - C0) == 0`;
  const propagation = `${tag}(R0, C0, R, C) :- number(R0, C0, _), ${tag}(R0, C0, R1, C1), ${bulb_constraint}.`;
  const constraint = `:- number(R, C, N), { ${tag}(R, C, _, _) } != N + 1.`;
  return initial + "\n" + propagation + "\n" + constraint;
}

modules["view"] = {
  name: "View",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(fill_num(Array.from({ length: puzzle.row + puzzle.col }, (_, i) => i), "grid", "A", "white")); // prettier-ignore
    solver.add_program_line(invert_c("white", "black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(avoid_num_adjacent());
    solver.add_program_line(bulb_num_color_connected("white"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "ox_E__1") {
        solver.add_program_line(`not white(${r}, ${c}).`);
      }
      if (symbol_name === "ox_E__4" || symbol_name === "ox_E__7") {
        solver.add_program_line(`white(${r}, ${c}).`);
      }
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTBbtpAEL37K6I5z8G7tsHeG0mhF+q0hSpClmUZ6gqrIFOD02gR/56ZsRUHNTmkapJLtdqn92Zn8dvZWfa/mrwuMKThheiiouH5WqZ2I5luN+blYVOYCxw1h3VVE0G8nkzwR77ZF07SZaXO0UbGjtB+NAkoQNA0FaRov5ij/WRsjHZGS4CKYtM2SRMd9/RG1pldtUHlEo87TnRBdFXWq02RTdvIZ5PYOQJ/51J2M4VtdVtA54P1qtouSw4s8wMdZr8ud93Kvvle/Wy6XJWe0I5au4sn7Hq9XaatXWZP2OVTsN3qLhu/gtUoPZ2o5F/JbGYS9v2tp2FPZ+ZIGJsj6Ii2arpnuRXwgzMZaJKKG6HVg5D1gxxy9uBBRupsc3SerJRP2u80fV6JiYXgRFALzskjWk/wg6ArGAhOJWcseCN4JegLDiRnyKd8UR0e2wHdGu8vCQI+md9HXslxormYj0fwtjp1Eoib7bKoL+Kq3uYbarLZOt8VQC/55MAdyEw8Svb/P+53eNxcfvevW/t9XlpClaXOttcIuybLs1VFfUV1k/jwmfhL85+JB+rf/I4O/4i/eZXpDwJuy+I3pM49",
    },
    {
      url: "https://puzz.link/p?view/9/9/g0i0t0i0q0h0i0p0i0q0g0i0j",
      test: false,
    },
  ],
};
