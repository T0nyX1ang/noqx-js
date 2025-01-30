/** The Rooms of Factors solver. */

function area_product_aggregate(_id, src_cells) {
  /**
   * Generate a constraint to aggregate the product of the numbers in the area.
   */
  let rule = "";
  for (const [i, cell] of src_cells.entries()) {
    const [r, c] = cell;
    if (i === 0) {
      rule += `area_product(${_id}, ${i}, N) :- number(${r}, ${c}, N).\n`;
    } else {
      rule += `area_product(${_id}, ${i}, N1 * N2) :- area_product(${_id}, ${i - 1}, N1), number(${r}, ${c}, N2).\n`;
    }
  }
  return rule.trim();
}

function number_exclusion(target, grid_size, _id) {
  /**
   * Generate a constraint to exclude the number from the cells.
   */
  let rule = "";
  for (let num = 1; num <= grid_size; num++) {
    if (target % num !== 0) {
      // exclusion for non-factorable numbers
      rule += `:- area(${_id}, R, C), number(R, C, ${num}).\n`;
    }
  }
  return rule.trim();
}

modules["factors"] = {
  name: "Rooms of Factors",
  category: "num",
  aliases: ["roomsoffactors"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    solver.add_program_line(grid(n, n));
    solver.add_program_line(fill_num(Array.from({ length: n }, (_, i) => i + 1)));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(area_product_aggregate(i, ar));

      for (const [r, c] of ar) {
        const sudoku_point = new BasePoint(r, c, BaseDir.CENTER, "sudoku_0").toString();
        const normal_point = new BasePoint(r, c, BaseDir.CENTER, "normal").toString();

        if (puzzle.text.has(sudoku_point)) {
          const num = puzzle.text.get(sudoku_point);
          fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) should be integer.`);
          solver.add_program_line(`:- not area_product(${i}, ${ar.length - 1}, ${num}).`);
          solver.add_program_line(number_exclusion(parseInt(num, 10), n, i));
        }

        if (puzzle.text.has(normal_point)) {
          const num = puzzle.text.get(normal_point);
          fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) should be integer.`);
          solver.add_program_line(`number(${r}, ${c}, ${num}).`);
        }
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZRfb9owFMXf+RSVn/0Q/wXyxjrYC2PrylRVUYQCTVc0ULpApimI795z7csom6Zqnbq9TFGuznV+do7ta2++NEVdSo/H9GQiFR7tfXiVteFN+Jkut6syPZODZntX1RBSvhuN5G2x2pSdjKm8s2v7aTuQ7Zs0E0pIofEqkcv2It21b9N2IttLfBJSoW0cIQ05PMqr8J3UeWxUCfQE2sRu15CLZb1YlbNxbHmfZu1UCvrPq9CbpFhXX0vBPihfVOv5khrmxRaT2dwt7/nLprmpPjfMqnwv28Gv7ZqjXZLRLqkf7fJ8XthuP9/vsewfYHiWZuT941H2jvIy3SFOQlTpTtheDyMoTY6E7WskGiWAxCUJEsuJpUSjGJB4bZGY+MVrGsCgVCixYbReTMLQoQ9+dh1+OQpRhziFI9maEF+HmIToQhwHZgiLitxpONMoImWgDWsMTVZIazCGGQ3GMEO/N8wYMJYZA8YyY51UzrHGRJyP2qGv574OjGfGgfHMeDBdZjyYLjN0drrMkAfN7RqMPrSD0V32Qz6ZMWAMM7SwhhmLk3nwb2kuj/xb5sm/Zd6Bd8w78I55h7m7g2cwnhkPxjPjwYS5YxOuwlach2hD9GGLulRSv1V0grYxEx5HIl4IgvYsnhFuoAlmdGHEhlimf1I/T04go9r5/mAtn6vzTiaGN5/Ks0lVr4sVjumkWc/L+pDjXtx3xDcR3gwLLO3/q/IfXZW0BckzLswXrcQn7GRYXdTqyfm5b2bFbFGh2LCIBOCSOzlPPwG4OR6dr1Pgr08Yp0/cFottVW9E3nkA",
    },
    {
      url: "https://puzz.link/p?factors/15/15/77kfnev5ulvdbs9vs5tpnrfblfbalfcf6iuuuapp9jsceghsd7jnsffo7v7jvhjo9u3u3dkojbsguffds7us-84+780-1a=110*6db0-9c-87-14=518*378c+5dc-62-164+1ef+120-75-28+1ef-a5+118-7e+9e76-48-62-18+1f8+738+168+24c+5a0-28%aa8+144+384-2c2-96-27+6e4+104-14+160-5a-23*ebb0*15cc+4eca$22c6cc$22550$38f30+270-1c-9a-1be-96+738-f0-2d-60-82-a2+555+168+1b8-1e+3d4-20-7e-8f",
      test: false,
    },
  ],
};
