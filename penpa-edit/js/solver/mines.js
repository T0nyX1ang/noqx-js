/** The Minesweeper solver. */

modules["mines"] = {
  name: "Minesweeper",
  category: "var",
  aliases: ["minesweeper"],
  solve: async function (puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("sun_moon__4"));
    solver.add_program_line(adjacent(8));

    for (const [point, num] of puzzle.text.entries()) {
      validate_direction(point.r, point.c, point.d);
      validate_type(point.pos, "normal");
      fail_false(
        Number.isInteger(num),
        `Clue at (${point.r}, ${point.c}) must be an integer.`
      );
      solver.add_program_line(`not sun_moon__4(${point.r}, ${point.c}).`);
      solver.add_program_line(
        count_adjacent(parseInt(num), [point.r, point.c], "sun_moon__4", 8)
      );
    }

    const mine_count = puzzle.param["mine_count"];
    if (mine_count) {
      fail_false(
        typeof mine_count === "string" && /^\d+$/.test(mine_count),
        "Please provide a valid mine count."
      );
      solver.add_program_line(count(parseInt(mine_count), "sun_moon__4", "grid"));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      validate_direction(point.r, point.c, point.d);
      validate_type(symbol_name, "sun_moon__4");
      solver.add_program_line(`sun_moon__4(${point.r}, ${point.c}).`);
    }

    solver.add_program_line(display("sun_moon__4"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNj5swEL3zKyKffbCB5euWbje9pGzbpFpFCCGSugpqCCmEtnKU/74zA41BymG7UtNLZXn03sxgP88YN9/bvFY8gOEEXHAJw3FtmrYIaYp+LIvjTkUTPm2P26oGwPnjbMa/5rtGWUmflVonHUZ6yvW7KGGScWbDlCzl+mN00u8jHXO9gBDjEnzzLskG+GDgE8UR3XdOKQDHPQa4Argp6s1OZfPO8yFK9JIz3OcNfY2QldUPxXodyDdVuS7Qsc6PcJhmWxz6SNN+qb61fa5Mz1xPO7mrK3IdIxdhJxfRFbl4CpTbtPusrKr9q+SWxV4115SG6fkMFf8EWrMoQdmfDQwMXEQnsHF0YrYPn2KjqSnMCYBi1zvqijG1R8muO6IeRk2yh9EBHa/s476uoRi9u9AA97UvNMSVB9QZ7Rvit4NoCNS5UClwLbOTFLjYkI91SilHq0uJu/2OQ9Uk1W5FdkbWJruE0nLtkH1LVpC9IzunnAeyT2TvybpkPcrxsTl/1L6hHObjwV28EeZq/SWNie3R22AG9u6GPLUSFrflWtWTuKrLfAd/w2KbHxSDF+dssV+MJt0D9/8jdPtHCKsvXn2X/82vlUBhPYfrR84ObZZnmwquFVTmqh/KiX4/fLH/5qeF/7Tr0k+lDqpmqfUM",
      config: { mine_count: 10 },
    },
    {
      data: "m=edit&p=7VZLb9pAEL7zK6I972Efft9oGnqh9BGqCFkWAuoKVByndtxWRvz3zIxJ9yF6aA8Rh8h4NJ/n9e3Msnb7o1s1JZch/nTCBZdwRSKhWyaA4X6+5rvHfZld8XH3uK0bUDj/MJnwb6t9W47yk1cxOvRp1o95/y7LmWScKbglK3j/KTv077N+xvtbMDEu4dl0cFKg3hj1juyoXQ8PpQB9dtJBXYC62TWbfbmcDk8+Znk/5wzrvKFoVFlV/yzZiQfiTV2td/hgvXqExbTb3cPJ0nZf6+/dyVcWR96PB7qLM3S1oYvqQBe1M3RxFUi37e6XVV3f/xfdandftueYpsXxCB3/DFyXWY60vxg1MeptdgA5yw4sUBAKAx+GwoIIoDYwAYibYIChAKgM1E5smAIM/sDItUaY2bLGDowxc2Qg1jU0EiRpnBPMbKypa00x1tSVQjpmKQInWgp3yVK4taVEalY+icwtrDCfjd02SB26+bTHj1pu+QeY3/IPvfjQ7ZyM3NZJ6ntsYW99EdY3Q5Qx8rex5x9760nQ38YeXxoHHh3PGP3NHpKpt16alx2P9Qwf5c1PCXfHKpqHiVca/U09pbEfVj6ahxXvzUMFGG/6pwK3nypEu+UfuutR1F+LT+zuVuX1V8XuPJXXb5XgfG3s+afIx8qXevWo/7a/V5/6bdajhbuftHDnoaX9/4FTRNJZsiA5IalIzuGo4b0m+ZakIBmSnJLPDck7ktckA5IR+cR4WP3TcfYCdPJgeC3+7cJOvlov2lqMcjbrqnXZXM3qplrt4VV6u109lAw+V44j9pvRTZs8eP2CefkvGOy+uLQ//qXRgaNoaOOvsnwoG1aMngA=",
    },
  ],
  parameters: { mine_count: { name: "Mines", type: "number", default: "" } },
};
