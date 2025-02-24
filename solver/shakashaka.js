/** The Shakashaka solver. */

function shaka() {
  /**
   * Generate a constraint to force rectangles.
   * A grid rule should be defined first.
   */
  let definition = "white_down(R, C) :- grid(R, C), white(R, C).\n";
  definition += 'white_down(R, C) :- grid(R, C), triangle(R, C, "ul").\n';
  definition += 'white_down(R, C) :- grid(R, C), triangle(R, C, "ur").\n';
  definition += "white_right(R, C) :- grid(R, C), white(R, C).\n";
  definition += 'white_right(R, C) :- grid(R, C), triangle(R, C, "ul").\n';
  definition += 'white_right(R, C) :- grid(R, C), triangle(R, C, "dl").\n';

  let rule_rect = "rect_ul(R, C) :- grid(R, C), white(R, C), not white_down(R - 1, C), not white_right(R, C - 1).\n";
  rule_rect += "rect_l(R, C) :- grid(R, C), white(R, C), rect_ul(R - 1, C), not white_right(R, C - 1).\n";
  rule_rect += "rect_l(R, C) :- grid(R, C), white(R, C), rect_l(R - 1, C), not white_right(R, C - 1).\n";
  rule_rect += "rect_u(R, C) :- grid(R, C), white(R, C), rect_ul(R, C - 1), not white_down(R - 1, C).\n";
  rule_rect += "rect_u(R, C) :- grid(R, C), white(R, C), rect_u(R, C - 1), not white_down(R - 1, C).\n";
  rule_rect += "remain(R, C) :- grid(R, C), rect_l(R, C - 1), rect_u(R - 1, C).\n";
  rule_rect += "remain(R, C) :- grid(R, C), rect_l(R, C - 1), remain(R - 1, C).\n";
  rule_rect += "remain(R, C) :- grid(R, C), remain(R, C - 1), rect_u(R - 1, C).\n";
  rule_rect += 'remain(R, C) :- grid(R, C), remain(R, C - 1), remain(R - 1, C), not triangle(R, C, "dr").\n';

  let rule_slant =
    'slant_ul(R, C) :- grid(R, C), triangle(R, C, "ul"), triangle(R, C+1, "ur"), triangle(R+1, C, "dl").\n';
  rule_slant +=
    'slant_ul(R, C) :- grid(R, C), triangle(R, C, "ul"), triangle(R, C+1, "ur"), triangle(R+1, C-1, "ul").\n';
  rule_slant +=
    'slant_ul(R, C) :- grid(R, C), triangle(R, C, "ul"), triangle(R+1, C, "dl"), triangle(R-1, C+1, "ul").\n';
  rule_slant +=
    'slant_ul(R, C) :- grid(R, C), triangle(R, C, "ul"), triangle(R-1, C+1, "ul"), triangle(R+1, C-1, "ul"), white(R+1, C), white(R, C+1).\n';
  rule_slant += 'slant_ur(R, C) :- grid(R, C), triangle(R, C, "ur"), triangle(R, C-1, "ul"), triangle(R+1, C, "dr").\n';
  rule_slant +=
    'slant_ur(R, C) :- grid(R, C), triangle(R, C, "ur"), triangle(R, C-1, "ul"), triangle(R+1, C+1, "ur").\n';
  rule_slant +=
    'slant_ur(R, C) :- grid(R, C), triangle(R, C, "ur"), triangle(R+1, C, "dr"), triangle(R-1, C-1, "ur").\n';
  rule_slant +=
    'slant_ur(R, C) :- grid(R, C), triangle(R, C, "ur"), triangle(R-1, C-1, "ur"), triangle(R+1, C+1, "ur"), white(R+1, C), white(R, C-1).\n';
  rule_slant += 'slant_dl(R, C) :- grid(R, C), triangle(R, C, "dl"), triangle(R, C+1, "dr"), triangle(R-1, C, "ul").\n';
  rule_slant +=
    'slant_dl(R, C) :- grid(R, C), triangle(R, C, "dl"), triangle(R, C+1, "dr"), triangle(R-1, C-1, "dl").\n';
  rule_slant +=
    'slant_dl(R, C) :- grid(R, C), triangle(R, C, "dl"), triangle(R-1, C, "ul"), triangle(R+1, C+1, "dl").\n';
  rule_slant +=
    'slant_dl(R, C) :- grid(R, C), triangle(R, C, "dl"), triangle(R-1, C-1, "dl"), triangle(R+1, C+1, "dl"), white(R-1, C), white(R, C+1).\n';
  rule_slant += 'slant_dr(R, C) :- grid(R, C), triangle(R, C, "dr"), triangle(R, C-1, "dl"), triangle(R-1, C, "ur").\n';
  rule_slant +=
    'slant_dr(R, C) :- grid(R, C), triangle(R, C, "dr"), triangle(R, C-1, "dl"), triangle(R-1, C+1, "dr").\n';
  rule_slant +=
    'slant_dr(R, C) :- grid(R, C), triangle(R, C, "dr"), triangle(R-1, C, "ur"), triangle(R+1, C-1, "dr").\n';
  rule_slant +=
    'slant_dr(R, C) :- grid(R, C), triangle(R, C, "dr"), triangle(R-1, C+1, "dr"), triangle(R+1, C-1, "dr"), white(R-1, C), white(R, C-1).\n';
  rule_slant += "remain(R, C) :- grid(R, C), slant_ul(R, C-1), slant_ul(R-1, C).\n";
  rule_slant += "remain(R, C) :- grid(R, C), slant_dl(R, C-1), slant_dl(R+1, C).\n";
  rule_slant += "remain(R, C) :- grid(R, C), slant_ur(R, C+1), slant_ur(R-1, C).\n";

  let constraint = ':- grid(R, C), triangle(R, C, "ul"), not slant_ul(R, C).\n';
  constraint += ':- grid(R, C), triangle(R, C, "ur"), not slant_ur(R, C).\n';
  constraint += ':- grid(R, C), triangle(R, C, "dl"), not slant_dl(R, C).\n';
  constraint += ':- grid(R, C), triangle(R, C, "dr"), not slant_dr(R, C).\n';
  constraint += ":- grid(R, C), remain(R, C), not white(R, C).\n";
  constraint +=
    ":- grid(R, C), white(R, C), not rect_ul(R, C), not rect_l(R, C), not rect_u(R, C), not remain(R, C).\n";

  data = definition + rule_rect + rule_slant + constraint;
  return data.trim();
}

