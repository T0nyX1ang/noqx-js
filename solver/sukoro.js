/** The Sukoro solver. */

function num_count_adjacent(color = "black", adj_type = 4) {
  /**
   * Generate a constraint for counting the number of adjacent black cells.
   */
  return `:- number(R, C, N), N != #count { R1, C1 : adj_${adj_type}(R, C, R1, C1), ${color}(R1, C1) }.`;
}

modules["sukoro"] = {
  name: "Sukoro",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(fill_num(Array.from({ length: 5 }, (_, i) => i), "grid", "A", "white")); // prettier-ignore
    solver.add_program_line(invert_c("white", "black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(num_count_adjacent("black"));
    solver.add_program_line(avoid_num_adjacent());

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
      data: "m=edit&p=7VRNb9pAEL37V0Rz3oPXuxjjG02hF+q0hSpClmUZ6goUkKnBVbSI/56ZsdVlIzikahpVqux9vPnY4Xn2Y/+jKepSSJ9eFQn8xUfLiEcQhTz87pmtD5syvhHD5rCqaiRC3I3H4nux2Zde2mVl3tEMYjMU5kOcggQBAQ4JmTCf46P5GJtEmCmGQEj0TdqkAOnI0nuOE7ttndJHnnQc6Rzpcl0vN2U+aT2f4tTMBND/vOPZRGFb/Syh00H2stou1uRYFAf8mP1qvesi++Zb9dB0uTI7CTN8JldbucrKJdrKJXZBLn0Fya0e89ErSB1kpxO2/AuKzeOUdH+1NLJ0Gh8Rk/gISuJUhevMqwJKoUnL3pkDx9RkBr/MHs210dB3SoWBE+3TXBuVfuTUkoFbTCqqdm6TsrP5qu/GdejW6z233U+RoT6LYzMkt2TOOGYMGGfYMWEU43tGn7HHOOGcEeM94y2jZgw5p089f9GqnMuBrhF2y4Am6dp6XklxqtobwH16/54v81JImu2irG+Sqt4WGzw601WxKwHvp5MHj8CDd5f+f2W9wZVF7fd/+4i8zYlNzVTgCTF3AnZNXuTLCvcV9o38Wl/2X8t/qf9a/cv++ZU686v5f8D/11cLLyzcWQ9VXUHmPQE=",
    },
    {
      url: "https://puzz.link/p?sukoro/11/11/p2324d14e3b2b3g3b1h31c13h2b3g1b2b1e23d1434p",
      test: false,
    },
  ],
};
