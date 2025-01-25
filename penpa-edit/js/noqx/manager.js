/** Manager of all the solvers as a plugin. */

const modules = {};

async function runSolver(puzzleName, puzzleContent, param) {
  /**
   * Run the solver.
   */
  const module = modules[puzzleName];

  const puzzle = new PenpaPuzzle(puzzleName, puzzleContent, param);
  puzzle.decode();
  const solutionData = await module.solve(puzzle);
  const solutions = solutionData.map((sol) => sol.encode());

  return solutions;
}
