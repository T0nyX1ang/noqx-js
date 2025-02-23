/** The Norinuri solver. */

modules["norinuri"] = {
  name: "Norinuri",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));

    solver.add_program_line(adjacent());
    solver.add_program_line(avoid_unknown_src("not black"));
    solver.add_program_line(nori_adjacent("black"));

    const all_src = get_all_src(puzzle.text);
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      const current_excluded = Array.from(all_src).filter((src) => src[0] !== r || src[1] !== c);
      const color = puzzle.surface.get(new BasePoint(r, c).toString()) === BaseColor.BLACK ? "black" : "not black";
      solver.add_program_line(`${color}(${r}, ${c}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, current_excluded, color));

      if (Number.isInteger(num)) {
        solver.add_program_line(count_reachable_src(num, [r, c], "grid", color));
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
      data: "m=edit&p=7VVNj9MwEL3nV6A5zyGO3TT1BZWy5VJ2gRatVlFUpSGrjUhxSRuEXPW/78wk2sCyBz6kIiTk+vW98Vh9nsTT/ec2b0pUIX90gvRNw6hEZpTEMsN+rKpDXdpnOG0Pd64hgng1n+NtXu/LIO2zsuDoJ9ZP0b+yKShAiGgqyNC/tUf/2vol+iUtASqKLbqkiOjFQK9lndmsC6qQ+GXPid4QLaqmqMv1oou8salfIfDvvJDdTGHrvpTQ+2BduO2m4sAmP9Bh9nfVrl/Ztx/cx7bPVdkJ/fSRXTPY1YNdpp1dZk/Y5VP8ud16554yOslOJyr4O7K6tim7fj/QZKBLeyS8tEfQIW99Ti66pwKjiAL8BvQ6Zj15kGOW8YOcjB5tV2pMkdGgtSGdfKN5fTxoo0lHg47ZkOk1mVRi9UZwLhgJrugk6LXgS8FQcCS4kJwLwWvBmaARjCVnzLX4yWqBVmAjBEOnMV3pzuAt1d0N/H5wcf+xWBaksGyb27wo6bWdue3O7atDCdQdTgF8BZmp5mbzv2GcvWFw8cNfaht//16mVFet0F8h7Np1vi5cDfRvg78TN+aH+NlPS5cdPrVNtXEtZME9",
    },
    { url: "https://puzz.link/p?norinuri/10/10/o.zt9g8lcg5zt.o", test: false },
  ],
};
