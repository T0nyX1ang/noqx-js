/** Solve Symmetry Area puzzles. */

function symmarea_constraint() {
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge");

  // propagation of number
  let rule = `number(R, C, N) :- number(R0, C0, N), ${tag}(R0, C0, R, C).\n`;
  // this is a huge optimization
  rule += ":- grid(R, C), number(R, C, N1), number(R, C, N2), N1 < N2.\n";

  // same number, adjacent cell, no line
  rule += ":- number(R, C, N), number(R, C + 1, N), edge_left(R, C + 1).\n";
  rule += ":- number(R, C, N), number(R + 1, C, N), edge_top(R + 1, C).\n";

  // different number, adjacent cell, have line
  rule += ":- number(R, C, N1), number(R, C + 1, N2), N1 != N2, not edge_left(R, C + 1).\n";
  rule += ":- number(R, C, N1), number(R + 1, C, N2), N1 != N2, not edge_top(R + 1, C).\n";

  // special case for 1
  const mutual = ["edge_top(R, C)", "edge_top(R + 1, C)", "edge_left(R, C)", "edge_left(R, C + 1)"];
  rule += `{ ${mutual.join("; ")} } = 4 :- number(R, C, 1).\n`;
  rule += `number(R, C, 1) :- ${mutual.join(", ")}.\n`;
  rule += ":- number(R, C, 1), number(R1, C1, 1), adj_4(R, C, R1, C1).\n";

  return rule.trim();
}

function symmarea_filtered(fast = false) {
  const tag = tag_encode("reachable", "grid", "branch", "adj", "edge");
  let rule = "";
  const tag1 = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  rule += `have_numberx(R, C) :- grid(R, C), not ${tag1}(_, _, R, C).\n`;

  rule += `${tag}(R, C, R, C) :- grid(R, C), have_numberx(R, C).\n`;
  rule += `${tag}(R, C, R0, C0) :- grid(R0, C0), grid(R, C), ${tag}(R, C, R1, C1), have_numberx(R0, C0), have_numberx(R, C), adj_edge(R0, C0, R1, C1).\n`;

  if (fast) {
    rule += "{ numberx(R, C, 1..5) } = 1 :- grid(R, C), have_numberx(R, C).\n";
    rule += `:- numberx(R, C, N), #count{ R1, C1: ${tag}(R, C, R1, C1) } != N.\n`;
  } else {
    rule += `{ numberx(R, C, N) } = 1 :- grid(R, C), have_numberx(R, C), #count{ R1, C1: ${tag}(R, C, R1, C1) } = N.\n`;
  }

  rule += ":- number(R, C, N), numberx(R1, C1, N), adj_4(R, C, R1, C1).\n";
  rule += ":- numberx(R, C, N), numberx(R, C + 1, N), edge_left(R, C + 1).\n";
  rule += ":- numberx(R, C, N), numberx(R + 1, C, N), edge_top(R + 1, C).\n";
  rule +=
    ":- have_numberx(R, C), have_numberx(R, C + 1), numberx(R, C, N), not numberx(R, C + 1, N), not edge_left(R, C + 1).\n";
  rule +=
    ":- have_numberx(R, C), have_numberx(R + 1, C), numberx(R, C, N), not numberx(R + 1, C, N), not edge_top(R + 1, C).\n";

  return rule.trim();
}

