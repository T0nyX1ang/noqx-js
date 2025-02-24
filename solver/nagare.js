/** The Nagareru-Loop solver. */

const nagare_dict_dir = { 1: "l", 3: "u", 5: "r", 7: "d" };
const nagare_rev_dir = { l: "r", r: "l", u: "d", d: "u" };

function nagare_wind(r, c, d, puzzle) {
  if (d === "l" || d === "r") {
    const cols =
      d === "l"
        ? Array.from({ length: c }, (_, i) => i)
        : Array.from({ length: puzzle.col - c - 1 }, (_, i) => puzzle.col - 1 - i);

    let c1 = cols[0];
    let c2 = cols[cols.length - 1];
    for (let c_ of cols) {
      if (
        puzzle.symbol.has(new BasePoint(r, c_, BaseDir.CENTER).toString()) ||
        puzzle.surface.has(new BasePoint(r, c_).toString())
      ) {
        c1 = c_ + (cols[1] - cols[0]);
      }
    }
    if (d === "r") [c1, c2] = [c2, c1];
    return `:- nagare(${r}, C), ${c1} <= C, C <= ${c2}, not grid_out(${r}, C, "${d}"), not grid_in(${r}, C, "${nagare_rev_dir[d]}").`;
  }

  if (d === "u" || d === "d") {
    const rows =
      d === "u"
        ? Array.from({ length: r }, (_, i) => i)
        : Array.from({ length: puzzle.row - r - 1 }, (_, i) => puzzle.row - 1 - i);

    let r1 = rows[0];
    let r2 = rows[rows.length - 1];
    for (let r_ of rows) {
      if (
        puzzle.symbol.has(new BasePoint(r_, c, BaseDir.CENTER).toString()) ||
        puzzle.surface.has(new BasePoint(r_, c).toString())
      ) {
        r1 = r_ + (rows[1] - rows[0]);
      }
    }
    if (d === "d") [r1, r2] = [r2, r1];
    return `:- nagare(R, ${c}), ${r1} <= R, R <= ${r2}, not grid_out(R, ${c}, "${d}"), not grid_in(R, ${c}, "${nagare_rev_dir[d]}").`;
  }

  throw new Error("Invalid direction.");
}

modules["nagare"] = {
  name: "Nagareru-Loop",
  category: "loop",
  aliases: ["nagareru"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("nagare"));
    solver.add_program_line(fill_path("nagare", true));
    solver.add_program_line(adjacent("loop_directed"));
    solver.add_program_line(grid_color_connected("nagare", "loop_directed"));
    solver.add_program_line(directed_loop("nagare"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      const [shape, style] = symbol_name.split("__");
      const _d = nagare_dict_dir[style];

      if (shape === "arrow_B_B") {
        solver.add_program_line(`nagare(${r}, ${c}).`);
        solver.add_program_line(`grid_in(${r}, ${c}, "${nagare_rev_dir[_d]}").`);
        solver.add_program_line(`grid_out(${r}, ${c}, "${_d}").`);
      }
      if (shape === "arrow_B_W") {
        solver.add_program_line(`not nagare(${r}, ${c}).`);
        solver.add_program_line(nagare_wind(r, c, _d, puzzle));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`not nagare(${r}, ${c}).`);
    }

    solver.add_program_line(display("grid_in", 3));
    solver.add_program_line(display("grid_out", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VfLbutGDN37KwKtZ6F56bVLbpNu3PThFEEgGIbjKI1Rp7614zaQ4X/PkDyOjZpF20WLCzSwNcMhOZwzR0NKWv+6ma4643L6+8rkxqZfWVd8VdHyleN3M39ZdM2ZOd+8PC1XSTDm26sr8zhdrLtBC6/xYNvXTX9u+q+bNnOZwTU2/ffNtv+m6e9MP0qmzISkGybJZsYl8fIg3rKdpE+itHmSryEn8S6J09Vq+fvkYnIhnt81bX9jMlrogqeTmD0vf+symcfj2fL5fk6K++lL2s36af4ZlvXmYfnzBr52vDP9ueAd7vHSwsDrD3hJFLwkKXgJHOGdzVezRTcZSqB/CLd7+Kl71ZDW490uUf5DwjppWoL940GsDuKo2WaxzJpgssJyV8qoitLJqM6lq7izubjaXJxsXktvvfTOoZfZ1sHuJYz1sHv4e8Tx8A/wC4X0QGhLzCsxr4S9BK4S61SwV9BX0NeyjsvF7oDbWVnPOdmXc/ADfuckjgNOFzA/BOmj4HIlxsDlwKUDLlfBD+R64PC5zPPg01uM7X4scbyVON4JXg+8Hnx7h3ge+rDvMT9iHvD6AusUgteDJ1/DXsNew16LPeRiD+AtWFkn4P4H4A5WeAvAF8BnAJ/BIx5whohxgbgF5hWYV0Jfwh/nIIDngGMaahlH4ItW8EfgieAxMl8pC66bbWott3cpIyhea817LbnldM3oNrbxoJYSw8mheBOJmjcF8Sdqzqm2PInCOaTqKY6ipzOqoOHc0vwp1zR/uifH/nuclJPH29r705nX4lNuHu93r68o/ik9nIuKP+ekEp9zVNNTrVF4dpQbyr4c1aJjHt71f4i/19OZ1PwL2q+ip9qg4fwT3jjnFR64Bmh6qgmqnvar6el4anri+ZQ3rinKfecao+mptijnyleE85RPTzmr6LnWKDi5tijxudYoeLimKDyHQs9Hri1aHHqmKOeWa4+Gk545ynmIuX5+uCadxEl16Yqrk+P2Jj28Te+5/YrbnNvI7ZB9Lrm95fYTt4Hbgn1Kevz/zReE0wL5L8Fpo7xp/vUvfvh9+P3//MaDNhttVo/TWZde+ofzX7qz6+XqebpIo9HT9HOXpe+s3SB7zfhKZcSmz6mPT6///tOL6M+/tPr6pcFJFX88eAM=",
    },
  ],
};
