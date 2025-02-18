/** The Dotchi-Loop solver. */

function dotchi_constraint() {
  /**
   * Generate a constraint for the Dotchi-Loop puzzle.
   */
  let rule = "turning_area(A) :- area(A, R, C), white(R, C), turning(R, C).\n";
  rule += "straight_area(A) :- area(A, R, C), white(R, C), straight(R, C).\n";
  rule += ":- area(A, _, _), turning_area(A), straight_area(A).";
  return rule;
}

modules["dotchi"] = {
  name: "Dotchi-Loop",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("white"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("dotchi"));
    solver.add_program_line(fill_path("dotchi"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("dotchi", "loop"));
    solver.add_program_line(single_loop("dotchi"));
    solver.add_program_line(loop_straight("dotchi"));
    solver.add_program_line(loop_turning("dotchi"));
    solver.add_program_line(dotchi_constraint());

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_L__1") {
        solver.add_program_line(`white(${r}, ${c}).`);
        solver.add_program_line(`dotchi(${r}, ${c}).`);
      }
      if (symbol_name === "circle_L__2") {
        solver.add_program_line(`not dotchi(${r}, ${c}).`);
      }
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Vbvaxs5EP3uvyLoswo70v7Q7rdcmtwXN7lrUkJYjHEcX23qdF3/OMIa/+95I8nY7U7I3RUChcNe+XlG0rx5Gkm7+rYZLSeaEv5ap/GLT0rOP8bl/kni52a2nk+qE326WU+bJYDWVxcX+q/RfDXp1bHXoLdty6o91e3vVa2M0v4hNdDtn9W2/VC1d7q9hktpgq0PREobwPMDvPV+RmfBSAnwZcSAd4Dj2XI8nwz7wfJHVbc3WnGc3/xohuqx+XuiwjD/f9w83s/YcD9aI5nVdLaIntXmofmyiX1psNPtaaDbF+jaA12GgS4jgS5n8dN057OvkyeJaTnY7aD4R3AdVjXT/nSA7gCvqy3aS9+Sb++qrbKEaQhxjrkpa0VrJloLyZqmojWH1XSsTrJmRrSWkjUXs8g5i25f5tDpW4h8C7GvS0Qr69CJ5phvp2/JfDt9S5FvKapOiUiCElE1Sjg9wSzmR4m4IERybyOKT0asITI8d9dsZd5WXBayYh1RKgpIci1SKi4YpWKFUSZnmcvLkHM6P5ix4y78vjO+vcG21K317XvfJr7NfNv3fc6xQw2l2rBq4GQI57FFSI8LYLBibHBWp4jJ2CbASNljAkYBMU6NNhmE8xhzZnHONANG0owzzF/E+TPMWcQ5C4x1cSzuA8vVB4xfbSnEsokBDn0sWW0N9PU4BQ6x4Nc28odf2zTwhx84xIIfOM6ZkrZZ4A8/cJwf/O2ef1Zqw8vAOEfufBh4jNx5HTwGfz4OPIZueRybI8c85p5jnn3uDmNdHOs49zjWWeCorYOGLmrroOGRPoYPA48Ry8VYju/TGMshVhljleDMB8JewyTEwi/wXlvkm0QdkhI6Rw350qY4lqAVRQ2J14LnQRHd+lI6823q29yXWMH3wn++Of5tNavUgFvp+LCGIAywiFyblvkeIT4KgODlFbZhG7yaR42y4VeX7z/Zr2cb9GrVx2V/ctksH0dzXPnnD5+P/l1PR4uJwkvWrqeelH9qy+9s/793vf17F6ufvNke+odb4RU6NYSNe0+3V1otNsPRcNygtqCdd4btKDuxe2UH9vfL02FPv+AM27zjfHPNcIKoh2Y9ns7ezZtmoQa9Zw==",
    },
    {
      url: "https://puzz.link/p?dotchi/11/11/00g5g5k5k5k5k5k5k1k100fv003v0000000000vo00vu13a0b3j3a6a6j6j6a3a3j6b6b3a3a3b6j6j393a30",
      test: false,
    },
  ],
};