function symmetry_area(fast) {
  fast = fast || false;
  const tag_number = tag_encode("reachable", "grid", "src", "adj", "edge", null);
  const tag_numberx = tag_encode("reachable", "grid", "branch", "adj", "edge");

  let rule = `min_r(R, C, MR) :- clue(R, C), MR = #min{ R1: grid(R1, C1), ${tag_number}(R, C, R1, C1) }.\n`;
  rule += `max_r(R, C, MR) :- clue(R, C), MR = #max{ R1: grid(R1, C1), ${tag_number}(R, C, R1, C1) }.\n`;
  rule += `min_c(R, C, MC) :- clue(R, C), MC = #min{ C1: grid(R1, C1), ${tag_number}(R, C, R1, C1) }.\n`;
  rule += `max_c(R, C, MC) :- clue(R, C), MC = #max{ C1: grid(R1, C1), ${tag_number}(R, C, R1, C1) }.\n`;
  rule += `symm_coord_sum(R, C, SR, SC) :- clue(R, C), min_r(R, C, MINR), max_r(R, C, MAXR), min_c(R, C, MINC), max_c(R, C, MAXC), SR = MINR + MAXR, SC = MINC + MAXC.\n`;

  rule += `:- clue(R0, C0), clue(R1, C1), ${tag_number}(R0, C0, R1, C1), symm_coord_sum(R0, C0, SR, SC), not symm_coord_sum(R1, C1, SR, SC).\n`;
  rule += `:- clue(R, C), symm_coord_sum(R, C, SR, SC), ${tag_number}(R, C, R0, C0), not ${tag_number}(R, C, SR - R0, SC - C0).\n`;

  if (!fast) {
    rule += `{ min_rx(R, C, MR) : grid(MR, _) } = 1 :- grid(R, C), have_numberx(R, C).\n`;
    rule += `{ max_rx(R, C, MR) : grid(MR, _) } = 1 :- grid(R, C), have_numberx(R, C).\n`;
    rule += `{ min_cx(R, C, MC) : grid(_, MC) } = 1 :- grid(R, C), have_numberx(R, C).\n`;
    rule += `{ max_cx(R, C, MC) : grid(_, MC) } = 1 :- grid(R, C), have_numberx(R, C).\n`;

    rule += `min_rx(R, C, MR) :- have_numberx(R, C), MR = #min{ R1: grid(R1, C1), ${tag_numberx}(R, C, R1, C1) }, grid(MR, _).\n`;
    rule += `max_rx(R, C, MR) :- have_numberx(R, C), MR = #max{ R1: grid(R1, C1), ${tag_numberx}(R, C, R1, C1) }, grid(MR, _).\n`;
    rule += `min_cx(R, C, MC) :- have_numberx(R, C), MC = #min{ C1: grid(R1, C1), ${tag_numberx}(R, C, R1, C1) }, grid(_, MC).\n`;
    rule += `max_cx(R, C, MC) :- have_numberx(R, C), MC = #max{ C1: grid(R1, C1), ${tag_numberx}(R, C, R1, C1) }, grid(_, MC).\n`;

    rule += `:- have_numberx(R, C), adj_edge(R0, C0, R, C), min_rx(R0, C0, MR), not min_rx(R, C, MR).\n`;
    rule += `:- have_numberx(R, C), adj_edge(R0, C0, R, C), max_rx(R0, C0, MR), not max_rx(R, C, MR).\n`;
    rule += `:- have_numberx(R, C), adj_edge(R0, C0, R, C), min_cx(R0, C0, MC), not min_cx(R, C, MC).\n`;
    rule += `:- have_numberx(R, C), adj_edge(R0, C0, R, C), max_cx(R0, C0, MC), not max_cx(R, C, MC).\n`;

    rule += `symm_coord_sumx(R, C, SR, SC) :- grid(R, C), have_numberx(R, C), min_rx(R, C, MINR), max_rx(R, C, MAXR), min_cx(R, C, MINC), max_cx(R, C, MAXC), SR = MINR + MAXR, SC = MINC + MAXC.\n`;
    rule += `:- have_numberx(R, C), symm_coord_sumx(R, C, SR, SC), not ${tag_numberx}(R, C, SR - R, SC - C).\n`;
  }

  return rule.trim();
}

