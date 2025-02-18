/** Manager of all the solvers as a plugin. */

const modules = {};

async function runSolver(puzzle_name, puzzle_content, param) {
  /**
   * Run the solver.
   */
  const module = modules[puzzle_name];

  const puzzle = new PenpaPuzzle(puzzle_name, puzzle_content, param);
  puzzle.decode();
  const solution_data = await module.solve(puzzle);
  const solutions = solution_data.map((sol) => sol.encode());

  return solutions;
}
