/** The Double Back solver. */

modules["doubleback"] = {
  name: "Double Back",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("doubleback(R, C) :- grid(R, C), not black(R, C).");
    solver.add_program_line(fill_path("doubleback"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("doubleback", "loop"));
    solver.add_program_line(single_loop("doubleback"));

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})`);
      solver.add_program_line(`black(${r}, ${c}).`);

      // enforce the black cells to have edges on all sides
      puzzle.edge.set(new BasePoint(r, c, BaseDir.TOP).toString(), true);
      puzzle.edge.set(new BasePoint(r, c, BaseDir.LEFT).toString(), true);
      puzzle.edge.set(new BasePoint(r + 1, c, BaseDir.TOP).toString(), true);
      puzzle.edge.set(new BasePoint(r, c + 1, BaseDir.LEFT).toString(), true);
    }

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      // solver.add_program_line(area(i, ar));
      const arb = ar.filter((x) => {
        const color = puzzle.surface.get(new BasePoint(...x).toString());
        return color === undefined || color === null || !BaseColor.DARK.includes(color);
      });
      if (arb.length === 0) {
        continue; // drop black cells
      }

      solver.add_program_line(area_border(i, ar, puzzle.edge));
      solver.add_program_line(count_area_pass(2, i));
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
      data: "m=edit&p=7VRRb9owEH7nVyA/3wOxEw/yxjrYC6PbylRVUYRCSFfUsHRApsqI/97Pl0t5STVplXiaLH/6cvfFdz6fvf9dZ7uCLIYZ0oACDG0tzyAMeQ5kLDaHsoj7NK4PD9UOhOh6OqX7rNwXvURUae/oRrEbk/scJ0or4hmolNy3+Oi+xG5C7gYuRQFsM7BAkQadnOkt+z27aozBAHwuHPQONN/s8rJYzhrL1zhxC1I+zkf+21O1rf4UqvmNv/Nqu9p4wyo7YDP7h82TePb1unqsRRukJ3LjJt1ZR7rmnK6nTbqedaTrd/HudMvNr+K5K9NRejqh4t+R6zJOfNo/znR4pjfxEThnDBjvGKeMmnEBKTnD+IlxwBgxzlgziY8q0JoCo1WscbAafWJsww3sodiNATfCI/BIuO8r0YfQR6IPoY9EH0IfiT6EPhJ9BL0VfQS7FbvPR8u/GuvoUDj6V7dxYTdij3yslkPTxrJ+fVnHQmNFY6GxrQa5cVwU45ZLcsUYMlou1Qdf84uditJ+76MhKeMPxRMUxFPDzHtNc3R/zTnxpXwd2Oq/8rSXqJt6d5/lBdp2hvbtz6vdNivxNVn/fP3Cc3HqqWfFM0HNKfz/glz+BfHVH1z4HXnvBUpQWOl0cteknupltswrdBhq1zrR/N1OXJpuBy7RW8sZON+M1e28eM1wh9W6qldl0V9l+aNKey8=",
    },
    {
      data: "m=edit&p=7VZdTxs7EH3Pr0B+9sP6a7/eKBfuSwq9N1QIraIoCUuJCDc0IRXaKP+dM+MxuVWDQEJCqlRt1j4ZOzPHczx2Vt/X42WrTUYfV2r0eLwp+bVlzm8mz/nsYd7WB/pw/XCzWAJofXZyoq/H81Xba2TWsLfpqro71N3fdaOs0vwaNdTdP/Wm+1x3A90NMKS0h60PZJS2gMc7eMHjhI6i0WTAp4IBLwGns+V03o760fKlbrpzrSjOJ/41QXW3+NGq+DP+Pl3cTWZkmIwfsJjVzexeRlbrq8XtWuaa4VZ3h5Fufw9dt6NLMNIltIcureLddOez/9rHfUyr4XaLjP8LrqO6Idpfd7DcwUG9US5TtdfKudjlsau4K2zsQuxK7krDnTFe+iL2NjoyNnoyIboyIfoyeXRmcvKG4Kf1Bq3h9pLbE24tt+dgqDvH7V/cZtwGbvs85xj0rbHaWoSy2FPGA4Ml4wCM0IwLbR1oM8YWdqBC2GbAWAZj2L3YnQEGTcIe/mkpjOGTlkM4IFYusQJKosDyGSNWIbFCBYx0EM4Rq5BYOXwW4rNArFJiFfBZis8SsSqJVRbaZeKzLIGFZ5VrZyRuhTlG5lSYY9KcCjhygA/gGAs+gCMHl3ngGBc+tLMyB7l1klv4AIbUjANw5Aabdj7GhQ1YYuHgcCFycB7nSIhrx1xg8e/hM4hPDw5BOHisK5d1WdJRckUaJU1Jo6SjQ96c5DA4aCR5Jo0kFvqdjqSXxGW9JC76/+kL7RIH0itPOmJ+0r0gTSXnpCPVC2PSV+YX4JN0L2ifSFzStxQ+fKSKvSLdxQ59oeuzvtD1Wd+0N1hT2Q+saZa0Rm4zyTnpmyXdaT/EdbG+aW+Qpmk/oEacSfqS1mJ30NoljaBp0p109ElfaOeJMwr0gsv0iFvPbc7lW9Dx88YD6v0nhfIOfJAzldMpRwCbjerb0VoTgo32QbTRznLxiHl1HY2LN+TPT/j9bMNeowbr5fV42uJW6eN2OThdLO/Gc3w7vvr2/A23+banHhW/jaM/B38u+I+/4Cn72YdV0RuL4RU6DRIr1ae7M63u16PxaLrADkPueDAW5AuDsUb3D6LK9w+g6l+OhUL/ZfDDc4YzRF0t1pN5ezAZT2/VsPcE",
    },
    {
      url: "https://puzz.link/p?doubleback/23/9/051602u9ghhls666vh35bk1stt667e518hg0i48006800uuvnhvpge766m1oso0f3g3guvuu8e040000040000000000000000000000000000000000000",
      test: false,
    },
  ],
};
