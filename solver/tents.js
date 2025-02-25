/** The Tents solver. */

function identical_adjacent_map(known_cells, color = "black", adj_type = 4) {
  /**
   * Generate n * (n - 1) / 2 constraints and n rules to enforce identical adjacent cell maps.
   */
  const rules = known_cells
    .map(
      ([r, c]) => `{ map_${r}_${c}(R, C): adj_${adj_type}(R, C, ${r}, ${c}), ${color}(R, C) } = 1 :- grid(${r}, ${c}).`
    )
    .join("\n");

  const constraints = known_cells
    .flatMap((cell1, i) =>
      known_cells
        .slice(i + 1)
        .map((cell2) => `:- map_${cell1[0]}_${cell1[1]}(R, C), map_${cell2[0]}_${cell2[1]}(R, C). `)
    )
    .join("\n");

  return rules + "\n" + constraints;
}

modules["tents"] = {
  name: "Tents",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("tents__2"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(avoid_adjacent_color("tents__2", 8));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      if (r === -1 && c >= 0 && c < puzzle.col && Number.isInteger(num)) {
        solver.add_program_line(count(num, "tents__2", "col", c));
      }

      if (c === -1 && r >= 0 && r < puzzle.row && Number.isInteger(num)) {
        solver.add_program_line(count(num, "tents__2", "row", r));
      }
    }

    const all_trees = [];
    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "tents__1") {
        all_trees.push([r, c]);
        solver.add_program_line(`not tents__2(${r}, ${c}).`);
      }
      if (symbol_name === "tents__2") {
        solver.add_program_line(`tents__2(${r}, ${c}).`);
      }
    }

    solver.add_program_line(identical_adjacent_map(all_trees, "tents__2", 4));
    solver.add_program_line(count(all_trees.length, "tents__2", "grid"));
    solver.add_program_line(display("tents__2"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNj9owEL3nV6x89iF2PpzkUtHt0gvNtoXVCkURCjQVqNBQIFVlxH/fmUlW2Ti+FKnby8p4NPM89rwZ2zHHX3VxKLkI8OdF3OUCWuhG1EUENvTnNtuctmVyw0f1aV0dQOH8fjzm34vtsXQynAktd846TvSI649JxgTjTEIXLOf6S3LWnxKdcj2FIQa+XE8aJwnqXac+0jhqtw0oXNDTVgd1Dupqc1hty8WkQT4nmZ5xhnHe02xU2a76XbKWB9qrarfcILAsTpDMcb3ZtyPH+lv1o259RX7hetTQnVvoeh1dVBu6qFnoYhZI91T+PB2v4trOHNKM88sFyv0ViC6SDDk/dGrUqdPkDDJNzswXMFXCPtGOMF+C6XWmhwu/A5LPgN8fD8HEXW7MwO2NBrj2C7O/dhD3IqvICCUCjNU5iBjnd7aM1Iv1IB1BSc0hqRADA95VmIWYiQEhgT6khhOjYADFSLUPCRdTNzGLn7D4SUzMxDB5A/MwYQPzLRhV1sAsJRGWmghliRs1u9zDYhs2jCvdYW7SG8aVltwknU0DU8P6ScuuSWWJa8lNquH2SjXMTdLxNDFLvpHJD47kmA6mJDmDC8i1R/IDSZdkQHJCPnckH0nekvRJhuSj8Ar/1SXv3Q0iKP89wSxs3g5bU28j14zkTsbSercsDzdpddgVW3gCputiXzJ4Yy8O+8Oo0zfRf3t2X/nZxdK7V9/L//OZyKCq8H9O33O2rxfFYlXBmXLzV2cJn4u2urnzBA==",
    },
    {
      url: "https://puzz.link/p?tents/13/13/h3g03h1g2j3h32g24g2g55233hi11131331f78625243a872550",
      test: false,
    },
  ],
};
