/** The Nonogram solver. */

function nono_row(col, clues, color = "black") {
  /**
   * Generates the nonogram row constraints.
   */
  const prefix = "row_count(R, C, N, V) :- grid(R, C), row_count_value_range(R, N, V)";
  const constraints = [];
  constraints.push("row_count(R, -1, -1, 0) :- grid(R, _), R >= 0.");
  constraints.push(`${prefix}, not ${color}(R, C), row_count(R, C - 1, N, _), V = 0.`);
  constraints.push(
    `${prefix}, ${color}(R, C), grid(R, C - 1), not ${color}(R, C - 1), row_count(R, C - 1, N - 1, _), V = 1.`
  );
  constraints.push(`${prefix}, ${color}(R, C), grid(R, C - 1), ${color}(R, C - 1), row_count(R, C - 1, N, V - 1).`);

  for (const [i, clue] of Object.entries(clues)) {
    constraints.push(`row_count_value_range(${i}, -1, 0).`);
    if (clue.length === 1 && clue[0] === 0) {
      constraints.push(`:- grid(${i}, C), not row_count(${i}, C, -1, 0).`);
    } else {
      constraints.push(`:- not row_count(${i}, ${col - 1}, ${clue.length - 1}, _).`);
      for (const [j, num] of clue.entries()) {
        if (num !== "?") {
          const slope = `row_count(${i}, C, ${j}, V), row_count(${i}, C + 1, ${j}, 0)`;
          constraints.push(`row_count_value_range(${i}, ${j}, 0..${num}).`);
          constraints.push(`:- grid(${i}, C), ${color}(${i}, C), ${slope} , V != ${num}.`);
        } else {
          constraints.push(`row_count_value_range(${i}, ${j}, 0..${col + 2 - 2 * clue.length}).`);
        }
      }
    }
  }

  return constraints.join("\n");
}

function nono_col(row, clues, color = "black") {
  /**
   * Generates the nonogram column constraints.
   */
  const prefix = "col_count(R, C, N, V) :- grid(R, C), col_count_value_range(C, N, V)";
  const constraints = [];
  constraints.push("col_count(-1, C, -1, 0) :- grid(_, C), C >= 0.");
  constraints.push(`${prefix}, not ${color}(R, C), col_count(R - 1, C, N, _), V = 0.`);
  constraints.push(
    `${prefix}, ${color}(R, C), grid(R - 1, C), not ${color}(R - 1, C), col_count(R - 1, C, N - 1, _), V = 1.`
  );
  constraints.push(`${prefix}, ${color}(R, C), grid(R - 1, C), ${color}(R - 1, C), col_count(R - 1, C, N, V - 1).`);

  for (const [i, clue] of Object.entries(clues)) {
    constraints.push(`col_count_value_range(${i}, -1, 0).`);
    if (clue.length === 1 && clue[0] === 0) {
      constraints.push(`:- grid(R, ${i}), not col_count(R, ${i}, -1, 0).`);
    } else {
      constraints.push(`:- not col_count(${row}, ${i}, ${clue.length - 1}, 0).`);
      for (const [j, num] of clue.entries()) {
        if (num !== "?") {
          const slope = `col_count(R, ${i}, ${j}, V), col_count(R + 1, ${i}, ${j}, 0)`;
          constraints.push(`col_count_value_range(${i}, ${j}, 0..${num}).`);
          constraints.push(`:- grid(R, ${i}), ${color}(R, ${i}), ${slope}, V != ${num}.`);
        } else {
          constraints.push(`col_count_value_range(${i}, ${j}, 0..${row + 2 - 2 * clue.length}).`);
        }
      }
    }
  }

  return constraints.join("\n");
}

modules["nonogram"] = {
  name: "Nonogram",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const top_clues = {};
    for (let c = 0; c < puzzle.col; c++) {
      top_clues[c] = [];
      for (const [point, clue] of puzzle.text.entries()) {
        const [r, c1, d, pos] = extract_point(point);
        if (r <= -1 && c1 === c && d === BaseDir.CENTER.description && pos === "normal") {
          top_clues[c].push(clue);
        }
      }
    }

    const left_clues = {};
    for (let r = 0; r < puzzle.row; r++) {
      left_clues[r] = [];
      for (const [point, clue] of puzzle.text.entries()) {
        const [r1, c, d, pos] = extract_point(point);
        if (r1 === r && c <= -1 && d === BaseDir.CENTER.description && pos === "normal") {
          left_clues[r].push(clue);
        }
      }
    }

    solver.add_program_line(`grid(-1..${puzzle.row}, -1..${puzzle.col}).`);
    solver.add_program_line(shade_c());
    solver.add_program_line(`not black(-1, -1..${puzzle.col}).`);
    solver.add_program_line(`not black(-1..${puzzle.row}, -1).`);
    solver.add_program_line(`not black(${puzzle.row}, -1..${puzzle.col}).`);
    solver.add_program_line(`not black(-1..${puzzle.row}, ${puzzle.col}).`);
    solver.add_program_line(nono_row(puzzle.col, left_clues));
    solver.add_program_line(nono_col(puzzle.row, top_clues));

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
      data: "m=edit&p=7VU9b9swEN31K4KbbxD1YUtcCteNu7hKW7sIAkEwZFVBjMpQKltFQUP/PXcnKQ7YDM3QZCloPj8/8sjHIw8+/GzzpsQpNT9CFxU13w2kT1z+jG29O1alvsBZe7yrGyKIV4sF3ubVoXRSn2ZQz5yTibWZofmoU1CA4FFXkKH5ok/mkzYJmhUNAQakLftJHtHLM72WcWbzXlQu8WTgRG+IFrumqMrNslc+69SsEXif9xLNFPb1rxIGH/y7qPfbHQvb/EiHOdzt7oeRQ/u9/tEOc1XWoZn1dlejXbYz2PXPdpn2dpk9Y5fD/rHdOOs6SvtXMrzRKXv/dqbRma70iTDRJ/AjDn1HXvq7AT+2hMC1BTUmZxTskNAOCe2Q0GOBHsSjYPsI7UWn9qKRCE8WjexdYhGehMSy7aNAOVCSiRvBhaAnuKZEofEFPwi6gqHgUuZcCl4LzgUDwYnMmXKq//IyYEJnCeiMZNjrb+YVvKVU0lzkCqPnvzMnhVXb3OZFSa8taffbsrlI6mafV0Dl3TnwG6RTzSuq4v8V/zYVz1fgvqju3/7lp5Rden/mCuG+3eSboq6A/jRQdPUyffqn/uqnpXLKnAc=",
    },
    {
      url: "https://puzz.link/p?nonogram/31/13/m513j1111i531q55k11111h5111p55k111j131q55k11k55k11k135j1l55k111j55r35k311j35r51k115j51zn3353133o11111111111k131113133m11111111111k11111111333zg3113313311l111111111111111g3331111133l111112121111j11111111111111x",
      test: false,
    },
  ],
};
