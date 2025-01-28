/** The Context solver. */

modules["context"] = {
  name: "Context",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_adjacent_color("gray", 4));
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(typeof num === "number", `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(
        `:- not gray(${r}, ${c}), #count { R, C: adj_4(${r}, ${c}, R, C), gray(R, C) } != ${num}.`
      );
      solver.add_program_line(`:- gray(${r}, ${c}), #count { R, C: adj_x(${r}, ${c}, R, C), gray(R, C) } != ${num}.`);
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VXfj5pAEH73r7js8zyw/JCVN3s9+2K9tthcCCEGKZcjh8WiNM0a//ebGUhxrU1Kmnhp0uCO3zc7DN/O4Lj71qR1DtKij6MAv/FypeJlqzEvq7uWxb7MgxuYNvunqkYAcD+bwWNa7vJR3EUlo4OeBHoK+l0QCylA2LikSEB/DA76faAXoEPcEqDQN2+DbIR3PXzgfUK3rVNaiBcdRhghzIo6K/PVvPV8CGK9BEHPecN3ExSb6nsuOh3Es2qzLsixTvd4mN1Tse12ds2X6rnpYmVyBD1t5YYX5Dq9XIKtXEIX5NIp/l5uua0uCZ0kxyMW/BNKXQUxqf7cQ9XDMDigXQQH4bh4K3WZeyKcMVL7J3U9k5q7nm1Q3zGpmdn3kTo9VQZV0ghWFNynUhTc0wkF9/dOSEZPpTUxcklpCpE2ZTvhjnXG6Rwn+bhEp9ysgnRNsdI11UrvLL939nzvVC+2RXJzIrYztjbbJfYOtMP2LVuLrcd2zjF3bB/Y3rJ12Y45xqfu/+H7IagsCnuOp7fbl+UK2mKnnTnm5f17vmQUi7CpH9Msxx/qotms8/pmUdWbtBQ4E48j8UPw4jfL/T8mrz4mqfjWoGH5+r/NGOs6tkHfg9g2q3SVVaXA/1j4vT8a6A/B94f4o4H+EFw1xB8N9IeAE+RyfvcX/9W7iwNOfG3q4jld5yIZvQA=",
    },
    {
      url: "https://puzz.link/p?context/16/12/g1k12g2010k3q2h323i2p3i222i3h21l2i333l2m3j3m0l333i1l11h3i121i3p1i323h0q3k2121g20k1g",
      test: false,
    },
  ],
};
