/** The Canal View solver. */

modules["canal"] = {
  name: "Canal View",
  category: "shade",
  aliases: ["canalview"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c());
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("black"));
    solver.add_program_line(avoid_rect(2, 2, "black"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      if (Number.isInteger(num)) {
        solver.add_program_line(bulb_src_color_connected([r, c], "black"));
        solver.add_program_line(count_reachable_src(num + 1, [r, c], "bulb", "black"));
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

    solver.add_program_line(display());
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNj5swEL3zK6I5+4CNSYgvVbrd9JLSj6RarRBaEcpqUUnZkrCtHPHfMzOw66TKoVKlVQ6V46f3Zib4eQze/myzphBTHEEkfCFxBJHPM9L084exKndVYUZi1u4e6gaJEB/nc3GfVdvCS4aq1NvbqbEzYd+bBCQIUDglpMJ+Nnv7wdhY2CWmQGiMLfoihfTa0RvOE7vqg9JHHg8c6S3SvGzyqrhb9JFPJrErAbTOW/43UdjUTwUMPkjn9WZdUmCd7XAz24fycchs22/193aolWkn7Ky3uzxjN3B2ifZ2iZ2xS7v4d7vVY33O6DTtOmz4F7R6ZxJy/dXRyNGl2UOowWgBYQhGYSjGkIrwOSEeOB8QBArl2MkxyuBFasoeycmJnFBWvcjIP3lUhGsn8Ab3/hyglV1+erqUVPIPTXntNDs9yrNVtxGpaflnjZuVZo94yzhnVIwrbI+wAeM7Rp8xZFxwzTXjDeMVo2Ycc82EGvyXR9B3/RXsJCri7/h4UDcuKJJ6CSzb5j7LC3yx43azLppRXDebrAK8QzoPfgNPPmb9/1p59WuFmu9f2pt9aXbwW4M8+5FVo6ey+AWpdwA=",
    },
    {
      url: "https://puzz.link/p?canal/17/17/r11q33h33m31h13m31h16q42q16u81z14u21q21u43z16u31q31q62h41m54h31m12h15q21r",
      test: false,
    },
  ],
};
