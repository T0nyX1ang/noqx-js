/** The Castle Wall solver. */

function wall_length(r, c, d, num) {
  /**
   * Constrain the castle length.
   * A grid direction fact should be defined first.
   */
  if (d === 0) {
    return `:- #count{ R: grid_direction(R, ${c}, "d"), R < ${r} } != ${num}.`;
  }
  if (d === 1) {
    return `:- #count{ C: grid_direction(${r}, C, "r"), C < ${c} } != ${num}.`;
  }
  if (d === 2) {
    return `:- #count{ C: grid_direction(${r}, C, "r"), C > ${c} } != ${num}.`;
  }
  if (d === 3) {
    return `:- #count{ R: grid_direction(R, ${c}, "d"), R > ${r} } != ${num}.`;
  }

  throw new Error("Invalid direction.");
}

modules["castle"] = {
  name: "Castle Wall",
  category: "loop",
  aliases: ["castlewall"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("castle"));
    solver.add_program_line(fill_path("castle"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("castle", "loop"));
    solver.add_program_line(single_loop("castle"));
    solver.add_program_line(separate_item_from_loop("white", "black"));

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (!puzzle.surface.has(new BasePoint(r, c).toString())) {
        solver.add_program_line(`white(${r}, ${c}).`);
        solver.add_program_line(`not castle(${r}, ${c}).`);
      }

      if (typeof clue === "string" && (clue.length === 0 || clue.trim() === "")) {
        continue;
      }

      fail_false(typeof clue === "string" && clue.includes("_"), "Please set all NUMBER to arrow sub and draw arrows.");
      const [num, d_str] = clue.split("_");
      fail_false(/^\d+$/.test(num) && /^\d+$/.test(d_str), `Invalid arrow or number clue at (${r}, ${c}).`);
      solver.add_program_line(wall_length(r, c, parseInt(d_str), parseInt(num)));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      solver.add_program_line(`not castle(${r}, ${c}).`);
      if (color === BaseColor.BLACK) {
        solver.add_program_line(`black(${r}, ${c}).`);
      }
      if (color === BaseColor.GRAY) {
        solver.add_program_line(`gray(${r}, ${c}).`);
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
      data: "m=edit&p=7VZNj9s2EL37VwQ88yB+6eu2TbO9uE7b3SIIBMPQugpi1K5Te90GWux/z5vhUNI6MZoiwJ4CW9TTm+HwcYakdPz71B46bRz9XakzbfALzvJlvOcrk9/t5n7b1S/01en+/f4AoPXr62v9rt0eu1kjXsvZQ1/V/ZXuf6obZZRWFpdRS93/Wj/0P9f9Qvc3MCntwc2jkwV8NcI3bCf0MpImA14AIxh1ewu43hzW2241hxXML3XT32pF4/zAvQmq3f6fTokOel7vd3cbIu7ae0zm+H7zQSzH0x/7P0/ia5aPur+KcudJLo0ict0ol2CUS+hcrsznm+VuN391H7+ktFo+PiLjv0Hrqm5I9u8jLEd4Uz8ol6vaa+Ut34p4KzO+VdFmXBnvIdKmil42i7w10c96uQeyI/5C4jfKr5zSBZUdWmmsRhVTisalCQ/PxdDLCEWaGuWmvUjfWWxDmrgwA1GdETYQYaexjTMxOJVp4DhSscLqGqJTBqY6TWChOTkNHXNHXFhlE65gFeHJAHFG5okQSi1x6JvG4DSTuClnWPDYkWsgMxicqB4008kMuDZPBkCdTP2A9i2319xabm+xTHTvuP2R24zbwO2cfV5RjbNCO+tVbTVwCYwUMwZP6glbP/J0sDjMnjF4Sn/ijcRx2ch78Ln44+xx+YT34p/Df+ChIZexfAWMRCTeoxLsH0Y+GGDRGSyw+BBPCWN/ipn6Yl5lGhd8KWMRn+KU0Jn4AhposSZMlWcfxK+SP/SXor9CnMRXufYGK0p4L/kBN+LMAkdtPgNvY3zms9gX9glPOOrxJgPGKk68ER+LcRNvjfa0HRgjppOxiLcxP7BPeGAf5+4tYtJCTLwVHx9G3nntQ5y7d+Al58w7iROgMxc9hJM/cu4l5+gHLPFRlxEjJ5JznyOm5Jn5XHKI/A88auSlXsxXMi7xKQ7VJfElxq1krNLpkIkP8aXkv6omfAGcxi2BZY7g8cwY9oEPBv4u+gcDf8kJ80b8kauBt9Dg41gB+y74OC/mZZ/CLjw28Rveyi+59bShaTHS5HC80AJMGEmPyU6YCmXQKecToaDXyle+eOLr4VsOH7w0UKKqpLcH5DHwSHYEmCUBg3IbOgoc4QCMPoxzYHRz8Qz7PAlns2ocOlz4Iex3y/+3LGeNujkd3rXrDl8xc3zNvFjsD7t2i6fFaXfXHdIzvh8fZ+qj4qvBhym+975/Uj77JyVlP3u2/f2VG/M/5DRI7HAK6P61Vh9Oq3a13mOVIXtijgfDRXM8K75sxil0wYCvkws9iks9/GeGZ08njjq1bo9Ytf+2W9p6nwA=",
    },
    {
      data: "m=edit&p=7VdNb1s3ELz7VwQ88/D49b5ubhL34rofdhEEgmHIroIYletWttpAhv97Zpa7fk9GixYwUOQQCCKHw+FyuVxS1N0f2+Vm5UPrQ/Cp940P+LS59bmAa/JQi0Y/Z9f369X4yh9u7z/ebgC8//7oyH9Yru9WBwtVnR887IZxd+h3344LF5x3Ed/gzv3ux/Fh9924O/W7U3Q5n8EdV1EEfDvBd9JP9LqSoQE+AYYxDnsPeHW9uVqvLo7RC+aHcbE7847zfCOjCd3N7Z8rp36wfXV7c3lN4nJ5j8Xcfbz+XXvutr/c/rpVbTh/9LvD6u6xuctZ1N00uUtY3SV67q6u58Xurq9/W336O0+H88dHRPwn+HoxLuj2zxPsJ3g6PrjcuzF512Y3ZlSDtLpOqiFJFZraDCFoDbHUykeMwuCQ2trOqNkuUWvVq9nQ18lCj7lZD03lbb6hSB1DtRejtlPVxQS7rLPWhTqs50TXg4y4YMCZZogN10YqOd8ZBY+VMlWHSRYuzQfSX9lkbfeYhxLkm1F0GTGfUxIuymbGJXTUNXNO/HqmezZliCJq5m5JvHWNtiCJ/TP3ZR9o7EnEDeFAeDFxOsF8BXXhZc8YN23PGHdvj+A27vleg7PvE/d2LoqNOBnmItn4hct7HJOAxmYRjFFdeCKYIfuErHhGMGdoem6G+bNw3TQdcimMDyjfS3kkZZTyDEfH75KUb6RspCxSHovmLfIwxc6njDhGD9wDw1fB4Ok3cabGcPKpRcAEZ2DE2/isuKXGeNhsbewAjKQwPituqVFcYLPTsaUAI57GF8UdNca3wAiMYPjJnDC+KO6oUdzCZq9jW/A8LMa3intqFHfRpwGbIRjrYrIY3ykeqFHc4xeIuSK4A9Z5waMtGP0TPzQ+B6SD4ACME6g82lUfqDE+Adu8GVhjBR5t1VNjPOZingqGPzy5yqOtemrMN4yN1X5uYJ8H2/hGcaTG+B647m9uBuC6j8I3ipFXT3woPqcaf5mXF4Lx6if6Jz4CZ9VH6HlZGB8VZ2psLGJYNG4pAte9E56njLhQYzzWUnS9CevlPWN8UlyoMQwfNN8y8i1rXgmv+Yb+icdZyL3ab2Gf95PxekbQP+Nh0/IE5yLz+jJezxH6Zzxi3mtsO+QJbzfjO8U9sPHI26z5nJHPWfNWeM1n9M94+Gx51SHOvBiN1zOI/onH2SmN4RZYYwUebcHon/gBOJgd6C0HwKNd9cgN4wtysmjuiR3et8brvOif8R1wjWdBThbNVeEbxbjrJn4ArvEsOHeFV7Xxek7RP/F4fpZU862ECFxjK3xQjNx74iNwVn2Enhe98VFxpsbGYo1675WE+PBHwHg9I+hXHpf6O7naX0uZpWzlyu/4lvqPr636Rnn5r8u/urPIUd7t//wpX/tf0n9+sHCn282H5dUKL/BjvMRfndxubpZrtE62N5erjbXx3+fxwH1y8l0kDM5f/w79/3+HGP3mSzumX5o7uDjc1fIOu/7Xcs3U/Qw=",
    },
    {
      url: "https://puzz.link/p?castle/10/10/f00.g231g141d141b022d042g241d212b112d141g042d022b241d241g131g00.f",
      test: false,
    },
  ],
};
