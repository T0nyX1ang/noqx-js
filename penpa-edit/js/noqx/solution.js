/* Generate solutions for the given problem. */

// class Config {
//     /* Configuration for the solver. */;
//     time_limit = 30;
//     max_solutions_to_find = 10;
//     parallel_threads = 1;
// }

class ClingoSolver {
  constructor() {
    // initialize the clingo solver
    this.program = "";
    this.puzzle = null;
    this.solutions = [];

    clingo.init(
      "https://cdn.jsdelivr.net/npm/clingo-wasm@0.1.1/dist/clingo.wasm"
    );
  }

  registerPuzzle(puzzle) {
    this.puzzle = puzzle;
    console.log("[Solver] Puzzle registered.");
  }

  storeSolutions(solutionData) {
    if (!this.puzzle) throw new Error("Puzzle not registered.");
    const solution = this.puzzle;
    solution.clear();

    for (const item of solutionData.Value) {
      const parts = item.replace("(", " ").replace(")", " ").split(" ");
      if (parts.length < 2) continue;
      const [_type, _data] = parts;
      const data = _data.split(",") || [];

      const r = parseInt(data[0], 10);
      const c = parseInt(data[1], 10);

      if (_type.startsWith("edge_")) {
        for (const d of BaseDir) {
          if (_type === `edge_${d.value}`) {
            solution.edge.set(new BasePoint(r, c, d), true);
          }
        }
      } else if (_type.startsWith("grid_")) {
        const grid_direction = String(data[2]).replace('"', "");
        if (this.puzzle.puzzle_name === "hashi") {
          solution.line.set(
            new BasePoint(r, c, BaseDir.CENTER, `${grid_direction}_${data[3]}`),
            true
          );
        } else {
          solution.line.set(
            new BasePoint(r, c, BaseDir.CENTER, grid_direction),
            true
          );
        }
      } else if (_type.startsWith("number")) {
        if (this.puzzle.puzzle_name === "easyasabc") {
          // convert penpa number to letter
          solution.text.set(
            new BasePoint(r, c, BaseDir.CENTER, "normal"),
            this.puzzle.param["letters"][parseInt(data[2], 10) - 1]
          );
        } else {
          solution.text.set(
            new BasePoint(r, c, BaseDir.CENTER, "normal"),
            parseInt(data[2], 10)
          );
        }
      } else if (_type.startsWith("content")) {
        solution.text.set(
          new BasePoint(r, c, BaseDir.CENTER),
          String(data[2]).replace('"', "")
        );
      } else if (_type === "triangle") {
        const shaka_dict = {
          '"ul"': "1",
          '"ur"': "4",
          '"dl"': "2",
          '"dr"': "3",
        };
        solution.symbol.set(
          new BasePoint(r, c, BaseDir.CENTER),
          `tri__${shaka_dict[data[2]]}`
        );
      } else if (_type === "gray") {
        solution.surface.set(new BasePoint(r, c), BaseColor.GRAY);
      } else if (_type === "black") {
        solution.surface.set(new BasePoint(r, c), BaseColor.BLACK);
      } else if (data.length === 2) {
        solution.symbol.set(new BasePoint(r, c, BaseDir.CENTER), String(_type));
      } else {
        // for debugging
        solution.text.set(new BasePoint(r, c, BaseDir.CENTER), String(data[2]));
      }
    }
    this.solutions.push(solution);
  }

  addProgramLine(line) {
    if (line) this.program += line + "\n";
  }

  reset() {
    // reset the solver
    this.program = "";
    this.puzzle = null;
    this.solutions = [];
  }

  async solve() {
    // solve the problem
    const result = await clingo.run(this.program);

    if (result.Result === "Error") {
      throw new Error(result.Error);
    }

    if (result.Result === "UNSATISFIABLE") {
      throw new Error("No solution found.");
    }

    const puz_name = modules[this.puzzle.puzzle_name].name;

    console.info(`[Solver] Puzzle ${puz_name} solved.`);
    console.info(
      `[Solver] ${puz_name} Solver took ${result.Time.Total} seconds.`
    );

    const solutionData = result.Call[0].Witnesses[0];
    if (solutionData) {
      this.storeSolutions(solutionData);
    }
  }
}

const solver = new ClingoSolver();
