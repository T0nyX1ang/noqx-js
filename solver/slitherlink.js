/** The Slitherlink solver. */

function passed_vertex() {
  /**
   * Generate a rule to get the cell that passed by the loop.
   */
  let rule = "passed_vertex(R, C) :- edge_top(R, C).\n";
  rule += "passed_vertex(R, C) :- edge_left(R, C).\n";
  rule += "passed_vertex(R, C) :- grid(R, C), edge_top(R, C - 1).\n";
  rule += "passed_vertex(R, C) :- grid(R, C), edge_left(R - 1, C).\n";
  return rule.trim();
}

function count_adjacent_vertices(target, src_cell) {
  /**
   * Return a rule that counts the adjacent vertices around a cell.
   * An edge rule should be defined first.
   */
  const [src_r, src_c] = src_cell;
  const [rop, num] = target_encode(target);
  const v_1 = `passed_vertex(${src_r}, ${src_c})`;
  const v_2 = `passed_vertex(${src_r + 1}, ${src_c})`;
  const v_3 = `passed_vertex(${src_r}, ${src_c + 1})`;
  const v_4 = `passed_vertex(${src_r + 1}, ${src_c + 1})`;
  return `:- { ${v_1}; ${v_2}; ${v_3}; ${v_4} } ${rop} ${num}.`;
}

function count_adjacent_segments(target, src_cell) {
  /**
   * Return a rule that counts the adjacent segments around a cell.
   * An edge rule should be defined first.
   */
  const [rop, num] = target_encode(target);
  const vertex_count = count_adjacent_vertices(target, src_cell)
    .replace(`${rop} ${num}.`, "= C1")
    .replace(":-", "")
    .trim();
  const edge_count = count_adjacent_edges(target, src_cell).replace(`${rop} ${num}.`, "= C2").replace(":-", "").trim();
  return `:- ${vertex_count}, ${edge_count}, C1 - C2 ${rop} ${num}.`;
}

