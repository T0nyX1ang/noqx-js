/** The Simplegako solver. */

function simplegako_fill_constraint() {
  /**
   * Generate a constraint for the number filling in simplegako.
   */
  return ":- number(R, C, N), RC = #count { R1 : number(R1, C, N) }, CC = #count { C1 : number(R, C1, N) }, N != RC + CC - 1.";
}

modules["simplegako"] = {
  name: "Simplegako",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(fill_num(Array.from({ length: puzzle.row + puzzle.col }, (_, i) => i + 1)));
    solver.add_program_line(simplegako_fill_constraint());

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
      data: "m=edit&p=7VNNb6MwEL3zKyKf54BtIIlv2TTpJaUfSRVFCEUkpQoqiC2EqjLiv2c80CJV28NW2m0O1WieHs9j/AYz5XMVFTF4GHIENnAM4XmU3HEo7S5WyTGN1QAm1fGQF0gArudzeIzSMraCriq0aj1WegL6UgWMM2ACk7MQ9K2q9ZXSPuglLjHgqC3aIoF01tM1rRs2bUVuI/c7jnSDdJ8U+zTeLlrlRgV6Bcyc84t2G8qy/CVmnQ/zvM+zXWKEXXTEZspD8rtbKauH/KnqannYgJ58blf2dg1t7Rr2B7umi39sdxw2DX72OzS8VYHxft/TUU+Xqkb0Vc2EZ7YO0Ut7N0yKt9Y7wZEfBNcxguwFzzWC0wtDeum7gEdxOnBDOCcUhCv0A1oSXhDahC7hgmpmhGvCKaFD6FHN0HT0Vz3/BzuBEDRAbbhf56EVML/KdnEx8PMii1KGY9VY7JVRBhKLnJ9J+6ZJM1dgn9u/d252cBpC6wQ=",
    },
  ],
};
