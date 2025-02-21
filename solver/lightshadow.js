/** The Light and Shadow solver. */

modules["lightshadow"] = {
  name: "Light and Shadow",
  category: "shade",
  aliases: ["lightandshadow"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(avoid_unknown_src("black"));
    solver.add_program_line(avoid_unknown_src("not black"));

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
      data: "m=edit&p=7VZdT9tcDL7vr0C+9kXOR/N1MzEGu2Fle8uE0FFVpV0QFe3CUjJNqfrfsX0CJ2WgFzSpV6iK7Tx5Yj92zkm6/tUUdYlKobJoUoyQIrTDGIdJhHGcyBF1v/PF3bLMD/CwubuuagoQz05O8KpYrsuB61iTwabN8vYQ28+5AwUImg4FE2y/5Zv2S96OsB3TJUBL2KknaQqPQ3gh1zk68qCKKB75mG+7pHC+qOfLcnpKVwn5mrv2HIHrfJS7OYRV9buETgefz6vVbMHArLijZtbXi9vuyrr5Ud00HVdNttgeernjZ+SaIJdDL5ejZ+RyF/8ud3lbPSc0m2y3NPD/SOo0d6z6ewjTEI7zDZgUcosQD8UlyrtMXOrPlNLea+O97XD7cJ54n0Sdt95nHS/z6XTki2jD+aj+iOvTvQ4y6t+vBxHkn2gHxJTNgQkM1kqMKFC4sIM0ULgPB8MeQ7L2knCLDj4ERio5CHhgcPc7OZQSJA4UmYwD2+NoQWh1P3J4ag6SHsdKqX4enuiOGmUlT0+OTFvuCpy4Uxg4Ms2+5lj67DUuT2m3ViKZ+7X4Ce7Wyp6OR57ubu+ZDJmQwHk6ZR1J5l4eWRU7ebR5mPwjh1eMTNVzaO2ofEP2UuyJWC32nJY2tkbsJ7GR2KHYU+Eci70QeyTWio2Fk/DmePX28VvDUufar+g9aHNGyyv56W/4jr6MTgYOxk19VcxLemeOmtWsrA9GVb0qlkCfp+0A/oAczvDX7v2LtfcvFg8/euXG29te+x85juZqEmzPEG6baTGdV0ugvzv4Mn75Rpzy6Bdw8zbcpn/he58mvbzgZ1MvbopZCZPBPQ==",
    },
  ],
};
