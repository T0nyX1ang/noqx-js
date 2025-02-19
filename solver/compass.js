/** The Compass solver. */

function compass_constraint(r, c, pos, num) {
  /**
   * Generate a compass constraint.
   */
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  const constraint = {
    sudoku_4: `R < ${r}`,
    sudoku_6: `C < ${c}`,
    sudoku_7: `R > ${r}`,
    sudoku_5: `C > ${c}`,
  };
  const rule = `:- #count{ (R, C): ${tag}(${r}, ${c}, R, C), ${constraint[pos]} } != ${num}.`;

  return rule.trim();
}

modules["compass"] = {
  name: "Compass",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(avoid_unknown_src(null, "edge"));

    const all_src = get_all_src(puzzle.text);
    fail_false(all_src.size > 0, "No clues found.");
    for (const [r, c] of all_src) {
      solver.add_program_line(`not hole(${r}, ${c}).`);
      const current_excluded = Array.from(all_src).filter((src) => src[0] !== r || src[1] !== c);
      solver.add_program_line(grid_src_color_connected([r, c], null, current_excluded, null, "edge"));
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, ["sudoku_4", "sudoku_5", "sudoku_6", "sudoku_7"]);
      if (Number.isInteger(num)) {
        solver.add_program_line(compass_constraint(r, c, pos, num));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`hole(${r}, ${c}).`);

      const edges = [
        [r, c - 1, r, c, BaseDir.LEFT.description],
        [r, c + 1, r, c + 1, BaseDir.LEFT.description],
        [r - 1, c, r, c, BaseDir.TOP.description],
        [r + 1, c, r + 1, c, BaseDir.TOP.description],
      ];

      for (const [r1, c1, r2, c2, direc] of edges) {
        const prefix =
          puzzle.surface.has(new BasePoint(r1, c1).toString()) &&
          puzzle.surface.get(new BasePoint(r1, c1).toString()) === color
            ? "not "
            : "";
        solver.add_program_line(`${prefix}edge_${direc}(${r2}, ${c2}).`);
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRBj9o8EL3zK5DPPsSJSZxcKrqFXrZsW6hWqyhCgc1+rAoKJaSqgvjv+2aSEAJUW3Ul9B0qk9F7Mx7z7Bk7+5HHm0T6GI6RllQYjrH4M5p+VjUmz9tlEnRlP98u0g2AlHfDoXyKl1nSCatZUWdX+EHRl8XHIBS2kPwpEcniS7ArPgXFSBZjhITU8N0CKSFtwEED7zlO6KZ0Kgt4BOwDAz4AztPVOs6y0vE5CIuJFPQ37zmZoFilPxNRrsAcKbNncsziLfaSLZ7XVSTLH9PveTVXRXtZ9Eu1g1ot/Uul1mnUEizVErqgljbxVrXJ439Jls8uSfWj/R4n/hVip0FIur810DRwHOyE0pYINMgo2MEqcvVs+ELRZV1EVZvaoG5NHBC/Ilq3Jupem7qgpibeccw1lNmrCeWh5UpCWUcTW3me1VLqWaTUrgnpPIqR0obapk19UK8iDq3q1KS1e8N7xI0oCSnVNSGl1Z8b3l9N3FLlu3oNt72k2xJqXBJKi6IeD6iHprDi0h+6RWiSf+o0lHnmJCWnTp92cepUXMxz7/kCUDbkfrHZTtBPsnDYfmBrse2xveU5A7b3bG/YarYuz/GoI/+wZ4+btTyiv5MjHA9F9w226HvSViiS86rE0EYHnwz07f/JE3VCMc43T/E8weswwDvRHaWbVbwEG+WrWbJp+HgRrxOB93nfEb8Ef9T4eIb/PdlXf7Lp9K0rX4K33skQJ3u4P7K4k2KdT+PpPEV34fgojGt2OfBK3u/DVz8D3PtD5aPOCw==",
    },
    {
      url: "https://puzz.link/p?compass/10/10/j.222h.112i2122t1211g2212g11.1i2222m2222t2111g222.g2222h2212q1222l2221k111.2..2l1.21h",
      test: false,
    },
  ],
};
