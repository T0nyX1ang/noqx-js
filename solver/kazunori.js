/** The Kazunori Room solver. */

function number_appear_twice() {
  /**
   * Generate a constraint for a number appearing twice in an area.
   */
  return ":- area(A, _, _), number(_, _, N), #count { R, C : area(A, R, C), number(R, C, N) } > 2.";
}

function avoid_2x2_number() {
  /**
   * Generate a constraint for avoiding 2x2 number cells.
   */
  return ":- number(R, C, N), number(R + 1, C, N), number(R, C + 1, N), number(R + 1, C + 1, N).";
}

function area_num_adjacent(adj_type = 4) {
  /**
   * Generate a constraint to ensure adjacent cells with the same number in an area.
   */
  return `:- area(A, R, C), number(R, C, N), #count { R1, C1: area(A, R1, C1), number(R1, C1, N), adj_${adj_type}(R, C, R1, C1) } != 1.`;
}

modules["kazunori"] = {
  name: "Kazunori Room",
  category: "num",
  aliases: ["kazunoriroom"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(number_appear_twice());
    solver.add_program_line(avoid_2x2_number());
    solver.add_program_line(area_num_adjacent(4));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      fail_false(ar.length % 2 === 0, `Area ${i} must have an even number of cells.`);
      solver.add_program_line(area(i, ar));
      solver.add_program_line(
        fill_num(Array.from({ length: Math.floor(ar.length / 2) }, (_, i) => i + 1), "area", i) // prettier-ignore
      );
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_type(pos, "normal");

      if (d === BaseDir.CENTER.description) {
        fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }

      if (d === BaseDir.TOP.description && r > 0 && Number.isInteger(num)) {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r - 1}, ${c}, N1), N + N1 != ${num}.`);
      }

      if (d === BaseDir.LEFT.description && c > 0 && Number.isInteger(num)) {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r}, ${c - 1}, N1), N + N1 != ${num}.`);
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVPT9tOEL3nU6A9z2H/edf2jVJ+vVC3/UGFkGVFIbglaqLQhFSVo3x33uyuGzCqEKqgl8ry7PN4dvbN8+x6/X0zWbWUkyeTkySFy1hNRlqyToVbputsdjtvywM63NxeL1cARB8q+jKZr9tRnYKa0bYryu6QundlLZQgoXEr0VD3qdx278uuou4UrwQp+E5ikAY83sPz8J7RUXQqCVwBO0EO8AJwOltN5+34JCb6WNbdGQle502YzVAslj9akXjw83S5uJyx43Jyi1rW17Ob9Ga9uVp+26RY1eyoO/w9XbOnyzDSZTSkm+p5YbpFs9tB9v9BeFzWzP3zHuZ7eFpuYatyK4zUPNdCTYKmSGhU9siTP/IUQ492Q48xQ49VQ0/22DNc3WZy6HFDztYP81j/kA/KVaHoi2D/C1YHewZNqDPBvg1WBpsFexJijiGVcgUpDzIabZzlD3EGQQJGjEt+C3+PPTZUDtqMc02qsBEXlrQEVWCMpFlqxioHjjkxkjYosJ+bQ9iADfJArpAnA455MAL7hD3ypzwSOe9jHblhBI75MWKtmB+x4JBiFMdE/hiBU4w2wLEWjMA9H+afagdWRdKnQE6ZckrklH1dzDnWrrxFjakWh3p90oqxS7U71O6SP2N/wjzXJw4emnAbBIz8PmmSI6bXyrOe/Vxeq8+P4+8XxrdziSf7uf00muI8tMZRsDZYF1rG8yZ73jaMu4cPiXBE/nm3Pkmv1lDkwQW1XvK5GdXi+Opre1AtV4vJHMdXtVlctqv+Gf+L3Uj8FOGu8XnJ/vuF/KVfCH8C+awOfoWOfYJODXXR0/d2EYmbzXgyni7RbLJ5dbrYY83oDg==",
    },
  ],
};
