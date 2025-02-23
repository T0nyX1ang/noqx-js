/** The Nurimisaki solver. */

function avoid_unknown_misaki(known_cells, color = "black", adj_type = 4) {
  /**
   * Generate a constraint to avoid dead ends that does not have a record.
   * A grid rule and an adjacent rule should be defined first.
   */
  const included = Array.from(known_cells).map(([src_r, src_c]) => `|R - ${src_r}| + |C - ${src_c}| != 0`).join(", ");

  const main = `:- grid(R, C), ${color}(R, C), #count { R1, C1: ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1) } = 1`;

  if (!known_cells.size) {
    return `${main}.`;
  }
  return `${main}, ${included}.`;
}

modules["nurimisaki"] = {
  name: "Nurimisaki",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c());
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("not black"));
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(avoid_rect(2, 2, "not black"));
    solver.add_program_line(count(["gt", 0], "black", "grid"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      solver.add_program_line(`not black(${r}, ${c}).`);
      solver.add_program_line(count_adjacent(1, [r, c], "not black"));

      if (Number.isInteger(num)) {
        solver.add_program_line(bulb_src_color_connected([r, c], "not black"));
        solver.add_program_line(count_reachable_src(num, [r, c], "bulb", "not black"));
      }
    }

    const all_src = get_all_src(puzzle.text);
    solver.add_program_line(avoid_unknown_misaki(all_src, "not black"));

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
      data: "m=edit&p=7VVRj5pAEH7nV5h5ngeWBcR9s97ZF8u11eZyIcQg5XLkoFiQplnjf7/ZgYSIPrQPtUnT4H759ptZ+BidsfneJnWGQpiPDNBGYuh6Pi8hHF52f23yQ5GpCc7bw0tVE0F8WC7xOSmazIr6rNg66pnSc9TvVQQCEBxaAmLUn9RRf1A6RL2mEKBL2qpLcojeD/SR44YtOlHYxMOO+0SfiKZ5nRbZdkVRUj6qSG8QzHPe8WlDoax+ZND7MPu0Kne5EXbJgV6mecn3faRpv1avbZ8r4hPqeWd3fcWuHOwa2tk17I/ZLfbVNaOz+HSign8mq1sVGddfBhoMdK2OhKE6gpzSUR/97jsBz6atHLauufGEXPfCdHYWD7xRXIjxCeHIC8U8c7iJkGKc4ZmMM8UfnZleZATnCr2f4Ld8YlwyOowbKgJqyXjHaDN6jCvOuWd8ZFwwuow+50xNGX+x0CAdUC6CG4ByuqrfwFskqVmvXN6/q8ZWBOu2fk7SjHojbMtdVk/Cqi6TAmgMnSz4Cbzod0RT7f9kuvlkMsW3f2s+/f0ujqiu1Ev6AWHfbpNtWhVAf2todDe40G/unlodvrV1XuZN8ppDbL0B",
    },
    {
      url: "https://puzz.link/p?nurimisaki/15/15/v.h.h.h.h.zr.j.h.i.zk.l.q.m.j.l.r.i.i.i.zr.h.h.h.h.v",
      test: false,
    },
    {
      url: "https://puzz.link/p?nurimisaki/22/15/j.zj3j.h.v.n.g..k3q4z4l.l2w3n4h.u5g3o3k.m.h.g4u.p.k3h.j.p3n.i3k.t.u4o.h3h.g3r4",
      test: false,
    },
  ],
};
