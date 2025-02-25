/** The Detour solver. */

modules["detour"] = {
  name: "Detour",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("detour(R, C) :- grid(R, C).");
    solver.add_program_line(fill_path("detour"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("detour", "loop"));
    solver.add_program_line(single_loop("detour"));
    solver.add_program_line(loop_turning("detour"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "sudoku_0").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(`:- #count { R, C: area(${i}, R, C), turning(R, C) } != ${num}.`);
        }
      }
    }

    for (const [key, draw] of Object.entries(puzzle.line)) {
      const [r, c, _, d] = key.split(",");
      solver.add_program_line(`:-${" not".repeat(draw)} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVNb9s4EL37VwQ8z0EkJZPUpUhTZy+us22yCALDMBxH3RhrV6k/FoEM//e8GVJxFrWRRRbIXgpB1OObkfT4OCOtfmwmy4o8DuspI43D5kZOkwU5s3Rczdbzqjyh0836vl4CEF2cn9O3yXxVdYYpa9TZNqFsTqn5rRwqo0hOrUbUfCm3zeey6VFziZAiDa4PpBUZwN4eXkuc0VkkdQY8ALbxthvA6Ww5nVfjfmR+L4fNFSl+z0e5m6Fa1H9XKj5C5tN6cTtj4nayxmJW97OHFFlt7uq/NilXj3bUnEa5/QNy7V4uwyiX0QG5vIr/LHc++17Vj4ekhtFuB8u/Quy4HLLuP/bQ7+FlucU4kFGXW9X1GZ5gWQyw56d9EGmqG7qY5YKdz4FRFMA+4zsSduY5x8vdKB3g4Pb3hsA5/Aa88kZefC6jkfEKuqixMn6SMZOxkLEvOT0I1UUg7bQqDcqoi9c7mzAe7YqIHXifeAfet3wB7CL24EPiPfjQ8g44RBwKVHzig+PqTxidoKMGxIEjLx1iEq81cNSAOBmbeAPeJt5Y4KgBcTJ54i34vOWhIY8aECdTJD4HX7Q8NBRJm+e1w2rBZu8Dr5e3TzC2pPWE1+6xTYK7L/yBD7yVgj1wu0b2JObj+uyP+JDFfFyfvRJPNEpFfMj2vrE/OurEFbj1hL1K+Rb5rW/sj035Fvmth+yVjevC9YWf0GmTTgudlnWiiK6llM5kzGXsSok5bow3tM7bqlnZLrQFTwAQxsA5cvDPcpuRg3uMAnFjAvlAIaKQUYAnjDRxU9nYGq+ubWiwvf84sPXvOR91hqqPT9fJoF4uJnN8v3p3f76YDTaL22rZzvHr2HXUo5KTPxyU//qb/A9/E7Y/e7fG+Je1/IqcIZxNDUXNBamHzXgyntYoMpgXg9Jjx4LSdkeCsROPBGNzHgtKvx4O4ntwLOB+Cry72/h4qLtqXW+WatR5Ag==",
    },
    {
      url: "https://puzz.link/p?detour/12/12/4i461svho42s221q10sfps312904a1aldml2h84k190ka5bdlak2h03147g91374232",
      test: false,
    },
  ],
};
