/** The Look Air solver. */

function square_size(color = "black") {
  /**
   * Generate a rule to determine the size of the square.
   */
  let rule = `square_size(R, C, N) :- upleft(R, C), MC = #min{ C0: grid(R, C0 - 1), not ${color}(R, C0), C0 > C }, N = MC - C.\n`;
  rule += `square_size(R, C, N) :- grid(R, C), ${color}(R, C), square_size(R, C - 1, N).\n`;
  rule += `square_size(R, C, N) :- grid(R, C), ${color}(R, C), square_size(R - 1, C, N).`;
  return rule;
}

function avoid_same_size_square_see(color = "black") {
  /**
   * Generate a constraint to avoid the same size square seeing each other.
   */
  let rule = `left_square(R, C, C - 1) :- grid(R, C), ${color}(R, C - 1), not ${color}(R, C).\n`;
  rule += "left_square(R, C, C0) :- grid(R, C), not left_square(R, C, C - 1), left_square(R, C - 1, C0).\n";
  rule += ":- upleft(R, C), left_square(R, C, MC), square_size(R, C, N), square_size(R, MC, N).\n";
  rule += ":- left(R, C), left_square(R, C, MC), square_size(R, C, N), square_size(R, MC, N).\n";
  rule += `up_square(R, C, R - 1) :- grid(R, C), ${color}(R - 1, C), not ${color}(R, C).\n`;
  rule += "up_square(R, C, R0) :- grid(R, C), not up_square(R, C, R - 1), up_square(R - 1, C, R0).\n";
  rule += ":- upleft(R, C), up_square(R, C, MR), square_size(R, C, N), square_size(MR, C, N).\n";
  rule += ":- up(R, C), up_square(R, C, MR), square_size(R, C, N), square_size(MR, C, N).";

  return rule;
}

modules["lookair"] = {
  name: "Look Air",
  aliases: ["Rukkuea"],
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4, true));
    solver.add_program_line(all_rect("gray", true));
    solver.add_program_line(square_size("gray"));
    solver.add_program_line(avoid_same_size_square_see("gray"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent(num, [r, c], "gray", 4));
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
      data: "m=edit&p=7VTBbtswDL37KwqeebAl20l1GbKu2SVztyVDUQiG4XguatSGOiceBgX591KUOxfdDluBtZdB0MPLE6k8UmF234ayrzGlJecYYkRLpCnvKI55h+PaNPu2Vie4GPY3pieCeLFc4nXZ7upAj1F5cLCnyi7QvlcaBCDvCHK0n9TBflA2Q7umI8A5aStiEaAgej7RSz537MyLUUg8GznRK6JV01dtXay88lFpu0Fw3/OWsx2Fznyvwafx58p028YJ23JPxexumrvxZDd8NbfDGBvlR7QLb3f9YNfZGe3Kya6j3q5jv7Hr0v6x3dP8eKS2fybDhdLO+5eJzie6VgfCTB1ACJcqyYt/GxAzJ7yZBPk0QiZPhJhTXLWjkEgn0HM/CCkL4SOB73gUMeOIn3eQu4g9XjEuGQXjhkpAKxnfMYaMCeOKY84ZLxnPGGPGlGNmrgl/2CYQZGxObYlBCd+zF/CmheAB9Ct5Ps8DDeuhvy6rmn4v2dBt6/4kM31XtkADegzgB/DWksLj/zP7SjPrniD8q8l9/QnR1F0h0V4g3A1FWVSmBfrbx2fp8S/6i1dLYwetMbdl00Me3AM=",
    },
    { url: "https://puzz.link/p?lookair/9/9/g2a2b4d2i2y1i3d4b1a1g", test: false },
    { url: "https://pzplus.tck.mn/p?lookair/20/10/1b2f12b1c3d2l2zzg2a1b4a3zzg2l4d2c1b32f3b2", test: false },
  ],
};
