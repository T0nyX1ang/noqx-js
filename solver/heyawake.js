/** The Heyawake solver. */

function avoid_diamond_pattern(color = "black") {
  /**
   * Avoid diamond patterns (radius = 1)
   */
  let rule = `:- grid(R, C), not ${color}(R, C), ${color}(R - 1, C), ${color}(R, C - 1), ${color}(R + 1, C), ${color}(R, C + 1).\n`;
  rule += `:- grid(R, C), not ${color}(R, C), not grid(R - 1, C), ${color}(R, C - 1), ${color}(R + 1, C), ${color}(R, C + 1).\n`;
  rule += `:- grid(R, C), not ${color}(R, C), ${color}(R - 1, C), not grid(R, C - 1), ${color}(R + 1, C), ${color}(R, C + 1).\n`;
  rule += `:- grid(R, C), not ${color}(R, C), ${color}(R - 1, C), ${color}(R, C - 1), not grid(R + 1, C), ${color}(R, C + 1).\n`;
  rule += `:- grid(R, C), not ${color}(R, C), ${color}(R - 1, C), ${color}(R, C - 1), ${color}(R + 1, C), not grid(R, C + 1).\n`;

  return rule.trim();
}

function limit_area_2x2_rect(limit, _id, color = "black") {
  /**
   * Limit 2x2 rectangle in areas
   */
  let rule = `rect_2x2(${_id}, R, C) :- area(${_id}, R, C), area(${_id}, R + 1, C), area(${_id}, R, C + 1), area(${_id}, R + 1, C + 1), not ${color}(R, C), not ${color}(R + 1, C), not ${color}(R, C + 1), not ${color}(R + 1, C + 1).\n`;
  rule += `:- { rect_2x2(${_id}, R, C) } > ${limit}.\n`;
  return rule;
}

function limit_border(limit, ar, puzzle, _type, color = "black") {
  /**
   * Limit the border shades of an area
   */
  let n, key;
  if (_type === "top") {
    n = puzzle.col;
    key = 0;
  } else if (_type === "bottom") {
    n = puzzle.col;
    key = puzzle.row - 1;
  } else if (_type === "left") {
    n = puzzle.row;
    key = 0;
  } else if (_type === "right") {
    n = puzzle.row;
    key = puzzle.col - 1;
  } else {
    throw new Error(`Invalid border type: ${_type}`);
  }

  const coord = (i) => (_type === "top" || _type === "bottom" ? [key, i] : [i, key]);

  let rule = "",
    i = 0;
  while (i < n) {
    let segment = 0,
      data = [];
    while (
      ar.some(([r, c]) => r === coord(i)[0] && c === coord(i)[1]) &&
      i < n &&
      puzzle.surface.get(new BasePoint(...coord(i)).toString()) !== 2
    ) {
      let [r, c] = coord(i);
      data.push(`${color}(${r}, ${c})`);
      segment++;
      i++;
    }

    let minimum = Math.floor(segment / 2) - limit;
    if (data.length > Math.floor(n / 2) - 1 && minimum > 0) {
      rule += `:- { ${data.join(";")} } < ${minimum}.\n`;
    }

    i++;
  }

  return rule.trim();
}

