/** The Dominion solver. */

modules["dominion"] = {
  name: "Dominion",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(":- grid(R, C), black(R, C), #count{ (R1, C1): adj_4(R, C, R1, C1), black(R1, C1) } != 1.");
    solver.add_program_line(avoid_unknown_src("not black"));

    const tag = tag_encode("reachable", "grid", "src", "adj", 4, "not black");
    for (const [point, letter] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      if (letter !== "?") {
        solver.add_program_line(grid_src_color_connected([r, c], null, null, "not black"));
      }

      for (const [point1, letter1] of puzzle.text.entries()) {
        const [r1, c1, _, __] = extract_point(point1);
        if ((r1, c1) === (r, c) || letter === "?" || letter1 === "?") {
          continue;
        }
        if (letter1 === letter) {
          solver.add_program_line(`:- not ${tag}(${r}, ${c}, ${r1}, ${c1}).`);
        } else {
          solver.add_program_line(`:- ${tag}(${r}, ${c}, ${r1}, ${c1}).`);
        }
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
      data: "m=edit&p=7VRNj5swEL3zKyqf54BtPn3LsqGXNO02qVYrhFYsZbWoidjyUVVG+e8ZD2hBKJce2uawsvz0eDO2n8dimp9dVhfAJXAfZAA2cByuFOAFDmoBTXsc+7I9FOoDrLr2paqRAHyOY3jODk1hJWNWavU6VPoO9EeVMM6ACZycpaDvVK8/Kb0FvcMQA47aZkgSSNcTvae4YdEgchv5duRIH5DmZZ0fisfNoHxRid4DM+fc0GpD2bH6VbDRh/nOq+NTaYSnrMXLNC/l6xhpuu/Vj27M5ekJ9Gqwu7tgV052DR3sGnbBrrnFX7YbpqcTlv0rGn5UifH+baLBRHeqR9yqnjncLI3Qy/A2zJVGuJ0EzzXCzST4lLGaCeEig9v+UuG0aHYO9+jk2TY8FItVQi7dCYdyZvaEHxglnimBt1RC2mc9KZLTPm8KVoNTTR4IY0JBuMeSgZaEt4Q2oUu4oZw14T1hROgQepTjm6L/0bP8AzuJ9OgfvzTc98g1R1IrYbuufs7yAptAVB1fq6ZsC4Yd92Sx34xmgq0cnPcm/J+asHkC+9r++Wuzg10otc4=",
      test: false,
    },
    {
      data: "m=edit&p=7ZRfb9owFMXf8ymq++wHOw4U/DIFSrYHlv0JU1VZURWyVI0GyhZINRnx3XvvdbSkUx/2sq2TJuPD4eeLOXawD9+6oq2EkvTSM4Hv2CI14x7Optxl3zb1cVeZCxF3x/umRSPEuyQRd8XuUAW2r8qDk5sbFwv32lhQICDEriAX7oM5ubfGpcJlOAQiQrb2RSHa1WCveZzc0kMl0ae9R3uDtqzbclfdrj15b6zbCKDfWfC3ycK+eaigz0Gfy2a/rQlsiyMu5nBff+1HDt3n5kvX16r8LFzs42bPxNVDXLI+Lrln4tIqfnPceX4+47Z/xMC3xlL2T4OdDTYzJ9ASTCRAKzAhopSQpnmuMJh/UKDnP4FpSGA5gEsGbwYwx/ksxANQkktGkygZEVmMiGKSjEjI86xGJOJ045oJ17waEZ/vCeGZfxBcqTIn1BvWhDVk3eDeCKdZr1gl64R1zTUr1mvWJWvEOuWaS9rdX9x/v+V/II7V/jA/bZN/j+WBhaxr74qywv9+2u23VXuRNu2+2AFeNucAvgN3q+nu+n///KX7hx6BfGmn4KXFwXOZB48=",
    },
  ],
};
