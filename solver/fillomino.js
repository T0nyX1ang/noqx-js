/** The Fillomino solver. */

function fillomino_constraint() {
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge");

  // propagation of number
  let rule = `number(R, C, N) :- number(R0, C0, N), ${tag}(R0, C0, R, C).\n`;
  // this is a huge optimization
  rule += ":- grid(R, C), number(R, C, N1), number(R, C, N2), N1 < N2.\n";

  // same number, adjacent cell, no line
  rule += ":- number(R, C, N), number(R, C + 1, N), edge_left(R, C + 1).\n";
  rule += ":- number(R, C, N), number(R + 1, C, N), edge_top(R + 1, C).\n";

  // different number, adjacent cell, have line
  rule += ":- number(R, C, N1), number(R, C + 1, N2), N1 != N2, not edge_left(R, C + 1).\n";
  rule += ":- number(R, C, N1), number(R + 1, C, N2), N1 != N2, not edge_top(R + 1, C).\n";

  // special case for 1
  const mutual = ["edge_top(R, C)", "edge_top(R + 1, C)", "edge_left(R, C)", "edge_left(R, C + 1)"];
  rule += `{ ${mutual.join("; ")} } = 4 :- number(R, C, 1).\n`;
  rule += `number(R, C, 1) :- ${mutual.join(", ")}.\n`;
  rule += ":- number(R, C, 1), number(R1, C1, 1), adj_4(R, C, R1, C1).\n";

  return rule.trim();
}

function fillomino_filtered(fast = true) {
  const tag = tag_encode("reachable", "grid", "branch", "adj", "edge");
  let rule = "";
  const tag1 = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  rule += `have_numberx(R, C) :- grid(R, C), not ${tag1}(_, _, R, C).\n`;

  rule += `${tag}(R, C, R, C) :- grid(R, C), have_numberx(R, C).\n`;
  rule += `${tag}(R, C, R0, C0) :- grid(R0, C0), grid(R, C), ${tag}(R, C, R1, C1), have_numberx(R0, C0), have_numberx(R, C), adj_edge(R0, C0, R1, C1).\n`;

  if (fast === true) {
    rule += "{ numberx(R, C, 1..5) } = 1 :- grid(R, C), have_numberx(R, C).\n";
    rule += `:- numberx(R, C, N), #count{ R1, C1: ${tag}(R, C, R1, C1) } != N.\n`;
  } else {
    rule += `{ numberx(R, C, N) } = 1 :- grid(R, C), have_numberx(R, C), #count{ R1, C1: ${tag}(R, C, R1, C1) } = N.\n`;
  }
  rule += ":- number(R, C, N), numberx(R1, C1, N), adj_4(R, C, R1, C1).";

  rule += ":- numberx(R, C, N), numberx(R, C + 1, N), edge_left(R, C + 1).\n";
  rule += ":- numberx(R, C, N), numberx(R + 1, C, N), edge_top(R + 1, C).\n";
  rule +=
    ":- have_numberx(R, C), have_numberx(R, C + 1), numberx(R, C, N), not numberx(R, C + 1, N), not edge_left(R, C + 1).\n";
  rule +=
    ":- have_numberx(R, C), have_numberx(R + 1, C), numberx(R, C, N), not numberx(R + 1, C, N), not edge_top(R + 1, C).\n";

  return rule.trim();
}

