/** The Coral solver. */

function len_segment(color = "black") {
  /**
   * Generate a rule to get the length of segments.
   */
  let rule = `nth_horizontal(R, C, 1) :- ${color}(R, C), not ${color}(R, C - 1).\n`;
  rule += `nth_horizontal(R, C, N) :- ${color}(R, C), nth_horizontal(R, C - 1, N - 1).\n`;
  rule += `nth_vertical(R, C, 1) :- ${color}(R, C), not ${color}(R - 1, C).\n`;
  rule += `nth_vertical(R, C, N) :- ${color}(R, C), nth_vertical(R - 1, C, N - 1).\n`;
  rule += `len_horizontal(R, C, N) :- nth_horizontal(R, C, 1), nth_horizontal(R, C + N - 1, N), not ${color}(R, C + N).\n`;
  rule += `len_vertical(R, C, N) :- nth_vertical(R, C, 1), nth_vertical(R + N - 1, C, N), not ${color}(R + N, C).\n`;
  return rule.trim();
}

modules["coral"] = {
  name: "Coral",
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

    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("black"));
    solver.add_program_line(border_color_connected(puzzle.row, puzzle.col, "not black"));
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(len_segment("black"));

    for (const [r, clue] of Object.entries(left_clues)) {
      if (clue.length) {
        const counts = clue.reduce((acc, num) => {
          acc[num] = (acc[num] || 0) + 1;
          return acc;
        }, {});

        for (const [num, count] of Object.entries(counts)) {
          solver.add_program_line(`:- #count{ C: grid(${r}, C), len_horizontal(${r}, C, ${num}) } != ${count}.`);
        }

        const forbidden_len = Object.keys(counts)
          .map((x) => `N != ${x}`)
          .join(",");
        solver.add_program_line(`:- grid(${r}, C), len_horizontal(${r}, C, N), ${forbidden_len}.`);
      }
    }

    for (const [c, clue] of Object.entries(top_clues)) {
      if (clue.length) {
        const counts = clue.reduce((acc, num) => {
          acc[num] = (acc[num] || 0) + 1;
          return acc;
        }, {});

        for (const [num, count] of Object.entries(counts)) {
          solver.add_program_line(`:- #count{ R: grid(R, ${c}), len_vertical(R, ${c}, ${num}) } != ${count}.`);
        }

        const forbidden_len = Object.keys(counts)
          .map((x) => `N != ${x}`)
          .join(",");
        solver.add_program_line(`:- grid(R, ${c}), len_vertical(R, ${c}, N), ${forbidden_len}.`);
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
      data: "m=edit&p=7VZdb+M2EHz3rwj4vA+kRMqS3tL00pfU19YpgoNhGI7r9Izap9SOi0KG/3tmlnRktQGuRYAABQrD3Bl9cGd2KUq73/fz7VJcEJdLXooVh19hSwl5Jq4Aw9+m3+3qab2sL+Ry//S52QKIfLy+lof5erccTHJcEcROB4e2qttLab+rJ8YZMRn+zkyl/bE+tN/X7UjaMU4Z8Th2Ey/KAD908E7PE13Fg84CjxIG/AS4WG0X6+XsJh75oZ60t2KY5xu9m9Bsmj+WJukgXzSb+xUP3M+fYGb3efWYzuz2vzS/7dO1bnqU9jLKHb8iN+/kEka5RK/IpYu3y10/Nq8JrabHIwr+E6TO6glV/9zBsoPj+oBxVB+Mr3Aru6w9MSHr0cL3aQDFQjjRok/LHh060PyFlnlvqpIzdxeX/ZnLYe/eyvYpZ/Yd5cXdzBVlnNG+QWc51znnZF1mV/Utu4rKzjlNd1oyrVgnJgv0ecaH/XyZluWcn9+PpjhtzScdr3XMdLxF56TNdfxWR6tj0PFGr/mAhua+lLxASTIxiHiMIZi4LMRbmAFGFJ/BKHHmxXuIJva5+AKCiItMfAmxxKWTwMIBI0pwKCqxq7AzoN7E2C9CiHkRJQxjXkQJLCI1BGwrNIztxQBIzlYqqZx4hwwkAJCHFEqyCvqQQwnMeZpTAnee7pTAXqA9EgAJ9KcEBgMNKoHDQIdKYDHQohJ4LOhR5QQUcZiKOEQR2XXiCkV0qYjYJn2eipijiOw8MUx6miSGR0+PxLAYaFELhyLSITEMBhokhr+QmocIdamIcFe8NA/V4apVjLLZlMsil00aLDTYpM1C23njbZwTETjmQgSOGhCBozbE2Bb1i7wu5XVsV8rrkNelvCiedymvQ95TrSrkZQ21VSwiH9pIkJmPbCRIzQc2EtTl1BBddTQdCZfjqYmwHWg7ErSXviNB43tLgs4j4WJJCgBAkgIAkKQAIHZMSQUFqZWIwNE+InC0jwgc7SO+rHtE4NRKuA90rxipaV4xMtO74iquRWBE4JgXETjmRQSOeRGBY17EtFSwIdzptnClo9ex0O1iyNfAP3xRYItERo/9KaOK+N54+0b1VXUT5NXvj7/84kfJf/LgdDAx4/32Yb5Y4u092m/ul9uLUbPdzNcGH0rHgfnT6F9fMP7/b6d3/3Zi8e2/+oJ6hyfhK3ImqCuflfajmMf9bD5bNGuDL2/RE5n724l314+H2XxpvjS/bucbMx08Aw==",
    },
  ],
};
