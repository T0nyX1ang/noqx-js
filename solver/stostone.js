/** The Stostone solver. */

function valid_stostone(color = "black") {
  /**
   * Generate a constraint to enforce a valid stostone dropping.
   * A grid rule should be defined first.
   */
  const below_C = `grid(R, C), ${color}(R, C), #count { R1: grid(R1, C), ${color}(R1, C), R1 < R } = BC`;
  const below_C1 = `grid(R, C + 1), ${color}(R, C + 1), #count { R1: grid(R1, C + 1), ${color}(R1, C + 1), R1 < R } = BC1`;
  return `:- ${below_C}, ${below_C1}, BC != BC1.`;
}

modules["stostone"] = {
  name: "Stostone",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row % 2 === 0, "The stostone puzzle must have an even number of rows.");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent());
    solver.add_program_line(count(parseInt(puzzle.row / 2), "gray", "col"));
    solver.add_program_line(area_color_connected("gray"));
    solver.add_program_line(valid_stostone("gray"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      let flag = true;
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          flag = false;
          solver.add_program_line(count(num, "gray", "area", i));
        }
      }

      if (flag) {
        solver.add_program_line(count(["gt", 0], "gray", "area", i));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      if (d === BaseDir.TOP.description && r > 0 && draw) {
        solver.add_program_line(`:- gray(${r}, ${c}), gray(${r - 1}, ${c}).`);
      }
      if (d === BaseDir.LEFT.description && c > 0 && draw) {
        solver.add_program_line(`:- gray(${r}, ${c}), gray(${r}, ${c - 1}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZdb9MwFH3vr5j87If4K3bygsboeBkd0KFpiqqq6zJW0dLRD4RS9b/vXPtaRYA0EGIICbVxT25Prk98Tt2sP20nq1YqJVUhTZCFBJLWldKqIJ3y8Sj4dTHbzNv6SB5vN3fLFYCU56en8nYyX7e9hlmj3q6r6u5Ydi/rRighhcahxEh2b+pd96ru+rIb4ishFWpniaQB+wd4Gb8ndJKKqgAeMAa8ApzOVtN5Oz5Lldd1011IQfM8j1cTFIvl51awDjqfLhfXMypcTza4mfXd7J6/WW9vlh+2zFWjveyOk9xhlhsOcs1BLsEkl9AP5NJd/GG51Wi/x7K/heBx3ZD2dwcYDnBY7zAO6p0wmi59Bi3JG1FaFByfgqQi9SqOp3HUcbxAJ9mZOL6IYxFHF8ezyOljAq0rqS2aagTAGODA2AJXCVtgl3EpdakYB2DDGH1IHGGngEvG4HjmlBrYM0ZPzz1L9Azc04MTmOOhJ7AeD35gvge/ynwPjFWKGBoq1hCgoWINwUtTMCcEYNYTKmDmVwqY+ZUGZg2VBeZ5q1IaleZFP+DEQT/gpBP9gBPfFE4aXTDGtTpfCz066UFv4KQB/aQhxyOGTpN0oh8wczQ2AOMYQ7NJmo3GXJbnMtBmWRs8NewpegCzNoO5HM9l0N9xf4t6yXX4a9hfXAfMHPhr2F/0AOa5HDR41gCvDXsNLjYtvvcS/QP397SZpXuJGbMZO+CcH/jIOmOWcg4d5S3Nhc9DJkvKHvMpbzmfHnWfc0I5zHVkzHMGKGOeNXho8Ic86Ir5Fficseh1wV6Q15wfZAQZ+MrHnAeNNdG8nhq+ZN81+ujsKWUme0qZyT7i2pwHA0723YBjMofyk72m/GSv4V3OhsWaW/bCQqfNXlMGmOPAccxx0OZYG/nrsu+Y12V/KQOsrcR9xZxgg7mM28xJHG0cy7j9eNrmfnIjFCQwSBHnSrvi7297j2prsNz0F/vti3bef7466jViuF3dTqYt/qX6N+/bo8FytZjMcTbYLq7bVT7HQ8K+J76IeDSGnjn+Pzf8pecGsqD4paeHJ/idPCKnwepaLbtzKe6348l4ukTGsHZUd/67+pOrxw9drDdLvD+2YtR7AA==",
    },
    { url: "https://puzz.link/p?stostone/8/6/r6olfpe0002rg40fvm3", test: false },
    {
      url: "https://puzz.link/p?stostone/18/18/9812a08ig24k9418p0a682gi0k4k515vfs091024c0h31c8oq3a6vqk46h11200000000007vvvo000001u0000fs0051bvbqg00vg001go01ovu7180eagc00s0g66g458gb436g8b8486g4638j",
      test: false,
    },
  ],
};
