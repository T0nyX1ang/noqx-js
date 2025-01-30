/** The FourCells solver. */

modules["fourcells"] = {
  name: "FourCells",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false((puzzle.row * puzzle.col) % 4 === 0, "It's impossible to divide grid into regions of this size!");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));

    for (const [i, o_type] of Object.keys(OMINOES[4]).entries()) {
      const o_shape = OMINOES[4][o_type];
      solver.add_program_line(general_shape("omino_4", i, o_shape, "grid", "grid", "edge"));
    }

    solver.add_program_line(all_shapes("omino_4", "grid", "grid"));
    solver.add_program_line(count_shape((puzzle.row * puzzle.col) / 4, "omino_4", null, "grid", "grid"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent_edges(num, [r, c]));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VXfb9owEH7nr6j8fA/+lZDkZWId7IWm22CqUBQhoNmKBgoDMk1G/O89X1LR2qkq1GmTpir49OU7X/zd2Zx3P6vZtgAR2p+KgIPAJ9QhjSCKafDmGS/3qyK5gF61vyu3CACuBwP4Nlvtik7WzMo7BxMnpgfmY5IxyYCGYDmYz8nBXCUmBTNCFwOB3BCRYCAR9k/whvwWXdak4IjTBiOcIFwst4tVMR3WzKckM2Ngdp33FG0hW5e/ClaH0fuiXM+XlpjP9pjM7m65aTy76rb8UTVzRX4E06vl9lvkqpNcC2u5FrXItVm8Xu5qU7YJjfPjEQv+BaVOk8yq/nqC0QmOkgPaNDkwHT/kWO8KC7RDhB4ROITgXZcR0mO8KKlcRocuE3CP8b7T9dbqenoib63I+04UeQwV590jJiY9Txj3O5K7UVK4UdKrj5SuZqnc3KV2s5DebkmvGrLrVlV6ucs6r0eM4u5airv1UV4WyttBFQiPebo6HkRBx3FCdkBWkh3jaQWjyH4gy8kGZIc0p0/2huwlWU02pDlde97P+ke8Xg6ebI2FiSNgWmvQ9g+kXtSYaUnd9vknePP/z/68k7H+7ffiIi2369kK23tarefF9uEdb9Jjh/1mNDKFIfrtcv3rl6stPj/vinUu0H/f7zIzAh2DuQa2qaaz6aLE04ZVfJ6fnMmnlq93pOn6bRNaAvunntnuFjJU53uwt7qeP9z0X94TbPF55x4=",
    },
    { url: "https://puzz.link/p?fourcells/10/10/d3g1c3g1c3b1a3b1j3a13a3j1b1a3b1c3g1c3g1d", test: false },
  ],
};
