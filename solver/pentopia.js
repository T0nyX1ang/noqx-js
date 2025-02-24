/** The Pentopia solver. */

function avoid_adjacent_omino(num = 5, color = "black") {
  /**
   * Generates a constraint to avoid adjacent ominos.
   * An adjacent rule, an omino rule should be defined first.
   */
  const tag = tag_encode("belong_to_shape", "omino", num, color);
  return `:- adj_x(R, C, R1, C1), ${tag}(R, C, T, _), ${tag}(R1, C1, T1, _), T != T1.`;
}

function opia_constraint(r, c, mask, lmt, color = "black") {
  /**
   * Generate a constraint for opia-like puzzles.
   */
  const [m_t, m_l, m_b, m_r] = mask;
  const cmp = `N ${m_t ? "=" : "<"} N1, N ${m_b ? "=" : "<"} N2, N ${m_l ? "=" : "<"} N3, N ${m_r ? "=" : "<"} N4`;

  let top = `top(${r}, ${c}, ${r} - Mt) :- Mt = #max { R: grid(R, ${c}), ${color}(R, ${c}), R <= ${r} }, grid(Mt, _).\n`;
  top += `top(${r}, ${c}, ${lmt}) :- Mt = #max { R: grid(R, ${c}), ${color}(R, ${c}), R <= ${r} }, not grid(Mt, _).\n`;

  let bottom = `bottom(${r}, ${c}, Mb - ${r}) :- Mb = #min { R: grid(R, ${c}), ${color}(R, ${c}), R >= ${r} }, grid(Mb, _).\n`;
  bottom += `bottom(${r}, ${c}, ${lmt}) :- Mb = #min { R: grid(R, ${c}), ${color}(R, ${c}), R >= ${r} }, not grid(Mb, _).\n`;

  let left = `left(${r}, ${c}, ${c} - Ml) :- Ml = #max { C: grid(${r}, C), ${color}(${r}, C), C <= ${c} }, grid(_, Ml).\n`;
  left += `left(${r}, ${c}, ${lmt}) :- Ml = #max { C: grid(${r}, C), ${color}(${r}, C), C <= ${c} }, not grid(_, Ml).\n`;

  let right = `right(${r}, ${c}, Mr - ${c}) :- Mr = #min { C: grid(${r}, C), ${color}(${r}, C), C >= ${c} }, grid(_, Mr).\n`;
  right += `right(${r}, ${c}, ${lmt}) :- Mr = #min { C: grid(${r}, C), ${color}(${r}, C), C >= ${c} }, not grid(_, Mr).\n`;

  let rule = top + bottom + left + right;
  rule += `opia(${r}, ${c}) :- top(${r}, ${c}, N1), bottom(${r}, ${c}, N2), left(${r}, ${c}, N3), right(${r}, ${c}, N4), ${cmp}.\n`;
  rule += `:- not opia(${r}, ${c}).`;

  return rule;
}

modules["pentopia"] = {
  name: "Pentopia",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_adjacent_omino(5, "black"));

    solver.add_program_line(all_shapes("omino_5", "black"));
    for (const [i, o_type] of Object.keys(OMINOES[5]).entries()) {
      const o_shape = OMINOES[5][o_type];
      solver.add_program_line(general_shape("omino_5", i, o_shape, "black", "grid", 4));
      solver.add_program_line(count_shape(["le", 1], "omino_5", i, "black"));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "multiple");
      const [symbol, style] = symbol_name.split("__");
      const style_num = parseInt(style);
      validate_type(symbol, "arrow_cross");
      solver.add_program_line(`not black(${r}, ${c}).`);

      // direction order: top, left, bottom, right
      const mask = [
        Boolean(style_num & 64),
        Boolean(style_num & 128),
        Boolean(style_num & 16),
        Boolean(style_num & 32),
      ];
      solver.add_program_line(opia_constraint(r, c, mask, Math.max(puzzle.row, puzzle.col) + 1, "black"));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("black"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZRb9NADH7vr0D3fA+53CW95K2MlZeyAS2aqiiqspCpFZ1Skmagq/rfZ/tSMliOdkhjQkLp2Y7t++w7O1brr01WFVx4+JOaA4dHCU3L1yEtr31mq+26iF/xUbNdlhUInF+Ox/wmW9fFIGm90sHORLEZcfM2TphgnPmwBEu5+RDvzLvYzLmZgolxBbqJdfJBPO/EK7KjdGaVwgP5opVBnIOYVVX5bZFXZV1b5fs4MTPOMNRrAkCR3ZZ3BWtTwfe8vL1eoeI628J56uVq01rq5nP5pWl9RbrnZmQznh4yxozajGWXMYo2Y5R6MsZtmHG+qvJ1sZg8Q7pRut/DzX+EhBdxgrl/6kTdidN4B/SCqCA6j3dMegDTVlAc6g0hfr1iprR1xDY5tEWvo/6B+MC1z1F4Aj1/AnR5yi74EcyhxTx6HiHDUz1VG/34iRRFP+GSRBh00X/jCVUaU618ojMoJTeS6BuiHtGA6IR8zoleET0jqoiG5DPEZjixXZhULFacScgVGB7OBxbRW+jTWwi3CGwISmAaKgo2DUpksAFYZFEiiyI86A/iFkAI0CP3LYRQrV7ZbSKwKCKABlSPO/iZbiiRh257+AT/ni4dJGzaVDdZXsD0mC6zTcFgUu8H7DujlUgc/P+H98sNb6yC98cj/GVGRAK3C58yN5ecbZpFtsjLNcMJhgY97NfDt+wyaIdBqSfuiBwbtHAAeb7DIIJ+wzDq14eh6wyuCL4DCf55PfHQjlSl4zKUI7B04ChH3cLHJ/vrfQqzOh3cAw==",
    },
  ],
};
