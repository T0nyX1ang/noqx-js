/** The Nuribou solver. */

function noribou_strip_different(color = "black") {
  /**
   * Generate a rule to ensure that no two adjacent cells have the same shaded strips.
   * An all_rect constraint should be defined first.
   */
  let rule = "nth(R, C, 1) :- upleft(R, C).\n";
  rule += "nth(R, C, N) :- up(R, C), nth(R, C - 1, N - 1).\n";
  rule += "nth(R, C, N) :- left(R, C), nth(R - 1, C, N - 1).\n";
  rule += `:- ${color}(R, C), nth(R, C, N1), nth(R, C, N2), N1 < N2.\n`;

  rule += "len_strip(R, C, 1) :- upleft(R, C), not up(R, C + 1), not left(R + 1, C).\n";
  rule += `len_strip(R, C, N) :- upleft(R, C), up(R, C + 1), ${color}(R, C + N - 1), not ${color}(R, C + N), nth(R, C + N - 1, N).\n`;
  rule += `len_strip(R, C, N) :- upleft(R, C), left(R + 1, C), ${color}(R + N - 1, C), not ${color}(R + N, C), nth(R + N - 1, C, N).\n`;
  rule += `:- ${color}(R, C), len_strip(R, C, L), len_strip(R, C, L1), L < L1.\n`;
  rule += "len_strip(R, C, L) :- up(R, C), nth(R, C, N), len_strip(R, C - N + 1, L).\n";
  rule += "len_strip(R, C, L) :- left(R, C), nth(R, C, N), len_strip(R - N + 1, C, L).\n";
  rule += `:- ${color}(R, C), ${color}(R1, C1), adj_x(R, C, R1, C1), len_strip(R, C, L), len_strip(R1, C1, L1), L = L1.`;
  rule += ":- grid(R, C), remain(R, C).\n";
  return rule.trim();
}

modules["nuribou"] = {
  name: "Nuribou",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_unknown_src("not black", 4));
    solver.add_program_line(noribou_strip_different("black"));
    solver.add_program_line(all_rect("black"));

    const all_src = get_all_src(puzzle.text);
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      const current_excluded = Array.from(all_src).filter((src) => src[0] !== r || src[1] !== c);
      solver.add_program_line(`not black(${r}, ${c}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, current_excluded, "not black"));

      if (Number.isInteger(num)) {
        solver.add_program_line(count_reachable_src(num, [r, c], "grid", "not black"));
      }
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
      data: "m=edit&p=7VVNb9pAEL37V0Rz3oP3C4gvFU1DL5S0hSqKLAsZ11GsmpoatqoW8d8zMzZ1nHLoh0QvkdmnNzPr3bczy3j7zaV1LqSmnx6JUEh8rFY8pDE8wvZZFLsyjy7E2O0eqhqJEDeTibhPy20exO2sJNj7y8iPhX8bxSBBgMIhIRH+Q7T37yI/E36OIRAGfdNmkkJ63dFbjhO7apwyRD5rOdI7pFlRZ2W+nDae91HsFwJon9f8NlFYV99zaHWQnVXrVUGOVbrDw2wfik0b2brP1RfXzpXJQfhxI3d+Qq7u5BJt5BI7IZdO8e9yy011Suhlcjhgwj+i1GUUk+pPHR11dB7tEWfRHvQAX6Uqc03ASFrpFYo6Oka9uDVo4vVozUHfHNJiw5+mDOllvDhHW6q+rTXaeKmOtgmf7S55+57H2t6Wkvd8suaI1uhsxXs+XUGpvmiln9msojuyMsOeSmVpxWMc0yg5mXeME0bFuMBcC68Z3zCGjJZxynOuGW8ZrxgN44DnDKlav1lP0JgqgxXC/KimuGfQFusB94hTj32J/E0kCWKYu/o+zXL8i8/cepXXF7OqXqclYDc9BPADePCdNS8N9uwNlpIf/lGb/f9dIsa84hfd3wjYuGW6zKoS8OssyG/tL/6zq8dWAl9dXawqB0nwCA==",
    },
    {
      url: "https://puzz.link/p?nuribou/20/15/h5o6zs6k3i3h6zg4p4zi.pbzl7h3zz4k4l9v7zn4h.l4k4o4q7i2",
      test: false,
    },
  ],
};
