/** The Shikaku solver. */

modules["shikaku"] = {
  name: "Shikaku",
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

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`clue(${r}, ${c}).`);
      solver.add_program_line(bulb_src_color_connected([r, c], null, "edge"));

      if (Number.isInteger(num)) {
        solver.add_program_line(count_rect_src(num, [r, c], null, "edge"));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    const tag = tag_encode("reachable", "bulb", "src", "adj", "edge", null);
    solver.add_program_line(
      `:- clue(R, C), clue(R1, C1), (R, C) != (R1, C1), ${tag}(R, C, R, C1), ${tag}(R1, C1, R, C1).`
    );
    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNb9pAEL3zK9Ce5+D9wKx9Iyn0QknbUEWRZSFD3AYF5BRwVS3iv+ftGDBuiaoqaqpK1bKPNzP7MfvWs+uvZbbKSQb+py3hH81Iy13ZkHuwb+P5ZpHHbeqVm/tiBUJ0NRjQ52yxzlvJflTa2roodj1yb+NEKEHcpUjJfYi37l3sRuSuERIk4RuCSUEKtF/TG457dlk5ZQA+qngX9BZ0Nl/NFvlkWC30Pk7cmITf54JneyqWxbdcVNPYnhXL6dw7ptkGh1nfzx/3kXV5VzyU+7Ey3ZHrVen2z6Sr63Q9rdL17E+lm999ydfl9FyuUbrbQfOPyHYSJz7xTzW1Nb2Ot8BRvBW6g6kRdatrEcbCtEczVDDDo9ntNkwbwtS1GTXMSPuk2jj0wWF+cMhANtaTgd/OnNh+g+YMv0fDI33GJ2tov+3JGqaZswyDExsiSJbilnHAqBjHUIqcZnzDGDB2GIc8ps94w3jJaBhDHtP1Wv/Wbbw8HREaKBRZXF0HB/VEGU3KQHtNQitLWmEEuLLwR1BH//IMia4eg2br/Hu+tJWIPsqnPSpWy2yBEhqVy2m+Oth4sHYt8V1wx7eM9+//G/Y33jCvf/DKtfPSUk4g7bHayF2ReCwn2WRW4DuDfhw+FOAz4UNNng+jpJ8JmOinwKuLg2dC4Pt7yHCTaesJ",
    },
    {
      url: "https://puzz.link/p?shikaku/24/14/h5x6i.j8g6lag4j.l9i8j6i4l3z9g6i4i4h56h6i4i6j8h4n3h6zn4j4r6j4g6j8i8hci6j8q6h2r8k5l8k8j.l9j4l.lataock36kck",
      test: false,
    },
  ],
};
