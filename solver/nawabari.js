/** The Nawabari solver. */

modules["nawabari"] = {
  name: "Nawabari",
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
        solver.add_program_line(count_adjacent_edges(num, [r, c]));
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
      data: "m=edit&p=7VXfb5swEH7nr4j8tEl+wBgI+GXKumQvGd3WTFWFUAQpW9GS0fFjPxzlf+/dwWrYIk1VpFaTJvCX7+5s8/nsc+qvbVrlXNj4yoDDLzyuCKg5gU/N7p9V0WxzNeGztrkpKyCcny8W/GO6rXMr7nsl1l6HSs+4fq1i5jBOTbCE63dqr98oHXF9ASHGBfiWwATjDtC5oZcUR3bWOYUNPOo50Cugm6LabPP1svO8VbFecYbfeUmjkbJd+S1n3TCyN+UuK9CRpQ0spr4pbvtI3V6Xn9u+r0gOXM86ufMjcqWRi7STi+yIXFzFyXLz60953WbHtIbJ4QA5fw9q1ypG4R8MDQy9UHvASO2ZtGGoAxtN28KkC6Y0pjeOhvidF6C6d7g+OPCYdKYnRuYURw/MYGQGU5xMmslC/LaJCxtnowzee8YzCIFTGHnCwcUM4u5vM7qof9DfQ/kD28fxZvXCRwXD+DAdkEBBabwiXBA6hCvIMteS8BWhTegRLqnPnPCS8IzQJfSpzxT36UE7eboc5kuHqTCAKhVQ7Hgy5F8lxrK7J8aP9+/5Eitmc6isSVRWu3QL1RW1uyyvftlwlx0s9oNRo0Pi/r/enuJ6w/zbj1wap1ZqDKm9ryquzzm7bdfpelPCOYP8YdiHP9kHBqTzR+DR1w03AGvyqiqasvo5efYl/Z5maVU8Z4l1Bw==",
    },
    {
      url: "https://puzz.link/p?nawabari/10/10/b4c1d2b1c2c2j4b0b1a3b3j3b1a2b0b4j2c3c2b1d1c3b",
      test: false,
    },
  ],
};
