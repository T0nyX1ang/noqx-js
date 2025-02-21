/** The Kurotto solver. */

modules["kurotto"] = {
  name: "Kurotto",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c());
    solver.add_program_line(adjacent());

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      if (Number.isInteger(num)) {
        solver.add_program_line(grid_src_color_connected([r, c], null, null, "black"));
        solver.add_program_line(count_reachable_src(num + 1, [r, c], "grid", "black"));
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
      data: "m=edit&p=7VbNbtpAEL7zFGjPe/Cs1783moZeKGkLVRRZFjLUUVCMTA2uqkW8e2bGbnbd5NAeSi+R2dF887ffDoOXw/e2aEoJij5+LD0J+OhE8/KjgJfXP8vtsSrTsZy0x4e6QUXKm+lU3hfVoRxlfVQ+OpkkNRNpPqSZACGFwgUil+ZzejIfUzOXZoEuITXaZl2QQvXaqrfsJ+2qM4KH+rzTQ1TvUN1sm01VrmboRcunNDNLKWifd5xNqtjVP0rR8yC8qXfrLRnWxREPc3jY7nvPof1WP7Z9LORnaSYd3cUrdH1Ll9SOLmn/jG61r18jmuTnMzb8C1JdpRmx/mrV2KqL9IRynp6ErzE1kGH3nQjtIfQsDBD6zzAAhLGFlKufYUi5YJNDio4sDAc7RRRtS0dqEBz7g51iyrU7JVRZjLGZvwyUDWBxPNgLvCFTAKpnywNEv+Fk0AZQVN/JV9QXx+/TYZx8n+q7fqpn6YEm7NTjToYOpnzbDQipHc75gJtpuwchHTixOBr2HhIibDdQHhF2MR3QwUB+t8MKiILdQQ1ahMMEPFJ3LKcsFcslTpw0Psv3LD2WAcsZx1yzvGV5xVKzDDkmopn9w6kWGg+ucHDxPLob8Qtwy3zNb8qXT/BmpycfZWLRNvfFpsTX1rzdrctmPK+bXVEJvCHOI/FT8MKZxgvn7dK4+KVBzff+6ur4/7/5DPuqQZobKfbtqlht6krgPw7JdvXCfnH2+GIQj21TH4+1yEdP",
    },
    {
      url: "https://puzz.link/p?kurotto/17/13/7i4i-1ai4iay1i6ibi0y3ibi9i-14iay4i7i-10i4y-11iei6ici3y1ibi7i2y-10i8i0i4i1",
      test: false,
    },
  ],
};