modules["fillomino"] = {
  name: "Fillomino",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(fillomino_constraint());
    solver.add_program_line(fillomino_filtered(puzzle.param.fast_mode));

    const numberx_uplimit =
      puzzle.row * puzzle.col -
      Array.from(
        new Set(
          Array.from(puzzle.text.entries())
            .filter(([_, num]) => Number.isInteger(num))
            .map(([_, num]) => num)
        )
      ).reduce((a, b) => a + b, 0);
    solver.add_program_line(`:- #count{ R, C: grid(R, C), have_numberx(R, C) } > ${numberx_uplimit}.`);

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) should be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, null, null, "edge"));
      solver.add_program_line(count_reachable_src(num, [r, c], "grid", null, "edge"));

      if (num === 1) {
        solver.add_program_line(`:- not edge_left(${r}, ${c}).`);
        solver.add_program_line(`:- not edge_top(${r}, ${c}).`);
        solver.add_program_line(`:- not edge_left(${r}, ${c + 1}).`);
        solver.add_program_line(`:- not edge_top(${r + 1}, ${c}).`);
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("number", 3));
    solver.add_program_line(display("numberx", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VNNj9MwEL3nV1Q+zyF2vrq+laXlUsLHFlWrKKrSNstGJASSBiFH+e87M0kxleAAEtADsvz0nj2jeeOP9nOXNTmEOLw5uCBxqDDkKX2fpzuNTXEqcz2DRXd6rBskAK9WK3jIyjZ3kikqdXpzo80CzAudCCWApxQpmDe6Ny+1icHc4ZYAiWtrZFKAQrq0dMv7xG7HRekijyeO9B7poWgOZb5bjyuvdWI2IKjOM84mKqr6Sy7GNNaHutoXtLDPTthM+1h8mnba7lh/6KZYmQ5gFj+361m7REe7xH5gl7r4w3Zv0mHAY3+Lhnc6Ie/vLJ1beqd7xFj3QilMpbvmmxHKR6msDC92PQ/l3MoAZfRN+pRrg/3oQgaXhQLKtTKkXM9KqmtlRHVtcES51mT0fSFsS3Jz94wrRsW4wd7BeIzPGV3GgHHNMUvGLeMto88YckxEp/dL5/sX7CSKjuI8gt/nqZOI5fF9PovrpspKfF9xV+3z5qzxQw+O+Cp48u34///4P/rjdAXutb3Ea7ODf0M8FGVZV8XHWqTOEw==",
      config: { fast_mode: false },
    },
    {
      data: "m=edit&p=7VRNb9swDL3nVxQ68yDJXx+3rEt26dJtzVAUhhEkqbsac+YuqYdBQf57SVqtoyJG0XXrdhicEE96pEyT1Nt8b+brAhJ8vBgkKHy8WPI/9ukn7TMtb6siPYJhc3tdrxEAnI7HcDWvNsUgs175YGuS1AzBvEszoQXwX4kczMd0a96nZgLmDCkBCvdOECkBGuGog+fMEzpuN5VEPLEY4QXCZbleVsXspN35kGZmCoLe84ajCYpV/aMQbRivl/VqUdLGYn6LH7O5Lm8ss2ku66+N9VX5DsywP12vS5dgmy6hA+nSV/zhdJN8t8Oyf8KEZ2lGuX/uYNzBs3SLdpJuhY4x1MNOc2eETnDpPyw97S49dxk4sT4d1bEhxXZsGLlL1zmSDhu5sZH73sh9b+KyCbF7y9B1dr9XSffFSionWkk3XGny3+MflUQ9qonyKH6fdwus/P3zsCeKO3PBdsxWs51i48B4bN+ylWwDtifsM2J7zvaYrc82ZJ+IWv+s4Xh5OsKn+iYxDkeAhScQUAUIhD6WhoBCZVEJjoeH86c90FQzwqECTVNEOCDsWxwixlPYPwbtY88Ya8D4FieoXdL6SzyT8ZPVyfA4kr39J/i3dvJBJkaXX4qjSb1ezStUgUmzWhTr+zXK7m4gfgr+8yT6/5X4LykxtUC+8pV7qQJkZtRdSTCnIG6a2Xy2rHHUsIRM39/SPtpe3D7a3uVeur3eh2nUkR5CysMECs5hAgWo9/taVemL088kHuSoj7YK9Yv0E4dbWfzNqb362KI6i6uyqupV+a0W+eAO",
    },
    {
      url: "https://puzz.link/p?fillomino/15/15/h1o5i8g2m6g3g7i3h4h1i1g6g4h2g3h4g2i5h2i4h3l4h1h5m4h2g2h6k7h3i3h7k7h2g2h3m2h1h5l3h4i3h3i-10g4h4g1h3g7g1i8h4h3i2g2g2m8g6i1o1h",
      test: false,
    },
    {
      url: "https://puzz.link/p?fillomino/9/9/rb-134k-13i-13i7k5h-13k-13h8k6i-13i-13k9-13am2j",
      test: false,
    },
  ],
  parameters: {
    fast_mode: { name: "Fast Mode", type: "checkbox", default: true },
  },
};
