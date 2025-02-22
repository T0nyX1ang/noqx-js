/** The NEWS solver. */

function news_refine(solution) {
  /**
   * Refine the solution of NEWS.
   */
  const rev_news_dict = { 1: "N", 2: "E", 3: "W", 4: "S" };
  for (const [point, num] of solution.text.entries()) {
    solution.text.set(point, rev_news_dict[parseInt(num)]);
  }
  return solution;
}

function news_constraint() {
  /**
   * Generate a constraint for NEWS.
   */
  const mutual = "area(A, R, C), area(A, R1, C1)";
  let rule = `:- ${mutual}, number(R, C, 1), number(R1, C1, N1), N1 != 1, R1 <= R.\n`; // northest in area
  rule += `:- ${mutual}, number(R, C, 2), number(R1, C1, N1), N1 != 2, C1 >= C.\n`; // eastest in area
  rule += `:- ${mutual}, number(R, C, 3), number(R1, C1, N1), N1 != 3, C1 <= C.\n`; // westest in area
  rule += `:- ${mutual}, number(R, C, 4), number(R1, C1, N1), N1 != 4, R1 >= R.\n`; // southest in area
  return rule.trim();
}

modules["news"] = {
  name: "NEWS",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const news_dict = { N: 1, E: 2, W: 3, S: 4 };
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));
    solver.add_program_line(unique_num("grid", "area"));
    solver.add_program_line(news_constraint());

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(fill_num(Array.from({ length: 4 }, (_, i) => i + 1), "area", i, "white")); // prettier-ignore
      solver.add_program_line(count(ar.length - 2, "white", "area", i));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      const [symbol, style] = symbol_name.split("__");
      validate_type(symbol, ["ox_B", "ox_E"]);
      fail_false(["4", "7", "8"].includes(style), `Invalid symbol at (${r}, ${c})`);
      solver.add_program_line(`white(${r}, ${c}).`);
    }

    for (const [point, letter] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(["N", "E", "W", "S"].includes(letter), `Clue at (${r}, ${c}) must be in 'NEWS'`);
      solver.add_program_line(`number(${r}, ${c}, ${news_dict[letter]}).`);
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    for (const solution of solver.solutions) {
      news_refine(solution);
    }

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZTPbtpAEMbvPEW05z3g/WMT30gKvaROW1JFkYWQSdyCCjIBXEWLePd8M15jNdCgICWnyvLo5/Hs7Dfj8a4ey2yZyxCX7si2DHCpMOQ7MIbvtr9uputZHp/JbrmeFEuAlNf9vvyZzVZ5K/VRw9bGnceuK93nOBWBkELhDsRQum/xxn2JXU+6AV4J2YHvqgpSwF6Dt/ye6LJyBm1w4hl4ByyeRhfV09c4dTdS0B4XvJJQzIs/ufAa6Pm+mI+n5BhnaxSymkwX/s2qfCh+lz42GG6l61ZSkwNSdSOVsJJKdEAqVeCl9t5B6vlwu0W7v0PsKE5J948GOw0O4g1swjZgexdvhIqQxsimj0KrPY996TH6pceaPc9e5nAvT7S3VxT+7YHMPotVbG9Qi3Sa7Se2bbaW7RXH9FBWYDHDFtkVxs6ohjXYeFZgqrZmhaqYNRj1MGP6FXQTB7ZhBaa+cE5i6GbGH6NRee03PsaArWeLnDvGXtQ7jiH2GjSYulyz9jEaa+t9LdXlYyhP6DkER7Uf+1Lf2Q+O6rWkx2u20ExfS6F5t9zCS7aGbcitjWiI3jRmglqYCow87SHo3W7sTvuqR+Wl9BV3Fyo8lYctCH/4lZ8lxXKezfDbJeV8nC+b58EkW+QC59y2JZ4E3ynaLs3/o++Djz5qffvkA/CdJvGInBSdxaxWPaqmQyzKUTa6LzBcaCAH6GMBSrrrw/5UJK9nPryQdjxp4WtK8lNL2B0db1lo/r3ww4cAJ5LIHpd0TjwD",
    },
  ],
};
