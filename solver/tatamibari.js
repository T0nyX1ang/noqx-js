/** The Tatamibari solver. */

function tatamibari_cell_constraint(op, src_cell) {
  /**
   * Generate a cell relevant constraint for tatamibari.
   */
  const tag = tag_encode("reachable", "bulb", "src", "adj", "edge", null);
  const rop = reverse_op(op);

  const [src_r, src_c] = src_cell;
  const count_r = `#count { R: ${tag}(${src_r}, ${src_c}, R, C) } = CR`;
  const count_c = `#count { C: ${tag}(${src_r}, ${src_c}, R, C) } = CC`;

  return `:- ${count_r}, ${count_c}, CR ${rop} CC.`;
}

modules["tatamibari"] = {
  name: "Tatamibari",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.text.size > 0, "No clues found.");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_rect_region());
    solver.add_program_line(`:- { upleft(R, C) } != ${puzzle.text.size}.`);
    solver.add_program_line(avoid_region_border_crossover());

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`clue(${r}, ${c}).`);
      solver.add_program_line(bulb_src_color_connected([r, c], null, "edge"));

      if (clue === "+") {
        solver.add_program_line(tatamibari_cell_constraint("eq", [r, c]));
      } else if (clue === "-") {
        solver.add_program_line(tatamibari_cell_constraint("lt", [r, c]));
      } else if (clue === "|") {
        solver.add_program_line(tatamibari_cell_constraint("gt", [r, c]));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    const tag = tag_encode("reachable", "bulb", "src", "adj", "edge", null);
    solver.add_program_line(
      `:- clue(R, C), clue(R, C), (R, C) != (R1, C1), ${tag}(R, C, R, C1), ${tag}(R1, C1, R, C1).`
    );
    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRRb9MwEH7Pr5j8yiHZcdo6fkFltLyUDGjRNEVRlXaBVbTKSBqEXPLfdz6H1YQihCYGD8jNpy/fne0v557rT01eFRDjkAo4CBxScXpUZH+8G4vNflvoMxg3+5uyQgJwMZ3C+3xbF0HaZWXBwcTajMG81CkLGdAjWAbmjT6YV9okYOYYYiBQmyETDEKkkyO9pLhl504UHHnScaRXSNebar0tljOnvNapWQCz+zyn2ZayXfm5YG4ava/L3WpjhVW+x4+pbza3XaRursuPTZcrshbM2NmdnLArj3YtdXYt+1N2i+sPRd2sTnmNs7bFmr9Ft0udWuPvjlQd6VwfEBN9YKGyU7+iEXcwTHIrPPWE0ArPPCGywhNPGPbWGPQzhrSGl6FoF29R1Z+iyJiXITht46UI0Z8knNnvFMrxthbOrr+y7BdBROTvfh0slqCSXRFOCUPCBVYUjCR8QcgJB4QzypkQXhKeE0aEQ8oZ2TP5rVN7uB08M6xCrPDwRlggSwR2t4hHTEvksYCQY0D+0ncaKrom/DH4t5QsSNkEm+YsKatdvsXGSZrdqqi+veM11QbsC6MnlTgl+n9z/Y2by9afP3InPLQxUyztfe+AuQB22yzz5brE/xnWz4W7djodxlb8SWAU/RB49K/HDs+COw==",
    },
  ],
};