modules["slitherlink"] = {
  name: "Slitherlink",
  category: "loop",
  aliases: ["slither", "touchslither", "vertexslither", "sheepwolfslither"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row + 1, puzzle.col + 1));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("slither"));
    solver.add_program_line(fill_path("slither"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("slither", "loop"));
    solver.add_program_line(single_loop("slither"));
    solver.add_program_line(convert_direction_to_edge());

    if (puzzle.param["vslither"] === true || puzzle.param["tslither"] === true) {
      solver.add_program_line(passed_vertex());
    }

    if (puzzle.param["swslither"] === true) {
      solver.add_program_line(separate_item_from_loop("sheep", "wolf"));
    }

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (puzzle.param["swslither"] && clue === "W") {
        solver.add_program_line(`wolf(${r}, ${c}).`);
      } else if (puzzle.param["swslither"] && clue === "S") {
        solver.add_program_line(`sheep(${r}, ${c}).`);
      } else {
        fail_false(Number.isInteger(clue), "Clue should be an integer or wolf/sheep with varient enabled.");

        if (puzzle.param["vslither"] === true) {
          solver.add_program_line(count_adjacent_vertices(parseInt(clue), [r, c]));
        } else if (puzzle.param["tslither"] === true) {
          solver.add_program_line(count_adjacent_segments(parseInt(clue), [r, c]));
        } else {
          solver.add_program_line(count_adjacent_edges(parseInt(clue), [r, c]));
        }
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
      data: "m=edit&p=7VRNb9pAEL3zK6I978Efa7B9oyn0Qp22oYoiy0KGuMWKqVODq2gR/z1vxqaLVUdRRcWpMh692fdmmZ3Z8fZnnVaZHOFRnrSkjccdWvw2v+Mzz3dFFl7Jcb1blxWAlDfTqfyWFttsELeqZLDXQajHUn8IY+EKKWy8jkik/hzu9cdQR1LfghLSxtoMCAIHcGLgHfOErptF2wKOWgx4D7jKq1WRLWbNyqcw1nMp6H/ecTRBsSl/ZaIJY39VbpY5LSzTHQ6zXedPLbOtH8rHutXayUHqcZPupCdd16RLsEmXUE+6dIqz080evmfPfZkGyeGAin9BroswprS/GugbeBvuYaNwLxwPoS6ajHDs5gRwqeeN6xLrGHcIl+5E6466bDdWWR2xsjtiRbFG7HXZIW1lshq5XZdYI/bpj8xWPm1lxD7FnrCq63aPH1CsYYPT46NgNpftnu2UrcN2jqpK7bJ9z9Zi67GdsWbC9o7tNVvFdsiaEfXlrzp3fjroPc4X+Oicj8YSsF0lbYVVt8V0ARh7WIeIsDpq3jxP7EB68mCTf+0lg1hMMA5XUVlt0gJDEdWbZVYdfXyADgPxLPjlTqv/36TLf5Oo+taF7/e54xajsL8nQuobKZ7qRbpYlbhlqJ6hMSSv0s3c9NOYv34C8/jahu3w/UFfvHaYbrEt8t06q4r8x6NIBi8=",
    },
    {
      data: "m=edit&p=7VVNb9NAEL37V1R73sPO+iO2b21JuIRASVBUWVaVpIZGJArkA1WO8t87+5zAegLlgEBIoI1Hk+eZ5zezX5vPu8m60hmPKNZGE48oNnjSyP3McYzm20WVX+jL3fZhtWZH69e9nn4/WWyqoDhGlcG+zvL6Rtcv80KFSivix6pS1zf5vn6V1wNdD/mV0sRYnz0OCNntNq5ld4z3DrxuIg27g+a9y7pldzZfzxbVXb/JeJMX9Ugr95krpDhXLVdfKtWk4f9stZzOHTCdbLmWzcP80/HNZne/+rg7xlJ50PVlo7b7vFrnPqfWaftltdX9h+rxe0Kz8nDgfr9lqXd54VS/++YO8z3bQb5XNnXxPBfkZoNJbHaq9AiE5ICh0ukJCCUQy5REABE4rAdYB4xdQ04IWP2cjgQgtZUDrZ74WCqJocSPAKtPEoPW0xaD1Q9JjAhJZD0JaL2eJGckHUnSQQ98AC1o5aAejzZFjldgGskIWXEmpysDqf+ZTM5Xhp74wFk5ZOS6ICNnjIxcXWTOiQiNMV4QgbodJJtFhLpaCLh9xIK6RWTl1JGVi4Ys+tFOO6stPFPUbIwWIuePQrlQKJQbjqJ2Q3inEvbrLWwP1sKOeDvrOoR9AWtgY9g+YrqwY9hr2Ag2QUwHNj0dDT8+Mr6GeKfHb1d2CAqb4trxR/x3IWVQqC4fwxeD1Xo5WfBhPNgtp9X69J+vvUOgHhWewmob84Xw/yr8w1eha775+YX4T282XqdFGTwB",
      config: { swslither: true },
    },
    {
      data: "m=edit&p=7VTLbtswELzrK4o98yDqYVO8uW7ci5s+7CIIBCFwHKYWIlepHkVAw/+e3ZUAmkGAoijQ+lDQGsxyZ8kR12L7o980RmQ4YiVCIXHEKuRHJfQLx7Euu8roN2LWd7u6QSLEx8VC3G+q1gT5qCqCg820nQn7XucQgwCJTwSFsJ/1wX7QsK33tyUIu8I8CImJJTJURUgvHL3iPLH5MClD5JcjR3qNdFs228rcLIeZTzq3awG02VuuJgr7+qeBoYzjwQBO3G46fKN2Vz6Omba/qx/6USuLo7CzX3iOnWeig2dir3imV/ljz+bum3l6zW5WHI949l/Q8I3OyftXR5WjK31AvNQHiDIsjbDdWI6rxSmG1P0hTGIMYxe+yE692pSyTpxS1olT2shlJ9Krnfjiqb+R8sXKd6X8fRUt5cKMxK4287My9JeWofJ2ljLy4+hlnJysh2cq+WSvGReMEeMaD17YmPEdY8iYMi5Zc8F4xThnTBgnrJlS636ruX/BTh4pvixOR3peM0WQw6pv7jdbg5/MvN4/1m3ZGcBL6hjAE/DDLUz+31v/8t6iPoTn9gc/Nzv4yUFbld3ONFX5/QGK4Bk=",
      config: { tslither: true },
    },
    {
      data: "m=edit&p=7VRdb5swFH3nV1R+9gOYr+K3rCN7ydhHM1UVQhFJvQUVxsbHVBnx33vvhc5Bysu0qcrD5HB0jn0Mx9eO25993igeQvN8bnMHmhvY9Ey/l7YtulLJK77qu2PdAOH8w3rNv+Zlq6x0dmXWoCOpV1y/kylzGWcOPIJlXH+Sg34vdcL1LQwx7kDfBhgYBNDY0DsaR3YzdTo28GTmQO+BHormUKrdZur5KFO95Qy/84ZmI2VV/UuxaRrpQ13tC+zY5x0spj0WP+aRtn+oH/vZ62Qj16spbnwmrmviIp3iIjsTF1fx13HVwzf1dC5plI0jVPwzZN3JFGN/MfTa0Fs5ACZyYMKDqQI2GabD20QAEvd8ltcL6doLs4fmE4lmI300m7m+AOn9lsHSHKLZNXJpDjGkkRGaTySazasiNJvvRqcrgkU7tPR7wjWhINxCZbh2Cd8S2oQ+4YY8MeEd4Q2hRxiQJ8Ta/lH1XyFOKrBQpvn/XmVWymI4kVdJ3VR5Cecy6au9al403AGjxZ4YPbTJ3v9r4fWvBay+fWnH89LiwB+GtWXRHVVTFt8fWWY9Aw==",
      config: { vslither: true },
    },
    {
      url: "http://pzv.jp/p.html?slither/25/15/i5di5di6bg3ad13dc13bd3cg5bi7ci7dhai6bi6ci7b02bd33cc23d8ci8ai6cibh6di6bi7dg1ca31ab10dc3dg6bi6ai6chai7ci7ci8d33dc33cc20d8bi7di7cidh8di5ci6cg3dd03cb02ad3dg6bi7ci6bg",
      test: false,
    },
  ],
  parameters: {
    swslither: { name: "Sheep/Wolf Variant", type: "checkbox", default: false },
    tslither: { name: "Touch Variant", type: "checkbox", default: false },
    vslither: { name: "Vertex Variant", type: "checkbox", default: false },
  },
};
