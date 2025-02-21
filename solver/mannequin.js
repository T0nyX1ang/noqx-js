/** The Mannequin Gate solver. */

function distance_in_area(grid_size) {
  const [r, c] = grid_size;
  let rule = "dist(R, C, R, C, -1) :- grid(R, C).\n";
  rule += "dist(R, C, R0, C0, N) :- grid(R, C), grid(R0, C0), dist(R0, C0, R, C, N).\n";
  // The following r + c upper bound is not rigorous.
  // TODO Actually it's better to pre-calculate the distance in javascript for this puzzle.
  rule += `dist(R, C, R0, C0, N) :- grid(R, C), grid(R0, C0), N < ${
    r + c
  }, (R0, C0) != (R, C), area(A, R, C), area(A, R0, C0), N - 1 = #min{ N1 : adj_4(R0, C0, R1, C1), area(A, R1, C1), dist(R, C, R1, C1, N1) }.`;
  return rule.trim();
}

function mannequin_constraint(color = "black") {
  let rule = `area_num(A, N) :- area(A, R0, C0), area(A, R1, C1), ${color}(R0, C0), ${color}(R1, C1), (R0, C0) < (R1, C1), dist(R0, C0, R1, C1, N).\n`;
  rule += ":- area(A, _, _), area_num(A, N0), area_num(A, N1), N0 < N1.\n";
  rule += ":- area_adj_4(A1, A2), area_num(A1, N), area_num(A2, N).";
  return rule.trim();
}

modules["mannequin"] = {
  name: "Mannequin Gate",
  category: "shade",
  aliases: ["mannequingate", "manekingeto"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(area_adjacent());
    solver.add_program_line(distance_in_area([puzzle.row, puzzle.col]));
    solver.add_program_line(mannequin_constraint("gray"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(count(2, "gray", "area", i));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(`area_num(${i}, ${num}).`);
        }
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
      data: "m=edit&p=7VRBb9pMEL3zK6I9z2F3bRrbl4qm8F0oaQtVFFkWMsRpUKHmM7iqFvHf82a8liuVKGkjcaoWj57fzozfzA67+7/Oq4L6WEFEmgyWtZE8oeZfu2ar/bpILmhQ7x/KCoDoejSi+3y9K3qp98p6BxcnbkDuvyRVRpGyeIzKyH1KDu5D4obkpthSFIEbN04WcNjBG9lndNWQRgNPPAa8BVyuquW6mI8b5mOSuhkp/s47iWaoNuWPQnkd/L4sN4sVE4t8j2J2D6ut39nVd+W32vua7Ehu0MidnpAbdHIZNnIZnZDLVbxe7npbnhIaZ8cjGv4ZUudJyqq/dDDq4DQ5wE6Sg7KaQwOoaE5F2aAt2hPhJRNvO6IvIbolkMhIuluxI7FW7AxfIxeIfS9Wi+2LHYvPECLiEC3Cdy0S6oCMsQ02FtjzhvnQ+8TAUCEYA/or1j5Wc6zxsezT5oyAY4+RhxvA2GLUrfe38Lfe3yIP96TlA+8fwD/gPKjhRiq5EhuKfSMVXnK3X3gechJIbJEzag7n9Z19VlvKZfvVfxnKeqma1tV9viwwgsO7r8XFpKw2+Rpvk3qzKKr2Hf/9Y0/9VPKkOD8K/10HZ78OuPn6jy6FM8zdM3JSjEF7K5C7JrWt5/l8WWLG0DvZbS+KJ7b/PnhKNn6C17/xZ+8b/rLqe12tFmWtst4j",
    },
  ],
};
