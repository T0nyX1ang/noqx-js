/** The Paintarea solver. */

modules["paintarea"] = {
  name: "Paintarea",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("gray", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(avoid_rect(2, 2, "gray"));
    solver.add_program_line(avoid_rect(2, 2, "not gray"));
    solver.add_program_line(area_same_color("gray"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent(num, [r, c], "gray"));
      }
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
      data: "m=edit&p=7VZRb9M8FH3vr5j87IfYcRI7L2iMjpfR8dGhaYqiKusyVn0tGW2DUKr+953rXC8VmjQQMF5Qmtvjm9Pr4+Mbq5svbbWuZYYrtjKSClccGX+nEX3CdbHYLuv8SB6327tmDSDl+empvK2Wm3pUMKsc7TqXd8eye5sXQgkpNG4lStn9l++6d3k3lt0Uj4S0yJ31JA04HuClf07opE+qCHjCGPAKcL5Yz5f17KzPvM+L7kIKmue1/zVBsWq+1oJ10HjerK4XlLiutljM5m5xz0827U3zf8tcVe5ld9zLnT4hNx7kEuzlEnpCLq3iD8t15X4P2z9A8CwvSPvHAdoBTvMd4iTfCZ3gp7TTfmeEdlTpFaRxIlVIxI9DG2GoeYgSyhe68vHUR+3jBeaRXezjGx8jHxMfzzxnjOlVnEhlUpFrVETXKQMBhA3yCecN8knIO6lSiCCcZMCWMTgpcxJwMuaga1WGNXgMfsb8FBxaDOEMHMucDIuzMWPUtFwzA98x34LjmGOd1BHnXQTMdZwGZo6LgQ1jAwzPgcGVWmnGyKs+r4yBDwGnwBlj6Desn3xIgg/Qn/C8CfgJ88mT4Bv5QHvpMfY77ef1ngQP0wMPyZPgG3mSBU8OPCRPgof2wEOL+pbrk1fBT/ijXPAHHMcc+ANf2IfBQ+9PFPwZ/MT3o5/wEpj6BA116dvqxEfjY+rbLaOm/8HXQui+cAz/bf+O/HqbP6ut0NjygwvN/7tH5agQ03Z9W81rnBzjm0/10aRZr6olRpN2dV2vwxgH934kvgl/+3ff/DvL/9JZTlsQ/dSJ/gLd+oycAu7iWO/OpbhvZ9Vs3qDH4B3l0eff519cPV43cV8tPm/xb6cS5egB",
    },
    {
      url: "https://puzz.link/p?paintarea/18/10/fesmfvrsi3vrvsntsvuttippjvnvrnvdferjbmtvtmnftnrnvrfbanmunev6vffddd8a1zj2b0t2b2a2c1o1d2b1c3zx2d2a2a3t",
      test: false,
    },
  ],
};
