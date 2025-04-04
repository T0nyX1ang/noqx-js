/** The Kakuru solver. */

modules["kakuru"] = {
  name: "Kakuru",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined((item = "black")));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line("{ number(R, C, (1..9)) } = 1 :- grid(R, C), not black(R, C).");
    solver.add_program_line(adjacent(8));
    solver.add_program_line(avoid_num_adjacent(8));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`:- number(_, _, N), { grid(R, C): number(R, C, N), adj_8(R, C, ${r}, ${c}) } > 1.`);
      if (Number.isInteger(num)) {
        solver.add_program_line(`:- #sum { N, R, C: number(R, C, N), adj_8(R, C, ${r}, ${c}) } != ${num}.`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNj9owEL3nV6zm7EMSJyH4UtHt0gtNP6BaraxoFWhWiwpKG0hVGfHf9804KFD1sJe2e6icvHk8jzPPH3j3vavaWqVoOlehitDiOJc3Cfk5tcV6v6nNlZp0+8emBVHq/XSqHqrNrg5sn1UGBzc2bqLcW2MpIkUx3ohK5T6ag3tnXKHcHF2kEmgznxSD3gz0VvqZXXsxCsELzzPQO9DVul1t6vsZeqF8MNYtFHGd1zKaKW2bHzX1Pvj3qtku1ywsqz0ms3tcf+t7dt2X5mvX50blUbnJL3a5Sm9XD3aZervMfmOXZ/GH7Y7L4xHL/gmG741l758Hmg90bg4Uh2QSbErkQ+yD9iHxYSxBe1HnEhKfmYwkpH54mvnQiz4z9cMzLoSiBRdFuiWNvfNHQepays4EFLP06kzAVy4EtmNpfCagHKaP43VS2COU/EyBMyh8anqFnV98l81fCvJdrMWgiJdodFIwq8gcgHeCU8FYcIGVVk4LvhEMBVPBmeTcCN4KXgsmgpnkjHivnrmbfnn/gh0b+4uBW/o8VgaW5l37UK1qnNmi2y7r9qpo2m21IVwSx4B+krxWIz35f2/8o3uDtyB8aeftpdnBP6AMngA=",
    },
    {
      data: "m=edit&p=7VRNj9MwEL3nV6zm7EPiOEnrCyrLlksJHy1araxolZastqJVIG0QctX/vvMRcLdwQEjAHpDl8eubGftNxvXuc193jcpxpCMVqwSHznOeiTE842Es1vtNYy/UpN/ftx0CpV5Pp+qu3uyayA1RVXTwY+snyr+0DhJQoHEmUCn/1h78K+tL5efoAmWQm0mQRngV4DX7CV0KmcSIS8E5whuEq3W32jS3M/Qi88Y6v1BA5zznbIKwbb80MOig36t2u1wTsaz3WMzufv1p8Oz6D+3HfohNqqPykzO5dMogNw1yCYpcQj+RS1X8Ybnj6njEz/4OBd9aR9rfBzgKcG4PoDVYg00xsmSyFLykKS9GQoz4jPgyITPJy4TMc14K8RXiKySvoBA8tBwORaUGmyd3gc8/YzDNgaYGf2NwBwfPAkH6HKRxYEjq4yRSfRbD2yRFYKiWxzFUlgNzynDWOBBUKx51sg2VjRuPTpgfqqKPgUx6woic7wx+osQe0N6wnbLVbBfYNuVTti/YxmwztjOOuWJ7zfaSrWGbc0xBjf/FqyG9+gtynNb8zsjIfh9XkYN5393Vqwb/FmW/XTbdRdl223oD+A4dI/gKPF2K4eb/0/SPniZqQfzUbuFTk4P/iyp6AA==",
    },
  ],
};
