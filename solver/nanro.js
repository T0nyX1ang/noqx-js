/** The Nanro solver. */

function nanro_fill_constraint(color = "black") {
  /**
   * Generate a constraint for the number filling in nanro.
   */
  return `:- number(R0, C0, N), area(A, R0, C0), #count { R, C : area(A, R, C), ${color}(R, C) } != N.`;
}

function nanro_avoid_adjacent() {
  /**
   * Generate a rule to avoid adjacent cells with the same number.
   */
  let area_adj = area_adjacent();
  area_adj = area_adj.substring(area_adj.indexOf(":-"), area_adj.length - 1);
  return `${area_adj}, number(R, C, N), number(R1, C1, N).`;
}

modules["nanro"] = {
  name: "Nanro",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("not gray"));
    solver.add_program_line(avoid_rect(2, 2, "not gray"));
    solver.add_program_line(nanro_fill_constraint("not gray"));
    solver.add_program_line(nanro_avoid_adjacent());

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(fill_num(Array.from({ length: ar.length }, (_, i) => i + 1), "area", i, "gray")); // prettier-ignore
      let unclued = true;
      for (const [r, c] of ar) {
        const center_sudoku = new BasePoint(r, c, BaseDir.CENTER, "sudoku_0").toString();
        const center_normal = new BasePoint(r, c, BaseDir.CENTER, "normal").toString();

        if (puzzle.text.has(center_sudoku)) {
          unclued = false;
          const num = puzzle.text.get(center_sudoku);
          fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) should be integer.`);
          solver.add_program_line(count(num, "not gray", "area", i));
        }

        if (puzzle.text.has(center_normal)) {
          unclued = false;
          const num = puzzle.text.get(center_normal);
          fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) should be integer.`);
          solver.add_program_line(`number(${r}, ${c}, ${num}).`);
        }
      }

      if (unclued) {
        solver.add_program_line(count(["gt", 0], "not gray", "area", i));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`gray(${r}, ${c}).`);
    }

    solver.add_program_line(display("gray"));
    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      url: "https://puzz.link/p?nanro/11/11/9bdcljmcpj6cpj6dpl6mqi46tt8qpltbdmqnljb2nnc4i3g2l23l2n2n2n2n2i3i2n3n3n3n2l43l2g3i",
      test: false,
    },
    {
      data: "m=edit&p=7VdNbxs3FLzrVwR75oHk49fq5qZ2L67T1i6CQBAM2VEaozaUylZRrOH/nnnkUHICFEFRpAWKQtJy3iyXO+9xyF3d/7ZbbdfGOf1KMdYAmRBT/Tnn68/yc3HzcLuevzBHu4f3my2AMa9OTsy71e39erZgr+XscRrn05GZvpsvBjeYwdff0kw/zh+n7+fD/e7t5tfdYKZzdBiMw5nT1tUDHh/g63pe0ctGOgt8BiztsjeA1zfb69v15Wnr+MN8MV2YQe/2Tb1a4XC3+X09UI3G15u7qxslrlYPSOn+/c0HnqE23m75ZKajKno67nLLQa4c5CpschV9Lpf5fGW54/LpCcX/CYIv5wvV/vMBns8fcTybPw7Ba3+toMFVes6BdbYU5WOt7OAw7xqGHsYa7s/mT856l/qYNSz2eSi+jlwLqmGoZ/u1EoKGMEkLxzpUPxubjH7f9OxaCH9TkzqpR1+PF8jWTFKP39ajrcdYj6e1zzHS9cEZr5Xw8GbwwEIswFBUcQCOxBEY0ipOwJk4AyO/igvwSDwaHyFWcbTAjhj31VpWjPsmjpMwTiFfwI/kx2xEawCM1ohvPFoj1I/WSCQfwevkKM7gC/mSTbCNR2uCa3xwWOp7HIFbjsEF4JZ7cALcahKgATExtgpqC84CtxyDHYFb7sEW3LfVJFjV0GoVLO5rqW3EOJa1zahPIS7JiG1jokUdGo/WiJAX8JwXtEYS+QQ+k8/gR/Ij8qIeGQV8y0tG1GpseUlGDUfWMIHP1Im5Rsz7gqcHxIGXPke4F+spqHPHHvVHzBwxv5yXijO9l+G9TO9leC/TexneYy5ogbtn9NqOUTdq8wl+Yx18hA9T9yH8GelP+AQxMcakf6rnex/19n5M9Sp1JuhM1JnQP1Fngs5EnerzjhPGL9RTwOsSr97WWnFe9PnjOV8e/N7nwIF9sGYlsg80SyYPzwg9gxbz232o/qSfLfzZvTTCn7bVRMaCue5+0HlvNcE2BNz9GYE5PvyDmHOB+mTWMKO2mXXLqLlugTVfzEXvr+NwXaBFjo1HixzJB/CRfASfyWfw+3yBC/sU6Nlj+LnQz9hDEBNrfehP6EHMcUbgPj7qQP2C+UV88D/nXbC/7bGgD/c9ceCFvAXvWJMC3tIzwL6wPgX1GVmfUetDb2Af8Fx3tbYdY216rk20wPSezkVfy9hzxDN3D17IC/hIPoJPPUfNnXzSvDqva7znrvsJPQBvIybWcVhz7POIeS/w3P9rfYS8Q5+OLfq4rln1cxyL8bkHogXue4juG6yn7lfEaJEva+71XuTxEieRPJ4vn+CeC9YmYmL1W99LoYHPLPHghdpUv3/Ge/b3umY5jtdnU9cDLLyX6F7d1zL6C3NUvj8T9VnMdV33Ivq8PpfrvoSH9uv66H5Zj6EeU32k53os/UXnz1+A9l3quxAEDPPS3ojaG9DfeZ34gr6n2QKPC32z/vwT/7vscrYYznfbd6vrNV5Wj9/+sn5xttnerW4Rne3urtbbQ3xeX2N7jH8QT7Phj6H+FuoB4+T/vxX/6t8KnQr75T8XX30p/ZWlvpjOsd+Y6ZUZPuwuV5fXG3jNLv9ZwVCJ5b+cfQQ=",
    },
  ],
};
