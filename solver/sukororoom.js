/** The Sukoro Room solver. */

function sukororoom_num_count_adjacent(color = "black", adj_type = 4) {
  /**
   * Generate a constraint for counting the number of adjacent black cells.
   */
  return `:- number(R, C, N), N != #count { R1, C1 : adj_${adj_type}(R, C, R1, C1), ${color}(R1, C1) }.`;
}

modules["sukororoom"] = {
  name: "Sukoro Room",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(fill_num(Array.from({ length: 5 }, (_, i) => i), "grid", "A", "white")); // prettier-ignore
    solver.add_program_line(invert_c("white", "black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(sukororoom_num_count_adjacent("black"));
    solver.add_program_line(unique_num("black", "area"));
    solver.add_program_line(area_same_color("black"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "ox_E__1") {
        solver.add_program_line(`not white(${r}, ${c}).`);
      }
      if (symbol_name === "ox_E__4" || symbol_name === "ox_E__7") {
        solver.add_program_line(`white(${r}, ${c}).`);
      }
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZRPb9pAEMXvfIpoz3vYP6Zg30gKvaSkDVQRWlnIJG5BAZkCrqJFfPe8Ga8xVROljZScqsWjn59nx29nF29/ltkml20M25VKagxjunxFin71GC92yzw5k71yNy82ACmvBgP5PVtu85YLWWlr7+PE96T/lDihhRQGlxap9F+Tvf+c+L70IzwSUkO7rJIMsN/gDT8nuqhErcDDwMAJsHiYnld3XxLnx1LQO855JqFYFb9yETzQ/W2xmi1ImGU7LGQ7X6zDk215V9yXIVenB+l7ldXhE1ZtY5Wwskr0hFVaQbDafwOrcXo4oN3XMDtNHPn+1mC3wVGyRxwme2EMTbXwUu2JiBQJ2KJaaHd/y8A8zbMnHAccDccxiktvOX7kqDi2OV5yTh/v1AqHSmmRGFRUOF4KJpgN2DLH0RG1iqXWsEWsMVXHgaGbWkeZU9Z1Sduw6SAHq2HugkMdg5pHhm47J3qwaVDThvoWuq3z6b11fdg3wbOFTq2s2YYcTTmhJrEO+Zp8RsEz1l7rxKrdtEfTXPTxhrt5wTHi+IG73KEN/qcjcLqhglrosNHH8ymoMS5qlNft+YuOHTU7jPbfUdpyon/3Iz8bFptVtsT/YViuZvmmuR/Ns3Uu8AE6tMSD4MuhzzL6/016528StV69+li+0Zl7wY7zE4lT6a+kWJfTbHpb4Eyhb6zHz+jP5f+pv/tq8SfDztwXG4xiJdLWIw==",
    },
    { url: "https://puzz.link/p?sukororoom/10/10/nrnfdbp5timpmpdnns4svecvuufnvsbvtst7g1zzzn", test: false },
  ],
};
