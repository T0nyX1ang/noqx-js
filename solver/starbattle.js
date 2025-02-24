/** The Star Battle solver. */

modules["starbattle"] = {
  name: "Star Battle",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(Number.isInteger(Number(puzzle.param.stars)), "Invalid star count.");
    const num_stars = Number(puzzle.param.stars);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("star__2"));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(avoid_adjacent_color("star__2", 8));

    solver.add_program_line(count(num_stars, "star__2", "row"));
    solver.add_program_line(count(num_stars, "star__2", "col"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(count(num_stars, "star__2", "area", i));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      if (r === -1) {
        continue;
      }

      validate_direction(r, c, d);
      if (symbol_name === "star__2") {
        solver.add_program_line(`star__2(${r}, ${c}).`);
      }
      if (symbol_name === "star__0") {
        solver.add_program_line(`not star__2(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("star__2"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVda9swFH3Pryh61oO+bNl+67p0L127rR2lmBDcNFvDUtLlYwyH/Peee3U9UxZWWlhhMBzLJ5Lu0dE9uvbq+6ZZTrV19POFNtriCmXg28eMbyPXxWw9n1YH+nCzvl0sAbQ+Oz7WX5r5ajqoKRLXaLBty6o91O27qlZOab6tGun2Y7Vt31ftULfnGFKYq9sTIKu0Axz28JLHCR2lTmuATwUDXgFOZsvJfDo+ST0fqrq90IrWecPRBNXd4sdUpTD+P1ncXc+o47pZYzOr29m9jKw2N4tvG5lrRzvdHia5V3vk+l4uwSSX0B65tAuSu1o3yxdJTYG/iyxHux2S/Qkyx1VNij/3sOjhebVFe1ptVfAUCj8sO4Jey2NXNBYw5rAEr+Zo8JgHHbcX4NKt5/Ytt4bbjNsTnjMEjStxZqxVFai8ido7rEnYWuAoGHO8zHEeuBSM+aSRcQEMTYQ9YoPE+lL7LEs4IDaT2IDzmhvB4MmFJ6MzLGtliI0SmyM2SmwEfyH8kQqhEAzOUjipFkrhieAphaeIOhhZqyiARXNpgHPBqCkj/MhPkPwgDjhpQJwOLq2FOGAnGPySQ8QBJx7E6eCTBowDCw9yGCSHARUdMtFDXhjZl0FujezdYC9W9mhN7x35ZZMGPIE7H5E3K5wW+bGSB/LLdT6C0wunB2fndQ6cdxj8ufDn4O/8Ii+i9JMXsesnv2Rd8qXzkd9RkueYA3c+Yr+x8xHafnkNbYVoKzBffEfukVvxxVGeJf8efvnEjyewzPfIs0/8nOcu/zifIYiPAZxBOAM4g3AGJx6haC65dI64DdzmXFKRivdZ5f2onHPI7MsZbx1VUPGbvudlBf6k4jqTD8GjK/57faNBrYY3X6cHp4vlXTPHG/j8trmfKnzgdgP1U/Fde/pe/v/mveo3jxJvXlwaf+ncPyGnRk5RGe2ZVvebcTOeLHCikLE/9edxf3/hn8ezp//Vs4MXA5uazqAaDR4A",
    },
    {
      url: "https://puzz.link/p?starbattle/15/15/3/31g94h1gk30glmiuum28c52kl8mh0i10o51gh4i1go2h84a4802gt5hah8la6046hc9aign1ga18424a42h8",
      config: { stars: 3 },
      test: false,
    },
  ],
  parameters: {
    stars: { name: "Stars", type: "number", default: 2 },
  },
};
