/** The Nurikabe solver. */

modules["nurikabe"] = {
  name: "Nurikabe",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(avoid_unknown_src("not black"));

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
      data: "m=edit&p=7VXBjtowEL3nK1ZznkOcOBB8qeh26YVm20K1WkURCmlWG21oaCDVyoh/35lxRFqVQ6tKVJUq48d74wl+Hsdm97XL2xKVz58wRvqmplUsPYhH0v2+Lat9XZornHb7x6Ylgng7m+FDXu9KL+2zMu9gJ8ZO0b41KShACKgryNB+MAf7ztgE7YKGADXF5i4pIHoz0DsZZ3btgsonnvSc6D3RomqLulzNXeS9Se0Sged5LU8zhU3zrYTeB+ui2awrDqzzPS1m91ht+5Fd97l56vpclR3RTp3dxRm74WCXqbPL7IxdXsWf2623zTmjk+x4pIJ/JKsrk7LrTwONB7owB8LEHEDH9GhMuyx7AiNNkjfdyXFEMjzJ2Cc5OsmJIhmdpPID0vo7PSY9HrTiuSaDDnmyYNAR/zy8oopIhBwq8XkvOBMMBJe0DLSh4BtBXzASnEvOjeCd4LWgFhxJzpgL8YulgpCMBQiaqqFd3S7gLQ3d8fuxcbn/sVjmpbDo2oe8KOmdTbrNumyvkqbd5DXQ9XD04Bmky5um/98YF78xuPj+b90bf/9splRXOiH2FmHbrfJV0dRAfzfIcR39FL+4ezrA8KVrq6d8XULmvQA=",
    },
    {
      url: "https://puzz.link/p?nurikabe/19/12/g5zw3k2h4g4k.v.h2i2g4z3n7j3k2h4h4k3i4j3zzk2i2k2p6j2k6k",
      test: false,
    },
  ],
};