modules["symmarea"] = {
  name: "Symmetry Area",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(symmarea_constraint());
    solver.add_program_line(symmarea_filtered(puzzle.param["fast_mode"]));
    solver.add_program_line(symmetry_area(puzzle.param["fast_mode"]));

    const numberx_uplimit =
      puzzle.row * puzzle.col -
      Array.from(
        new Set(
          Array.from(puzzle.text.entries())
            .filter(([_, num]) => Number.isInteger(num))
            .map(([_, num]) => num)
        )
      ).reduce((a, b) => a + b, 0);
    solver.add_program_line(`:- #count{ R, C: grid(R, C), have_numberx(R, C) } > ${numberx_uplimit}.`);

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      solver.add_program_line(`clue(${r}, ${c}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, null, null, "edge"));
      solver.add_program_line(count_reachable_src(num, [r, c], "grid", null, "edge"));

      if (num === 1) {
        solver.add_program_line(`edge_left(${r}, ${c}).`);
        solver.add_program_line(`edge_top(${r}, ${c}).`);
        solver.add_program_line(`edge_left(${r}, ${c + 1}).`);
        solver.add_program_line(`edge_top(${r + 1}, ${c}).`);
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("number", 3));
    solver.add_program_line(display("numberx", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTRbtMwFH3PV0x+vg+xnaad38pIeSkZsKJpsqIo7TIWkeCRNgi56r/v+jpRqqoIgcTgAVk+Ojk+bs51fLv92hVtCTEOOYMQOA4RxzR5FNEM+7GqdnWpLmDe7R5NiwTgerGAh6LeloHuXVmwt5fKzsG+UZoJBjQ5y8C+V3v7VtkU7A0uMeCoLZFxBgJpMtJbWnfsyos8RJ72HOkd0k3VbuoyX3rlndJ2Bcy95xXtdpQ15lvJ/DZ63phmXTlhXeywmO1j9dSvbLt787nrvTw7gJ37uMmZuHKM66iP69iZuK6KPxz3Mjsc8Ng/YOBcaZf940hnI71Re8RU7ZmQQ6X+2zAxPREkOeIjgRyzUYiEE/DrDsKEHJNRiMkhj4T4xDElx9Frp+SIBgHjcgp9R7ggFIQrrAmsJHxNGBJOCJfkSQhvCa8II8KYPFN3Kr90bi8QRwtBTejH5Pd5FmiW3H8qL1LTNkWN9ybtmnXZDs/YqIeAfWc0tcQt0f/e/Uu96z5B+K/dxJ/E0XgZhAR/Tn33PnV5kW8MXjY8RGeQzoB/Ij804C/Y6/MbT/UXrx+bkT1UdW2a6othWfAM",
    },
    {
      data: "m=edit&p=7Vjdb+JGEH/nr4j2eR+8Hza239Ir6UvKtb1UpwghRDi3hxrEFULVc5T//X4zs45BzRhV117VqgKvf7Ozs56P9czA/tfDctdYl9E3lBZ3fKIr+fJlwVeWPjfrh/umvrCXh4f32x2Ata+vruxPy/t9M5qlVfPRY1vV7aVtv6lnxhvLlzNz235fP7bf1u3Utm/AMtZh7hrIGesBJz18y3xCr2TSZcDThAFvAVfr3eq+WVzLzHf1rL2xhp7zFUsTNJvtb40RMaZX283dmibulg8wZv9+/SFx9od3218Oaa2bP9n2UtSdvKBu6NUlKOoSekFdsuJvVreaPz3B7T9A4UU9I91/7GHZwzf1I8Zp/WhCBtGAWHNkTHAgKfSJ9CBjT4ZTbgSZ92QOsurJAqTvyTHIoifLU9nqRI2SZPutXEbsfi+XE7+XdjltXh7RtPvxepIf93RxarUrTs12Bdl9JF+Q4cfryfKj5xVkeucneNaxf295vOLR83gD99s28Pg1jxmPOY/XvGbC41seX/EYeSx4zZgC+KdC/PnqmOjhj6q0JlJQCXjnrfcgArBHdojwKOGYWZ/DO4Tz0GNa4xElwg7zzzgCI1q8BpnGI1I8nx9hyNI5ZTwGRrQYYz2dUMYVMKLE+0AHOpuEA/aPaf+I9RRZwgX0p6gCh+htoBPV4djNB8yLnsFX/TzhpA/umJdn4Y718qwQsCbv1udYL7YwTn7DHbJpH/gtJF8F2Pu8P2GXdIDtIdmOO2Rx6lgWe9IJZ3sd7JV53IFTjALsTThE7ElvAO9D9qZ5+BO04Ay2uGQL4Sw9C7Uh5GlNhA45zZ89rzO4iV6v0w+9wP+yufloZibvfm4uptvdZnmPHDw9bO6aXUej6D2NzO+GL84Y8f86+A/VQQpB9oVT5edm7hm8+5xcbfvamg+HxXKx2uKowYXCTvlWY6cU/DIbqVxhhELbMOXxIXWQzjV2yvaqNBJ6RMg0Y5DPkGNU1ZDiikplF6gKY91TOTQfYKMWYImuOcpJxLus2S2VbUgaBU6VlvqnsqUkqmypkipbCqfKllqqai7lVWOniqs6VYqwGjGpywq7Kz8a26NSobPU2PTbxuuaV1RrdaeWUK3Sj0OJk1rqhp1jD28+rNoZw865Zdip/9k3tOv7htho+VS2dIeqz6VhHGLrL3DXVqrPlk5TlZbmU3229KNDbL36dF2rqpo0supJld52iI12V2VLB6zaLU2xqpr0yWriktZZPWvSTavS0mCrz5aeW9Vc2nDVbunMNXZq1ofY6N+1hqDUGgKnMOCJv0pCe/jZTJ9+e/yB/cX7Ofy4MfuPm03zsPt4gf/QlmY++gQ=",
      config: { fast_mode: true },
    },
    {
      url: "https://pzplus.tck.mn/p?symmarea/10/10/5o2g3mag5g8lah7g7j5g7h2g1hag5h6g6j2g6halbg1g2m5g1o3",
      config: { fast_mode: true },
      test: false,
    },
    { url: "https://pzplus.tck.mn/p?symmarea/10/10/h1i5j4g4g1g1h1g2g1i1h4g4g1g1j4k1h4i9g1h1i4t1j1l1i1j", test: false },
  ],
  parameters: {
    fast_mode: {
      name: "Fast Mode",
      type: "checkbox",
      default: false,
    },
  },
};
