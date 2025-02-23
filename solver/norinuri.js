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
      data: "m=edit&p=7VVRj5NAEH7nV1zmeR5YWJDui6nn1ZfKqa25XAhpKHI5IpVKu8Zs0/9+MwOKp33QmNSYXLb79ZtvB/ox7E53n23RVah8/oQJ0jcNrRKZQRLL9IexrPdNZS5wavf3bUcE8Xo2w7ui2VVeNmTl3sFNjJuie2UyUIAQ0FSQo3trDu61cSm6BS0BatLmfVJA9GqkN7LO7LIXlU88HTjRW6Jl3ZVNtZr3yhuTuSUC/84LuZopbNovFQw+OC7bzbpmYV3s6WF29/V2WNnZD+1HO+Sq/Ihu2ttdnLAbjnaZ9naZnbDLT/H3dptte8roJD8eqeDvyOrKZOz6/UiTkS7MgTA1BwgVXRrTW5Z3AjqmMPkeRiHf+Dl5HISY1wPeF32sggkJvGG+CTogQf8Q/5wQ60f3JB9K3NwKzgQDwSWZRRcKvhT0BSPBueRcCd4IXgpqwVhynvHj/mZBIPTBBFSCCIzuq3MGb1nYH7LHI/r/tNzLYGG7u6KsaGemdrOuuou07TZFA9QEjh58BZlZyD3lqS+cvS9w8f0/6g7//mxmVFc6Ie4aYWtXxapsG6A/FWRdR7/oZ3dPBxg+2a5etxZy7wE=",
    },
  ],
};
