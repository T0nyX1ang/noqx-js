/** The Choco Banana solver. */

function grid_src_same_color_connected(src_cell, color = "black", adj_type = 4) {
  /**
   * Generate a constraint to check the reachability of same color cells starting from a source.
   */
  const tag = tag_encode("reachable", "grid", "src", "adj", adj_type, color);
  const tag_ls = tag_encode("reachable", "Lshape", "adj", adj_type, color);

  const [r, c] = src_cell;
  const initial = `${tag}(${r}, ${c}, ${r}, ${c}).\n`;
  const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag_ls}(${r}, ${c}), ${tag}(${r}, ${c}, R1, C1), grid(R, C), ${tag_ls}(R, C), adj_${adj_type}(R, C, R1, C1).\n`;
  return initial + propagation.trim();
}

function bulb_src_same_color_connected(src_cell, color = "black", adj_type = 4) {
  /**
   * Generate a constraint to check the reachability of color cells starting from a bulb.
   */
  const tag = tag_encode("reachable", "bulb", "src", "adj", adj_type, color);

  const [r, c] = src_cell;
  const initial = `${tag}(${r}, ${c}, ${r}, ${c}).`;
  const bulb_constraint = `${color}(R, C), adj_${adj_type}(R, C, R1, C1), (R - ${r}) * (C - ${c}) == 0`;
  const propagation = `${tag}(${r}, ${c}, R, C) :- ${color}(${r}, ${c}), ${tag}(${r}, ${c}, R1, C1), ${bulb_constraint}.`;
  return initial + "\n" + propagation;
}

function cbanana_count_reachable_src(target, src_cell, color = "black", adj_type = 4) {
  /**
   * Generate a constraint to count the reachable cells starting from a source.
   * This is only for the Choco Banana puzzle.
   */
  const [src_r, src_c] = src_cell;
  const tag = tag_encode("reachable", "grid", "src", "adj", adj_type, color);
  const [rop, num] = target_encode(target);

  return `:- ${color}(${src_r}, ${src_c}), { ${tag}(${src_r}, ${src_c}, R, C) } ${rop} ${num}.`;
}

function cbanana_count_rect_src(target, src_cell, color = "black", adj_type = 4) {
  /**
   * Generate a cell-relevant constraint for rectangles.
   * This is only for the Choco Banana puzzle.
   */
  const tag = tag_encode("reachable", "bulb", "src", "adj", adj_type, color);
  const [src_r, src_c] = src_cell;
  const count_r = `#count { R: ${tag}(${src_r}, ${src_c}, R, C) } = CR`;
  const count_c = `#count { C: ${tag}(${src_r}, ${src_c}, R, C) } = CC`;

  return `:- ${color}(${src_r}, ${src_c}), ${count_r}, ${count_c}, CR * CC != ${target}.`;
}

modules["cbanana"] = {
  name: "Choco Banana",
  category: "shade",
  aliases: ["chocobanana"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_cc(["gray", "white"]));
    solver.add_program_line(adjacent());
    solver.add_program_line(all_rect("gray"));
    solver.add_program_line(no_rect("white"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(grid_src_same_color_connected([r, c], "white"));
        solver.add_program_line(cbanana_count_reachable_src(num, [r, c], "white"));
        solver.add_program_line(bulb_src_same_color_connected([r, c], "gray"));
        solver.add_program_line(cbanana_count_rect_src(num, [r, c], "gray"));
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
      data: "m=edit&p=7VVNb5tAEL3zK6w5z4FlwXxcKjeNe3FJW7uKIoQsTIlsFZcUm6pay/89MwMpoPrQHppcovWO3psP89jZXQ4/mqwuUDn80wHaqGi4oStT+55Muxur3bEsognOmuO2qgkg3szneJ+Vh8JKuqzUOpkwMjM076MEFCA4NBWkaD5FJ/MhMjGaJYUAA/It2iSH4HUPbyXO6Kp1Kptw3GGCdwTzXZ2XxXrRej5GiVkh8HPeSjVD2Fc/C+h0MM+r/WbHjk12pJc5bHcPXeTQfK2+NV2uSs9oZq3c5QW5upfLsJXL6IJcfov/LDdMz2da9s8keB0lrP1LD4MeLqMT2Tg6gQ6p1KVeS2fAtYly6zuqiPo91aNkb0ynXDugAVH9m/r+iAZcC29oDTqHsllJ0HPljgqU443jeixViVZvwKfjfN8ZyVP+WJ8KWCDt/yce8vP6uGNz/YAr5tMBZ739/zuK64dx1vMUp9VX0oM7sXOxjtgVtQiNFvtOrC3WE7uQnGuxt2KvxLpip5Ljc5P/chuAJtkBgia1TrsnnkFbonkhLg1u4KtfpVYCy6a+z/KCznnc7DdFPYmrep+VQBfr2YJfIFN2pPt6177QXcstsP/pxn35k5/Q6tL5MzcID806W+dVCfS5RvF7f/ifXT1dD5Bvq7yabLLvNCC1HgE=",
    },
    {
      url: "https://puzz.link/p?cbanana/15/15/w29l8q4k4j65l5g6h6m7g7m35i3zh8o7zh9i36m1g5m6h3g6l63j5k6q6l76w",
      test: false,
    },
  ],
};
