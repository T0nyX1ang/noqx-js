/** The Doppelblock solver. */

modules["doppelblock"] = {
  name: "Doppelblock",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    solver.add_program_line(grid(n, n));
    solver.add_program_line(fill_num(Array.from({ length: n - 2 }, (_, i) => i + 1), "grid", null, "black")); // prettier-ignore
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(count(2, "black", "row"));
    solver.add_program_line(unique_num("grid", "col"));
    solver.add_program_line(count(2, "black", "col"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      if (r === -1 && c >= 0 && c < n && Number.isInteger(num)) {
        const begin_r = `Rb = #min { R: black(R, ${c}) }`;
        const end_r = `Re = #max { R: black(R, ${c}) }`;
        solver.add_program_line(
          `:- ${begin_r}, ${end_r}, #sum { N, R: number(R, ${c}, N), R > Rb, R < Re } != ${num}.`
        );
      }

      if (c === -1 && r >= 0 && r < n && Number.isInteger(num)) {
        const begin_c = `Cb = #min { C: black(${r}, C) }`;
        const end_c = `Ce = #max { C: black(${r}, C) }`;
        solver.add_program_line(
          `:- ${begin_c}, ${end_c}, #sum { N, C: number(${r}, C, N), C > Cb, C < Ce } != ${num}.`
        );
      }

      if (c >= 0 && c < n && r >= 0 && r < n) {
        fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    solver.add_program_line(display("number", 3));
    solver.add_program_line(display("black", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZXfb5swEMff+Suqe74HGzsE/JZ1zV4yui2ZqspCEWFUjUZES8I0Ocr/3vOBCup+aHtY+jI5/urLx2dyZ8fO/rHNmxITaipGgZKaigX3WPuP6Ntqe6hKc4Gz9nBfN2QQr+dzvMurfRlYyXNFFhxdYtwM3TtjQQJCSF1Chu6jObr3xqXoljQEqIktuqCQ7NVgb3jcu8sOSkE+7T3ZW7LFtimqcr3oyAdj3QrBf88bnu0t7OpvJfR5+Oei3m22HmzyAxWzv98+9CP79kv9te1jZXZCN/t1umpI19suXe9+kq6v4h+nm2SnEy37J0p4bazP/fNg48EuzZE0NUdQwk+NKZdub0BJfhft1TPRnoRiRCYvie5mRSMSeqIGMOHXjEA0fQFizkUmA0kUEz0QKSJG0xGiGYTGQYq//LkGqlVyxbesc9aQdUULgk6xvmUVrBPWBcdcsd6wXrJq1ohjpn5J/3DRQVNBulv6MyRldcineGjReZ+zwMKybe7yoqSfa9ruNmVzkdbNLq+A7odTAN+Bu1UUrv9fGa90ZfgtEH91cbz+kbJuiUqgu0Z4aNf5uqgroH8d/B3X6gd+9qroWEL+2JSQBU8=",
    },
  ],
};
