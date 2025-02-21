/** The Myopia solver. */

function opia_constraint(r, c, mask, lmt) {
  /**
   * Generate a constraint for opia-like puzzles.
   */
  const [m_t, m_l, m_b, m_r] = mask;
  const cmp = `N ${m_t ? "=" : "<"} N1, N ${m_b ? "=" : "<"} N2, N ${m_l ? "=" : "<"} N3, N ${m_r ? "=" : "<"} N4`;

  let top = `top(${r}, ${c}, ${r} - Mt) :- Mt = #max { R: grid(R, ${c}), edge_top(R, ${c}), R <= ${r} }, grid(Mt, _).\n`;
  top += `top(${r}, ${c}, ${lmt}) :- Mt = #max { R: grid(R, ${c}), edge_top(R, ${c}), R <= ${r} }, not grid(Mt, _).\n`;

  let bottom = `bottom(${r}, ${c}, Mb - ${r}) :- Mb = #min { R: grid(R, ${c}), edge_top(R + 1, ${c}), R >= ${r} }, grid(Mb, _).\n`;
  bottom += `bottom(${r}, ${c}, ${lmt}) :- Mb = #min { R: grid(R, ${c}), edge_top(R + 1, ${c}), R >= ${r} }, not grid(Mb, _).\n`;

  let left = `left(${r}, ${c}, ${c} - Ml) :- Ml = #max { C: grid(${r}, C), edge_left(${r}, C), C <= ${c} }, grid(_, Ml).\n`;
  left += `left(${r}, ${c}, ${lmt}) :- Ml = #max { C: grid(${r}, C), edge_left(${r}, C), C <= ${c} }, not grid(_, Ml).\n`;

  let right = `right(${r}, ${c}, Mr - ${c}) :- Mr = #min { C: grid(${r}, C), edge_left(${r}, C + 1), C >= ${c} }, grid(_, Mr).\n`;
  right += `right(${r}, ${c}, ${lmt}) :- Mr = #min { C: grid(${r}, C), edge_left(${r}, C + 1), C >= ${c} }, not grid(_, Mr).\n`;

  let rule = top + bottom + left + right;
  rule += `opia(${r}, ${c}) :- top(${r}, ${c}, N1), bottom(${r}, ${c}, N2), left(${r}, ${c}, N3), right(${r}, ${c}, N4), ${cmp}.\n`;
  rule += `:- not opia(${r}, ${c}).\n`;

  return rule.trim();
}

modules["myopia"] = {
  name: "Myopia",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row + 1, puzzle.col + 1));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("myopia"));
    solver.add_program_line(fill_path("myopia"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("myopia", "loop"));
    solver.add_program_line(single_loop("myopia"));
    solver.add_program_line(convert_direction_to_edge());

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "multiple");
      const [symbol, style] = symbol_name.split("__");
      const style_num = parseInt(style);
      validate_type(symbol, "arrow_cross");

      // direction order: top, left, bottom, right
      const mask = [
        Boolean(style_num & 64),
        Boolean(style_num & 128),
        Boolean(style_num & 16),
        Boolean(style_num & 32),
      ];
      solver.add_program_line(opia_constraint(r, c, mask, Math.max(puzzle.row, puzzle.col) + 1));
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVRb9owEH7Pr6j8fA92HCDxG+tgLx3dBlOFrChKaTbQQGEJ2SYj/nvPF0O0rSVRq3V7mEw+fdgf9nfnO1J+rdIigwiHDIGDwCFDTk8Y2A93Y7barTN1AcNqt8wLJADX4zF8Stdl5mmnir29iZQZgnmjNJMMmMDHZzGY92pv3iozBzPFJQYC566QocBHOmroDa1bdllPCo584jjSOdK0KPLvyaLIy7KefKe0mQGzR72iDSxlm/xbxupf0vdFvrld2YnbdIfxlMvV1q2U1V3+pXJaER/ADGvHowccy8axpbVjyx5wbAP5846j+HDA5H9Az4nS1v7HhoYNnao94oRQEM7VnvkRboOXaK9fHK8cj/jVM5OBFdaS88JeR2HgdjyJHhW6HVuF/cHx6JZgBv5xxzYhHd0hPaHs6DHqNx7PCgXnHbcUXHRWUobqs8/GI7grjNZcCkGnd1FKSvtPuseUVBudlKcCPhsRlvuYit4nnGFPgJGErwk5YY/wijQjwhvCS8KAsE+age2qJ/fd0+ywXoAZjEIMO5QgbCnJVovaD135NqP3b83Enmaju8/ZxSQvNuka/+Wmy3SbMXypHDz2g9GjMWII/r9n/up7xl4Ef+Gqf24TakzwqWHAXAPbVkmaLHIsNMzi85exK39bePEcYKPH3j0=",
    },
  ],
};
