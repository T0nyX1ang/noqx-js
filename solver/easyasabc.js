/** The Easy As solver. */

function easyas_refine(puzzle, letters) {
  /**
   * Refine the easyas solution.
   */
  for (const [point, letter] of puzzle.text.entries()) {
    puzzle.text.set(point, letters[parseInt(letter) - 1]);
  }
  return puzzle;
}

modules["eastasabc"] = {
  name: "Easy As ABC",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    const letters = puzzle.param["letters"];
    const rev_letters = {};
    [...letters].forEach((v, k) => (rev_letters[v] = k + 1));

    solver.add_program_line(grid(n, n));
    solver.add_program_line(
      fill_num(Array.from({ length: letters.length }, (_, i) => i + 1), "grid", null, "white") // prettier-ignore
    );
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(count(n - letters.length, "white", "row"));
    solver.add_program_line(unique_num("grid", "col"));
    solver.add_program_line(count(n - letters.length, "white", "col"));

    for (const [point, letter] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(letter.length === 1, `Clue at (${r}, ${c}) should be a letter.`);

      if (r === -1 && c >= 0 && c < puzzle.col) {
        solver.add_program_line(
          `:- Rm = #min { R: grid(R, ${c}), not white(R, ${c}) }, not number(Rm, ${c}, ${rev_letters[letter]}).`
        );
      }

      if (r === puzzle.row && c >= 0 && c < puzzle.col) {
        solver.add_program_line(
          `:- Rm = #max { R: grid(R, ${c}), not white(R, ${c}) }, not number(Rm, ${c}, ${rev_letters[letter]}).`
        );
      }

      if (c === -1 && r >= 0 && r < puzzle.row) {
        solver.add_program_line(
          `:- Cm = #min { C: grid(${r}, C), not white(${r}, C) }, not number(${r}, Cm, ${rev_letters[letter]}).`
        );
      }

      if (c === puzzle.col && r >= 0 && r < puzzle.row) {
        solver.add_program_line(
          `:- Cm = #max { C: grid(${r}, C), not white(${r}, C) }, not number(${r}, Cm, ${rev_letters[letter]}).`
        );
      }

      if (r >= 0 && r < puzzle.row && c >= 0 && c < puzzle.col) {
        solver.add_program_line(`number(${r}, ${c}, ${rev_letters[letter]}).`);
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    for (const solution of solver.solutions) {
      easyas_refine(solution, letters);
    }

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTBbtpAEL37K6I9z8FjO2DvjaYhF+q0hSiKLAsZ6iqoRk4NrqpF/HtmZq16MZGqHprmUC379Hg7s7ydXWb3vS2aEhD5E8bgAzGILkcyEQOZfjcWm31V6guYtPvHuiECcDudwtei2pVexpk0cu9gEm0mYG50plCBCmiiysF80gfzQZsUzJyWFESkzWxQQPS6p/eyzuzKiugTTztO9IHoetOsq3I5s8pHnZkFKP6dd5LNVG3rH6XqfPD3db1dbVhYFXs6zO5x89St7Nov9be2i8X8CGYysMt2Orthb5eptcvsBbuc9pftJvnxSGX/TIaXOmPvdz2NezrXB8JUH1QYceqEvNi7UeGIhTtHGA+FmIV5L0Q+CwtHwKEge7iC7OEI42FELIJjLAlYuOkF9Ic5iEOvGJxl2fM4G6N152aNzpRY6nSiSKGcMuCZZYzlmCdKMvSTSPXcnRMp368suimU+3oQnAoGggu6TjCh4HtBX/BScCYx14L3gleCkeBIYsb8IP7oybyCnSyKbQ9xxvhtKbmXqbTdrsrmIq2bbVEp6ndHT/1UMrOQ2+f/FviPWiBfgf/WXvVv7GRUXXr30tCCrhU8tctiua4rBVTELsDcnuqvfgz6f+beMw==",
      config: { letters: "AUGST" },
    },
  ],
  parameters: {
    letters: {
      name: "Letters",
      type: "text",
      default: "ABC",
    },
  },
};
