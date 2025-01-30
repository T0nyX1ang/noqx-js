/** The FiveCells solver. */

modules["fivecells"] = {
  name: "FiveCells",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false((puzzle.row * puzzle.col) % 5 === 0, "It's impossible to divide grid into regions of this size!");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));

    for (const [i, o_type] of Object.keys(OMINOES[5]).entries()) {
      const o_shape = OMINOES[5][o_type];
      solver.add_program_line(general_shape("omino_5", i, o_shape, "grid", "grid", "edge"));
    }

    solver.add_program_line(all_shapes("omino_5", "grid", "grid"));
    solver.add_program_line(count_shape((puzzle.row * puzzle.col) / 5, "omino_5", null, "grid", "grid"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent_edges(num, [r, c]));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Vbfb9pIEH7nr4j2eR88uzb2+uWUpuRecqR3SRVFFkKEuA0qyCmEqjLif8/M2IRlzKo6RY36EIFHn+fXfjuzHnv1fT1ZlhoS+ttMRxrw148yviDDe7x2v+vZ07zMT/Tp+umhWiLQ+vL8XH+ZzFdlr2i9Rr1N7fL6VNd/54UySvMFaqTrf/NN/U9eD3V9hSalAXUXiEBpg3CwhzdsJ3TWKCFCPGwxwluE09lyOi/HF43mU17U11rROh84mqBaVD9K1YTx/bRa3M1IcTd5ws2sHmaPrWW1vq++rVtfGG11fdrQHRyha/d0CTZ0Cf02uvPH6hhRN9puseD/IdVxXhDrz3uY7eFVvkE5zDeqH+322HRF9YEU2KQXhZEKSwrrKWJSRJ4ikR59uUoqPTLp4YRHykw9HqlkmkqmKefwFI5DvKSOl/U8AGRBACRXMJzX97FygxB38sS8+IGGCfuZY66tzyfm4h5omLMflch6QyKrB52uQdMDn0/Ka/k+aac+Ge/rL1/Du/DaDxlXw8/jOqs7WVUTyeaYiPflrW5AVsyArLxp+nUQJQ+XAXkyjJHHyxhZDWM7DJt+eXs3CefxNc0D5Ed1zrbJ5Fk2meyyyTqcXYdzc8D9nTr5UJhOL4yTD7Bx8kQZ16lzt4PN03TgI3dqo0POOIaAh9Ety3OWhuU1zipdW5YfWUYsE5YX7DNgecPyjGXMss8+KU27/zUPX09HpfRcuQynDz0GBLIMq0nARVhoBnFrcgk2gwHNTAY0xRhQfQlARGecEeziEO2shsZvi9ocYM0e7SKsbRMjahcFm75Y0zZfHKU6piD7y8IWcfOBEPrhZ8S79c+2jnqFGtx/LU+G1XIxmeM3xXC9uCuXu3v8fNv21E/FV2ExJH7/onvzLzoqfvTGc+y1Y7XAuuIo1PWlVo/r8WQ8rfB4YdnIQIMsaAnE4Dg9bsDxGsiFo/G4BQdxMCSQDEd2IASHbSAklIumciDEhSqGozpgwddDMCaQDV87oRBrAiFpwECvk+OWl3dJx/zmZxVfVqPeMw==",
    },
    {
      url: "https://puzz.link/p?fivecells/10/10/a32213a32a1h22c31a3b3a3d3a23a2b2a2a23a1a1b2a22a2d2a3b3a31c11h3a22a21321a",
      test: false,
    },
  ],
};
