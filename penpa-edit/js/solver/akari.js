/** The Akari (Light up) solver. */

function lightup(color = "black") {
  /**
   * A lit rule specially designed for akari.
   * A grid fact and an adjacent rule should be defined first.
   */
  const tag = tag_encode("reachable", "sun_moon__3", "branch", "adj", 4, color);
  const initial = `${tag}(R0, C0, R, C) :- grid(R, C), sun_moon__3(R, C), R0 = R, C0 = C.`;
  const propagation = `${tag}(R0, C0, R, C) :- ${tag}(R0, C0, R1, C1), ${color}(R, C), adj_4(R, C, R1, C1), (R - R0) * (C - C0) = 0.`;
  const constraint1 = `:-sun_moon__3(R0, C0), sun_moon__3(R, C), |R0 - R| + |C0 - C| != 0, ${tag}(R0, C0, R, C).`;
  const constraint2 = `:-grid(R, C), not black(R, C), not sun_moon__3(R, C), { ${tag}(R0, C0, R, C) } = 0.`;

  return initial + "\n" + propagation + "\n" + constraint1 + "\n" + constraint2;
}

modules["akari"] = {
  name: "Akari",
  category: "var",
  aliases: ["lightup"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line("{ sun_moon__3(R, C) } :- grid(R, C), not black(R, C).");
    solver.add_program_line(adjacent());
    solver.add_program_line(lightup("not black"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (typeof num === "number") {
        solver.add_program_line(count_adjacent(num, [r, c], "sun_moon__3"));
      }
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(symbol_name, "sun_moon__3");
      solver.add_program_line(`sun_moon__3(${r}, ${c}).`);
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("sun_moon__3"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTfa9swEH73XxH0rAfLsh1Hb1nX7CVLt6WjBGGM47nENK4zJx5DIf97706idmk2usE6BkPR3XefztKX04/91y5vSy58/MmEg4cWioR6kMTUfdeuq8O2VCM+7Q6bpgXA+dVsxm/z7b70tMtKvaOZKDPl5p3STDDOAuiCpdx8VEfzXpklN0sYYjwEbm6TAoCXPbyhcUQXlhQ+4IXFY4ArgEXVFtsym8MoMB+UNtec4Tpv6GuErG6+lczpwLho6nWFxDo/wJ/Zb6qdG9l3X5q7zuWK9MTN1MpdnZEre7kIrVxEP5G77+6zumnuf0tufpe31Tmlk/R0gop/Aq2Z0ij7cw+THi7VkcmAqZCzSJCLbTSW5BJLTiwpfMsKEVofOF46PnR8jDFMv3DT64CP7W7TMlo8hricZiOohyNw4cE4Chh8jUIGIQkaxihsGKPAwWwkdBij4CfLk/THGeAvCHUEuyI7IxuQvYYCciPJviXrk43IzinnkuwN2QuyIdmYcsa4BS/eJJ+pgDMJ5QAXRuSiCThb5qFSytISj0R/tv6QfC3t4/C0Rf8el3qaLbv2Ni9KuFCLrl6X7WjRtHW+hXi5yXclg0fs5LHvjDoUGN7E/+/a679rWH3/hRfn+e34O/dYQ2Gl4OaKs12X5VnRwLGCsmk4H2H8azxcufP50Xk+mvxgnud6Xr1q8IK43U69Bw==",
    },
    {
      url: "https://puzz.link/p?akari/17/17/g666.g6.g6.x6.x6.x6.obl6.gbi6cv.gblcmbl7cv6bi66blam6.x.gbv.gcv66.g666.g.g",
      test: false,
    },
    {
      url: "https://puzz.link/p?akari/20/20/................................h............h1...h............i...i...........i1.bg........t.....i6cn...hbibi1b..kbl1b0.g6bgc..l..k.j1.l..hciam...i6.q...v0...bs....b.b..h2..h....i..h..i..h....i..h..b..h....h1..h...h..h....................../",
      test: false,
    },
  ],
};
