/** The Nuri-uzu solver. */

function nuriuzu_constraint(glxr, glxc, adj_type = 4, color = "black") {
  /**
   * Generate a constraint for spiral galaxies.
   */
  const r = Math.floor((glxr - 1) / 2);
  const c = Math.floor((glxc - 1) / 2);
  const tag = tag_encode("reachable", "grid", "src", "adj", adj_type, color);
  const rule = `:- grid(R, C), ${tag}(${r}, ${c}, R, C), not ${tag}(${r}, ${c}, ${glxr} - R - 1, ${glxc} - C - 1).`;
  return rule.trim();
}

modules["nuriuzu"] = {
  name: "Nuri-uzu",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(avoid_rect(2, 2, "not black"));

    const reachables = [];
    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      fail_false(symbol_name.startsWith("circle_SS"), "Invalid symbol type.");

      // there are no category = 1 for nuriuzu, because it is conflicting with the no 2x2 white rule.
      if (d === BaseDir.CENTER.description) {
        reachables.push([r, c]);
        solver.add_program_line(nuriuzu_constraint(r * 2 + 1, c * 2 + 1, 4, "not black"));
        solver.add_program_line(`not black(${r}, ${c}).`);
      }

      if (d === BaseDir.TOP.description) {
        reachables.push([r - 1, c]);
        solver.add_program_line(nuriuzu_constraint(r * 2, c * 2 + 1, 4, "not black"));
        solver.add_program_line(`not black(${r - 1}, ${c}).`);
        solver.add_program_line(`not black(${r}, ${c}).`);
      }

      if (d === BaseDir.LEFT.description) {
        reachables.push([r, c - 1]);
        solver.add_program_line(nuriuzu_constraint(r * 2 + 1, c * 2, 4, "not black"));
        solver.add_program_line(`not black(${r}, ${c - 1}).`);
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    fail_false(reachables.length > 0, "Please provide at least one clue.");
    for (const [r, c] of reachables) {
      const excluded = reachables.filter(([r1, c1]) => r1 !== r || c1 !== c);
      solver.add_program_line(grid_src_color_connected([r, c], null, excluded, "not black", 4));
    }

    const tag = tag_encode("reachable", "grid", "src", "adj", 4, "not black");
    const spawn_points = reachables.map(([r, c]) => `not ${tag}(${r}, ${c}, R, C)`).join(", ");
    solver.add_program_line(`:- grid(R, C), not black(R, C), ${spawn_points}.`);

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
      data: "m=edit&p=7VZRb5swEH7Pr5ju+R4wmAR4y7quL126jUxVhVDkULdBoyKDMFWO8t97PpiQViNNm7buoXL86eO7s/mwrXPab51qNIrQ/oIIPRTU5l7EXUT0TP1HW5eHSidvcNkddnVDBPFqhXeqavUsG5Ly2dHEiVmiuUgy8AG5C8jRfEqO5kNiUjQphQAlaZfEBKBP9Hyk1xy37KwXhUd8NXCiN0SLsikqvUnTXvqYZGaNYF/0lodbCg/1dw39OH4u6odtaYWtOtDHtLtyP0Ta7rb+2g25Ij+hWf7k1/oZ/AajX0t7v5Y5/Nphf+5X397rttu6zMb56USr/pnsbpLMOv8y0mikaXIkXDEKxpvkCKGkaQS9abRHjiEK3fLCKQsxd+uRN6G75/E9t5vAi536IhJum96E/ditx4H7vfHE/PHEPMIPoomAnAqE7k8Tge9aO9q197x3PuOathZNwPiO0WMMGS8555zxmvGMUTLOOWdhD8cvHh+QZEkiSFoV//lZ+kveMtmXpalGxes1+n9H81kGadfcqUJTBUt3aq+BborTDB6BexZQmny9PF7m8rA74P32FfIyJSmjtaXCYK4Q9t1GbYq6Avr7gayLZ/o/d091C9p92ajqXlXqsdQt5LMn",
    },
    { url: "https://puzz.link/p?nuriuzu/10/10/iaaeztepexewezwepexewezzseezzj", test: false },
  ],
};
