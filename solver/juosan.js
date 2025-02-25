/** The Juosan solver. */

function jousan_constraint() {
  /**
   * Constrain consecutive lines.
   */

  // black for horizontal, not black for vertical
  let rule = ":- grid(R, C), grid(R + 2, C), black(R, C), black(R + 1, C), black(R + 2, C).\n";
  rule += ":- grid(R, C), grid(R, C + 2), not black(R, C), not black(R, C + 1), not black(R, C + 2).\n";
  rule += 'content(R, C, "——") :- grid(R, C), black(R, C).\n';
  rule += 'content(R, C, "|") :- grid(R, C), not black(R, C).';
  return rule;
}

function count_lines(area_id, num1, num2 = 0) {
  /**
   * Limit the number of horizontal or vertical lines.
   */
  let rule = `count_area(${area_id}, N) :- #count{ R, C: area(${area_id}, R, C), black(R, C) } = N.\n`;
  rule += `:- not count_area(${area_id}, ${num1}), not count_area(${area_id}, ${num2}).`;
  return rule;
}

modules["juosan"] = {
  name: "Juosan",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c());
    solver.add_program_line(jousan_constraint());

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "sudoku_0").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count_lines(i, num, ar.length - num));
        }
      }
    }

    solver.add_program_line(display("content", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZdaxs5FH33rwh61sPoY0ajeSlpNulL6n4kSwjGBCfxNt6169aOlzLG/z3nSkd1WigLW0pTKPZojqSre4/uuZK9/riZrKbaVPJ1rcYbH2/a9Ni2SU/Fz/nsfj7tDvTh5v5uuQLQ+tXJif5rMl9PByNajQfbPnb9oe5fdCNllU6PUWPdv+m2/cuuH+r+DFNKG4ydAhmlLeDxHl6keUFHedBUwENgl5ddAt7MVjfz6dVpHnndjfpzrSTO87RaoFos/52q7CL1b5aL65kMXE/usZn13ewDZ9ab2+U/G9qa8U73h9+m6/Z0BWa6gr6my/38YLpxvNsh7W9B+KobCfc/97Ddw7Nui3aYWtNtVaw8PHghpKKxwE3GtgKWqkgdMcoTpjINOo4dJ50y48XMshMezZhKvKlnaePo1jJHQ9PIXGZgTCsu6Nz6du/CPjZziVDp1EKbHZ8IiQNs8DJt8yS1NrXnyILuXWr/SG2V2jq1p8nmGGmxxmlrg+ositfUwJEY58GBiWBbAYNIwkFbb4gjsMvYwUbSkrAHxpYEe4zXHPcGuCZG3JpxPezrYo+4kgHBNcYbjtfg1pBbDQ6BHGqc3YC8CG4QKzBWI2ea4wFxW8YNVs45Mfy39B/gv6X/AA6RHFrYR9q3sIm0wV3hROyEW2DGaiMwcxJhY2gTAzA5R9iYbAMfwJmzqwxw5ukqD5y5YZ12luPQy1EvrAMuNohFvbAOOPPBOuDMGeu0o3ZYB0wbaOeoHdYB5/1inXY1eUI7R+2wDpg20NFRR/gAZj6lBhxzDj+og309lPoR3X2pB+SWcVMN+FIbUm+lBqROaC9aN/TTQN+m1AD0apj/BnED4wapDdqL7qHUA+LKCS66B8ZtpWboM2JtLNqBTySfiBpjPSQdK+ZWdGQ94P25HvAGZp7lR4j1AM2BmU/R0RR9pWaKvtDLFB2lBujHSg080oXnMWnB3OJNTXHoL9LRP0qtT22TroQg1+b/uFi/5/b5TzojVKb8Sn/5qX+9sfFgpI5v300PhsvVYjLHD9tws7ierkof/yR2A/VJpUdude1//7n4SX8uRILqqZ2Ep0YHZ1P9vVmuJ+/VePAA",
    },
    {
      url: "https://puzz.link/p?juosan/21/12/4ql08qtg9qt59ul5bunltnn9tntd72ta72h636h5b641bm04vmcvjo0fu1vo3s6fhuv1u0gf7fvpjo0fvjro0fs3vu0tvvgg33g42554342h553444g2g24211g121g2221341225h121g252442224465g25g1g2425g273",
      test: false,
    },
  ],
};
