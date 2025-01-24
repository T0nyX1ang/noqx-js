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

  // const start = performance.now();
  // const stop = performance.now();
  // if (stop - start >= Config.time_limit) {
  //   console.warn(
  //     `[Solver] ${puzzleName.replace(/\b\w/g, (l) =>
  //       l.toUpperCase()
  //     )} puzzle timed out.`
  //   );
  //   throw new Error("Time limit exceeded.");
  // }

  // console.info(
  //   `[Solver] ${puzzleName.replace(/\b\w/g, (l) =>
  //     l.toUpperCase()
  //   )} puzzle solved.`
  // );

  // console.info(
  //   `[Stats] ${puzzleName.replace(/\b\w/g, (l) =>
  //     l.toUpperCase()
  //   )} solver took ${stop - start} milliseconds.`
  // );

  return solutions; // return the first solution
}