function area_border_simple(_id, ar) {
  /**
   * Generates a simpler fact for the border of an area
   */
  const borders = new Set();
  const directions = [
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  for (const [r, c] of ar) {
    for (const [dr, dc] of directions) {
      const [r1, c1] = [r + dr, c + dc];
      if (!ar.some(([r2, c2]) => r2 === r1 && c2 === c1)) {
        borders.add([r, c]);
      }
    }
  }

  return Array.from(borders)
    .map(([r, c]) => `area_border(${_id}, ${r}, ${c}).`)
    .join("\n");
}

function area_border_connected(_id, color = "black", adj_type = 4) {
  /**
   * Generate a constraint to check the reachability of color cells connected to borders of an area.
   */
  const tag = tag_encode("reachable", "area", "border", "adj", adj_type, color);
  const initial = `${tag}(${_id}, R, C) :- area_border(${_id}, R, C), ${color}(R, C).`;
  const propagation = `${tag}(${_id}, R, C) :- ${tag}(${_id}, R1, C1), area(${_id}, R, C), ${color}(R, C), adj_${adj_type}(R, C, R1, C1).`;
  const constraint = `:- area(${_id}, R, C), ${color}(R, C), not ${tag}(${_id}, R, C).`;

  return `${initial}\n${propagation}\n${constraint}`;
}

modules["heyawale"] = {
  name: "Heyawake",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_adjacent_color("gray"));
    solver.add_program_line(avoid_diamond_pattern("gray"));
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);

      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count(num, "gray", "area", i));

          if (puzzle.param["fast_mode"] && num > Math.floor(ar.length / 4)) {
            const lmt_2x2 = parseInt(puzzle.param["limit_2x2"]);
            const lmt_border = parseInt(puzzle.param["limit_border"]);
            solver.add_program_line(area_border_simple(i, ar));
            solver.add_program_line(area_border_connected(i, "gray", "x"));
            solver.add_program_line(limit_area_2x2_rect(lmt_2x2, i, "gray"));
            solver.add_program_line(limit_border(lmt_border, ar, puzzle, "top", "gray"));
            solver.add_program_line(limit_border(lmt_border, ar, puzzle, "bottom", "gray"));
            solver.add_program_line(limit_border(lmt_border, ar, puzzle, "left", "gray"));
            solver.add_program_line(limit_border(lmt_border, ar, puzzle, "right", "gray"));
          }
        }
      }
    }

    for (let r = 0; r < puzzle.row; r++) {
      const borders_in_row = Array.from({ length: puzzle.col - 1 }, (_, c) => c + 1).filter((c) =>
        puzzle.edge.has(new BasePoint(r, c, BaseDir.LEFT).toString())
      );

      for (let i = 0; i < borders_in_row.length - 1; i++) {
        const [b1, b2] = [borders_in_row[i], borders_in_row[i + 1]];
        solver.add_program_line(avoid_rect(1, b2 - b1 + 2, "not gray", [r, b1 - 1]));
      }
    }

    for (let c = 0; c < puzzle.col; c++) {
      const borders_in_col = Array.from({ length: puzzle.row - 1 }, (_, r) => r + 1).filter((r) =>
        puzzle.edge.has(new BasePoint(r, c, BaseDir.TOP).toString())
      );

      for (let i = 0; i < borders_in_col.length - 1; i++) {
        const [b1, b2] = [borders_in_col[i], borders_in_col[i + 1]];
        solver.add_program_line(avoid_rect(b2 - b1 + 2, 1, "not gray", [b1 - 1, c]));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZbPbhs3HITveoqAZx52Se7fS+Gmdi+u09YugkAQDFnZ1EZsKJWtpl3D756P5LAC2gBpUTS9BCtRI2o4/HE4S+39L/v1brK1iy/f28rWXGEI6e27Jr0rXRc3D7fT+Mwe7R+utzuAtS9OTuyb9e39tFiKtVo8zsM4H9n523FpamON412blZ1/GB/n78b52M7n/GRsT99pJjng8QG+TL9H9Dx31hX4TBj4Cri52W1up8vT3PP9uJwvrInzfJ1GR2jutr9ORnXE75vt3dVN7LhaP7CY++ubd/rlfv96+3Yvbr16svNRLvf8I+X6Q7kR5nIj+ki5cRX/cbnD6ukJ23+k4MtxGWv/6QD7AzwfH2nPxkcTmjj0K2pJe0NvnX57ldqT1LrUXjDUzj6136S2Sm2T2tPEOUbRdcG6oTKjY8cJjRtq4Q7shXtwyLivwK1wDe6EPXgQJoSVNIcKLP5Qg8UfPFj8GNq68FuwE+7AqmEYwCwfjDY4a6Jtvct8tMGZjzZY/Bq+Ez/eMa4XpgaXa0Dbep/XjjZYmg6+F9/B9+I7+EF8Bz8Ufg/OXqENVg2etYe8drTB0uT29Y34Hn4jfoDfiB/gN+IHvGqzV2iDVUNg7a3WHtBspdnEA0H8Jh4M4jfwO/Eb+J34LV518qqlhk41tKy909pbNHtpdvB78Tv4vfgd/F58MuaVsXQ4KWOeXHnlCm2w1k7GvDKGtg2VvO07sGruB7D4ZCwoY2iDVUM8EJUrtMGal4wFZQxtcPYWbXCuGW0bXOajDS58alDGQtWDc/3MA841MA8418A8YOmTn6D8MM6GkGtjHFj6Dv0gfbIUlCXG2aBsMA6suchGUDYYB5Y+OQnKCeNs0L4zDqy52PegfWccWPpkIJQMxL1Tf/5jKf1kvmSDs4K9POypcpK8qoq3zKX7nc8/9iXUcIr/NZzifw3HFX+it6rfRW+LV9FbeeWjt8Ur1u61Fs/avbzyrN1rXzzz6r7m87AvIfpcfIs+F9+Ytym+Rc81bxM9Lx4yb9ojDteX6Yh9ntqQ2jYdvV080//mqc+dbMbemlRD/gv490f+J2tbYl98nvjr1Xzpj9dqsTTn+92b9Wbib/349c/Ts7Pt7m59y7ez/d3VtCvfeap6WpjfTHovfXxI+/Kg9T89aMUtqP7R49ZnuNc+Uc4Sd7kb5xfWvNtfri83WzKGd7GfA+nP/Z+9eg4Lcz39vn6/fjuZ1eID",
    },
    {
      url: "https://puzz.link/p?heyawake/19/15/201480mhg2i40a8s192816704r503gk0m2g2oa0a18085010k046g0003hu0104000400fbvgvo005fu1800o0000000800600000003s0003c-1c140411g81ah8233",
      config: { fast_mode: true },
      test: false,
    },
    {
      data: "m=edit&p=7VPLbtswELzrKwKe9yCSkiXz5qZ2L677sIsgEIRAdpjaiA21spW2NPTvGa5YqIcARVEEzaEgOJhdDsnhY49f26qxlFNGOqeYJJpOFOk4oWQkucehrXanvTUXNGlP27oBIXo3m9FdtT/aqAiqMjq7sXETcm9MIaQgodClKMl9MGf31rgpuSWGBOXIzXuRAp0O9IrHPbvskzIGXwQOeg262TWbvb2Z95n3pnArEn6fVzzbU3GoH6wIPny8qQ/rnU+sqxMOc9zuvoSRY3tb37dBK8uO3KS3u3zCrh7setrb9ewJu/4Uz2x3XHYdrv0jDN+Ywnv/NNB8oEtzBi7MWagRpsocj81PI/TYxyGERrLymnHGqBhXWIicZnzNGDOmjHPWTLG+TLF2FgujsGI6Bpc9z7BJrgNX4EnQQJ/CBOfxDX/VZ6rnuQ56bHLFW10yJowjtpD5k/7RXfz9aX9rp1AjLqyhpc8bl1Ehlm1zV20s/sv09rO9WNTNodojWrSHtW1+xijXLhLfBfcCF0zJ/wr+RxXsnyB+aX/3pdlBNYmt/VF9q+6tKKNH",
      config: { fast_mode: true, limit_border: 1 },
    },
    {
      url: "https://puzz.link/p?heyawake/12/12/00000o0003063cc0o00030000000008020080a4a92a02008020000-2811111111",
      config: { fast_mode: true, limit_2x2: 1 },
      test: false,
    },
  ],
  parameters: {
    fast_mode: { name: "Fast Mode", type: "checkbox", default: false },
    limit_border: { name: "Border Limit", type: "number", default: 0 },
    limit_2x2: { name: "2x2 Limit", type: "number", default: 0 },
  },
};
