/** The Kropki solver. */

function kropki_constraint() {
  /**
   * Return the constraint for the Kropki puzzle.
   */
  const white_rule = "|N1 - N2| != 1";
  const black_rule = "(N1 - N2 * 2) * (N1 * 2 - N2) != 0";
  const empty_rule = "(|N1 - N2| - 1) * (N1 - N2 * 2) * (N1 * 2 - N2) = 0";

  let rule = `:- white_v(R, C), number(R, C - 1, N1), number(R, C, N2), ${white_rule}.\n`;
  rule += `:- white_h(R, C), number(R - 1, C, N1), number(R, C, N2), ${white_rule}.\n`;
  rule += `:- black_v(R, C), number(R, C - 1, N1), number(R, C, N2), ${black_rule}.\n`;
  rule += `:- black_h(R, C), number(R - 1, C, N1), number(R, C, N2), ${black_rule}.\n`;
  rule += `:- grid(R, C), not white_v(R, C), not black_v(R, C), number(R, C - 1, N1), number(R, C, N2), ${empty_rule}.\n`;
  rule += `:- grid(R, C), not white_h(R, C), not black_h(R, C), number(R - 1, C, N1), number(R, C, N2), ${empty_rule}.\n`;

  return rule.trim();
}

modules["kropki"] = {
  name: "Kropki",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    solver.add_program_line(defined("white_h"));
    solver.add_program_line(defined("white_v"));
    solver.add_program_line(defined("black_h"));
    solver.add_program_line(defined("black_v"));

    solver.add_program_line(grid(n, n));
    solver.add_program_line(fill_num(Array.from({ length: n }, (_, i) => i + 1)));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));
    solver.add_program_line(kropki_constraint());

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      fail_false(
        d === BaseDir.TOP.description || d === BaseDir.LEFT.description,
        `Symbol direction at (${r}, ${c}) should be top or left.`
      );
      const tag_d = d === BaseDir.TOP.description ? "h" : "v";

      if (symbol_name === "circle_SS__1") {
        solver.add_program_line(`white_${tag_d}(${r}, ${c}).`);
        solver.add_program_line(`not black_${tag_d}(${r}, ${c}).`);
      }

      if (symbol_name === "circle_SS__2") {
        solver.add_program_line(`black_${tag_d}(${r}, ${c}).`);
        solver.add_program_line(`not white_${tag_d}(${r}, ${c}).`);
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
      data: "m=edit&p=7VVNa9tAEL37V4Q972E/ZUk3N017SdUPOwQjhJFdFQvbyJWtUtb4v2d2JFCgs4cWklzKssPT0/PozXg/Tj+7sq14DEPHXHAJQxuFU4kEpxjGoj7vq/SGz7rztmkBcP454z/K/ama5IOomFxckroZdx/TnEnGmYIpWcHd1/TiPqVuyd0cXjEugbvvRQrg3Qgf8b1Htz0pBeBswACXADd1u9lXq/m8p76kuVtw5j/0Dn/uITs0vyo2GPHPm+awrj2xLs9QzGlbH4c3p+57s+sGrSyu3M16vxnhV49+Pez9ekT49WW8tN+kuF6h8d/A8SrNvfmHEcYjnKcXiBlGiXGZXpiWBvJI+NpoEVwzrSLgFcFPab0WNG80ncdYWm8DfiJF54l8fkofyB8F6ooCdU0DfqaB/LEM8AnNJwF94uuleLqfJqL7b7A/hH4a0GO9hD6m+2/igD6h67XCf/dPvRX0/2JFHOB9foKXdF1W0v200ucneEXXaxXdT6vodWID+8LqgB9NrytrAn4MtW5hc3/ALa4wLuAE4E5jfI9RYLQY71Fzh/ER4y1GgzFCzdSfIX91yjA8QJgFO3gHPD91XsheriK8w8ZhX/e5mOQs6w7rqr3JmvZQ7uG8nm/LY8XgarxO2G+GM9cgNv9vyze7Lf2fIP75znybzZVDe2F9P9tRnB27VbnaNLDMRPHqdmG/sV3bHHc1KyZP",
    },
    {
      url: "https://puzz.link/p?kropki/17/17/i970j090443913a1033a299190319301330b0930004aa04163399c03i04d1d61d0d70d7d7941130i4dddddddddc003a34303d50c9cad23134900a5da411dc4014df090ad040jcc000c4900n7ddadbddc00dd90601a010630mdddd9",
      test: false,
    },
  ],
};
