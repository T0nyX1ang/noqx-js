/** The Hakoiri-masashi solver. */

modules["hakoiri"] = {
  name: "Hakoiri-masashi",
  category: "var",
  aliases: ["hakoirimasashi"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_cc(["ox_E__1", "ox_E__2", "ox_E__3", "white"]));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(avoid_adjacent_color("ox_E__1", 8));
    solver.add_program_line(avoid_adjacent_color("ox_E__2", 8));
    solver.add_program_line(avoid_adjacent_color("ox_E__3", 8));
    solver.add_program_line(grid_color_connected("not white", 4, [puzzle.row, puzzle.col]));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(count(1, "ox_E__1", "area", i));
      solver.add_program_line(count(1, "ox_E__2", "area", i));
      solver.add_program_line(count(1, "ox_E__3", "area", i));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      const [symbol, style] = symbol_name.split("__");
      validate_type(symbol, ["ox_B", "ox_E"]);
      fail_false(["1", "2", "3", "4", "7", "8"].includes(style), `Invalid symbol at (${r}, ${c}).`);
      if (["1", "2", "3"].includes(style)) {
        solver.add_program_line(`ox_E__${style}(${r}, ${c}).`);
      } else {
        solver.add_program_line(`white(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("ox_E__1"));
    solver.add_program_line(display("ox_E__2"));
    solver.add_program_line(display("ox_E__3"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZdT8M2FH3vr0B+9kP8kcTJG7CyFwbbYEKoqqoC3UADFVo6oVT975xrH5PCkJCYQNo0tbFPbq+vzz29vsnyYTVdzLQp5OuCxoyPNyFeNlTxKvg5vXm8nbU7enf1eD1fAGh9fHCgf5/eLmeDEb3Gg3XXtN2u7n5sR8oorSwuo8a6+6Vddz+13VB3J/hJ6QDbYXKygMMensXfBe0noymAj4gBzwHnT5O9dPdzO+pOtZI99uJKgepu/tdMkYPcX87vLm7EcDF9RCLL65t7/rJcXc3/XNHXjDe6201Uz9+h6nqqAhNVQe9QlQxIdfgFVJvxZgO5fwXZSTsS3r/1MPTwpF1jPIqjieN5u1auQBijex1VaWFx25aqhMVuW4wNb5cZ5/9mersQex7EnW0cT0FMdy6OP8SxiGMZx8PoMwRH6xptPYgilLUox21s64SN63EJXIJOxB4YPCIugauEve2xRZl7pB1xjTjILtttQwwOIpZgVwAbYgPMtQ4xnSMGB5EkYnBwmQM4l5kn9qoZR+J7rvVY67nWC3/yKcGn5l419s1YfDzje+Toc46iFfcSPhl77OsZ0yNmxTgV+NdcW2Ntw3wb9IUi8cEMnHPB2pL6lOBf0b+CPjX51+BW078Gtxxf/GvmW4NbILcAboHcgrQfxg/wz3xq8AyMg9bkimTHrJ0hTwOeJu3rCvOCJT7uX+K7IuWOGTjxwQz/xAczcOKDGTjxiXbWgEM9vGD8j7gnhj/rx6GucE8MzqxVZ7CvTblEbKhJgzjbmDnGGq6oSQVNAn0CNGyyhqIn9Q/QP+TcsTbr1kDnhjo3khdrIIi2OSZqLNDeYG2T14K/YY7yzLDU3EJzS80NNCeWvXBPnxL6UBOca1dSc9GE5xoz7DkmuPFsYoadWonmPCOYYae2qH/HmoyYZ8HhbL7C8ZyiwZzFNrMfRx/HKrafWrrmP+irSJetLzV9JWTZV7NF2mPoLZ9rjx/mMIJU8kR//Sn/fbbxYKSGV3/Mdo7mi7vpLR6GJ9fT+5nC28ZmoJ5UvCAxXl7+fwH55hcQkb749HH5osr/gM4IyuLx3R1rdb+aTCeXc9QUdBM7Wsr79vI/Z//2fwUtSU0fFnJwnwE=",
    },
  ],
};