function shade_shaka() {
  /**
   * Generate a constraint to shade the cells in shakashaka.
   */
  return '{white(R, C); triangle(R, C, "ul"); triangle(R, C, "ur"); triangle(R, C, "dl"); triangle(R, C, "dr")} = 1 :- grid(R, C), not black(R, C).';
}

modules["shakashaka"] = {
  name: "Shakashaka",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(shade_shaka());
    solver.add_program_line(shaka());

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(`:- #count{ R, C: adj_4(${r}, ${c}, R, C), triangle(R, C, _) } != ${num}.`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    solver.add_program_line(display("triangle", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNi9swEL37V4Q5z8HyVxzd0u2ml222bVKWIExQsl5sNsGpHZeikP++o5GJU9jSQotpoSh68zSjj6fJWM2XVtc5Ct/+whTJUotEyj1IE+5+15blcZfLEU7bY1HVRBDvZzN80rsm91Q3K/NOZiLNFM07qSAA5C4gQ/NRnsx7aVZoFhQCjMh3R0wABkRve/rAcctunFP4xOcdJ7oieqxLN/gglVki2CPe8EJLYV99zcGt4PG22m9K69joI92jKcpDF2nax+q57eaK7Ixm+mOlYa/UUqfUsleU2gv8jtKm0M/6NZGT7HymPH8imWuprOLPPU17upAniH2QEcI4ZjMJ2Ag/6uzE2Th1NrFxWjnvVqoAx+7v4x2UuAztTgpGcHHwnlcTeO+r9XzGddyedRnTmUKeCFeMM8aAcUmXQRMyvmX0GWPGO55zy/jAeMMYMSY8Z2zT8YsJc5cfQI4K3ef2fYv/PV/mKVi09ZPe5lSs83a/yevRvKr3ekfjRaEPOdCzcPbgG3BXoX1l/r8UQ70UNuf+31b+P5GjKKf0gZh7hEO71uttRcVEGfuTfpEM7h88y/TOuOpwJZJ5Lw==",
    },
    {
      url: "https://puzz.link/p?shakashaka/30/30/kcodzzzgchbjbgbgbgbzzzobmcclbhblbobr.zkbncczzpbobgbgbscvczzu.lbgbgbobzgddkcsbzzndibiddbjbkcw.ztbzpbhbgbgbgb.zwbzgczzhegdobycgdlbhdx",
      test: false,
    },
  ],
};
