/** The Box solver. */

function count_box_col(target, c, color = "black") {
  /**
   * Generate a rule to count the number of 'boxes' in each column.
   */
  return `:- #sum { N, R: box_col(R, N), ${color}(R, ${c}) } != ${target}.`;
}

function count_box_row(target, r, color = "black") {
  /**
   * Generate a rule to count the number of 'boxes' in each row.
   */
  return `:- #sum { N, C: box_row(C, N), ${color}(${r}, C) } != ${target}.`;
}

modules["box"] = {
  name: "Box",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c());

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);

      if (r === -1 && c >= 0 && c < puzzle.col) {
        solver.add_program_line(count_box_col(num, c, "black"));
      }

      if (r === puzzle.row && c >= 0 && c < puzzle.col) {
        solver.add_program_line(`box_row(${c}, ${num}).`);
      }

      if (c === -1 && r >= 0 && r < puzzle.row) {
        solver.add_program_line(count_box_row(num, r, "black"));
      }

      if (c === puzzle.col && r >= 0 && r < puzzle.row) {
        solver.add_program_line(`box_col(${r}, ${num}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display());
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVBj5s8EL3zK1Y+zwFjA4Zbut30kma/r0m1WiEUEcpqoxKxJaGqHOW/73gMwS09tIfu9lARj14eb5w3Hts5fOmKtgLOzUco8AERyDCiwXlAw++f9e5YV+kVzLrjY9MiALidz+GhqA+Vl5lMfHLvpJNUz0C/SzPGGbAAB2c56P/Tk36f6iXoFb5iIJBbWFGA8GaEd/TeoGtLch/xsscI7xGWu7asq83CMv+lmV4DM7/zhrINZPvma8V6H+Z72ey3O0NsiyMWc3jcPfVvDt2n5nPXa3l+Bj2zdleDXTnaNc57uwZauwb9xK6p4g/bTfLzGZf9AxrepJnx/nGEaoSr9IRxmZ6YEJQaohnbHCakYQLhMKFhhO8w0UQTTxhFjDtz8qNG+hOGExM5DM3MzWL2TGgZBlFPRAERcpTExOCGGySxzXHcKGLwpwdJYmfBpEHCfaJw3kHD/YkbzonCmS+igNKcGrgYmIvGLhgu5CiylcaOKKS070S2VuWIoulMttrEESnbZ5exfXYZ22eXoT679dtVc4tV1Ge3NEV9dutIqM+u6YT6fHGIu5HTnrynOKcYUFzjlgUtKL6l6FMMKS5Ic0PxjuI1RUkxIk1sNv0vHgsmsZwAdx3WIO0ZeQFvmVT20nSe+O9ici9jq659KMoKb55lt99W7dWyafdFzfCqP3vsG6ORCfPP8e/2f6Xb37TA/63/gNc/exmurkxA3wJ76jbFpmxqBrh2xKsJ/+Lu8YDm3jM=",
    },
  ],
};
