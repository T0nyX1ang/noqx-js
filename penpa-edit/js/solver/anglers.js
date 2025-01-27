/** The Anglers solver. */

modules["anglers"] = {
  name: "Anglers",
  category: "loop",
  aliases: ["anglerfish"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.symbol.size > 0, "No clues found.");
    fail_false(puzzle.symbol.size === puzzle.text.size, "Unmatched clues.");
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("anglers(R, C) :- grid(R, C), not black(R, C).");
    solver.add_program_line(fill_path("anglers"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(single_loop("anglers", true));
    solver.add_program_line(avoid_unknown_src("anglers", "loop"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(symbol_name, "tents__3");
      solver.add_program_line(`dead_end(${r}, ${c}).`);
    }

    const tag = tag_encode("reachable", "grid", "src", "adj", "loop", "anglers");
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (!(0 <= r && r < puzzle.row && 0 <= c && c < puzzle.col)) {
        solver.add_program_line(`grid(${r}, ${c}).`);
      }

      solver.add_program_line(`dead_end(${r}, ${c}).`);
      solver.add_program_line(grid_src_color_connected([r, c], null, null, "anglers", "loop"));

      if (typeof num === "number") {
        solver.add_program_line(count_reachable_src(num + 1, [r, c], "grid", "anglers", "loop"));
      }

      for (const [point1, _] of puzzle.text.entries()) {
        const [r1, c1, _, __] = extract_point(point1);
        if (r1 !== r || c1 !== c) {
          solver.add_program_line(`:- ${tag}(${r}, ${c}, ${r1}, ${c1}).`);
        }
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`black(${r}, ${c}).`);
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
      data: "m=edit&p=7VTBjtowEL3zFas5zyGOE0h8qeh26YWybWG1QlGEAvUKVNjQQKrKiH/fmQlRqKDqFrWcKsuj5zdO5uU54823MissRjR0hB4qGjrwZfpeLNM7jNFiu7TmBrvldp4XBBDvez18ypYb20r4SRppa+di47ro3psEFCD4NBWk6D6Znftg3BjdkFKAAXH9apNP8K6Bj5JndFuRyiM8OGCCY4Jb+7zdVMuPJnEjBC7yVh5lCKv8u4WDCF7P8tV0wcThSSE35Zf8a3nYptI9um4ls1/L5AIsMwDUjUyGlUxGZ2SyepY5WxSzpZ30L1I6zbbk+Wa+WJ+TG6f7Pdn9mQRPTMLaHxoYNXBodhAGYALCA8aq/t7qZKBNyYQPqiY6HSZ0Q8QeE2RBTShPMxMeMarNzJuaoWLK7CiOqaSOKafx6NAg5Bf8TLVPqU54SkUnVMR6jykq25PivsQRGYFOS3wn0ZMYSuzLnjuJjxJvJQYS27Knw1a+0uzK5uPv/1M5oH36ojhCCCLyREBMTjAIFbJP+pWSEx1XnSmjczlOWwkMy+Ipm1n6GfuLZ3szyItVtqTVoFxNbdGsh/NsbYHugn0LfoBMOh5FLf//erju9cDWe1f7b/9OGyXkLt0YSPcUunuEdTnJJrOcfiwy8PfJqkEuSf6bmtTL5xPU279IxOFJ4upnRFdH2noB",
    },
    {
      data: "m=edit&p=7ZRLi9swFIX3/hWD1ndhyfbE1qak00k3bvpIyhCMGZxUQ0yTeOpHKQr573PvtYvHTjYttEyhyDocHevxISFV35qsNCAVfV4ILkgsfuRz9SYBV7cry7zeGX0F06beFiUagPezGTxku8o4CY3EkjpHG2k7BftWJ0IKEAqrFCnYj/po32m7ArvAXwJ8zOK2k0J729s7/k/upg2li37eebQrtLU51FXb/KATuwRBi7zmoWTFvvhuRAdB7U2xX+cUdCM5rJovxdem6ybTE9hpixn/xKQFOkyvxyTbYpK7gEn0hLnJy83O3Me/RbrOatzzaps/XsKN0tMJt/sTAt/rhNg/9zbs7UIfUef6KLyQhr5ClvZMhK9GQTgOpArGiX89TibjeWUYjRIlh6OQSDLXCrkCH/958OxMRUBTDqPQO4sieRZJdT6ZjGjxYaZc90I2XgIBZ4ypWJe4o2A91jesLmvAGnOfW9Y71htWn/Wa+0zoTH7p1J7v1B/CSYLu+g7K5N/LUicRi6Z8yDYGb0ycH8zVvCj32Q5b82a/NmXfXmyzRyPwwTo54ofgikeP79//N+wvv2G09e5LuxMvDQdvaeo8AQ==",
    },
    {
      data: "m=edit&p=7VRdb5swFH3nV1R+vg82hibxW5Y1e2HZRzJVEUIVYa6CRkrHxzQ54r/33gsTLevLJm3qpMnx0fHB5hyuY9df27SyoHz66TlIUNiCRcBdz0Lucmi7vCmsuYBl2xzLCgnAu/UabtOitl5MK7El3tktjFuCe2NioQQIH7sSCbgP5uzeGrcHt8VHAgLUon6Sj/RqpNf8nNiqF5VEvhk40j3Sxt41dT98b2K3A0Emr3gpUXEqv1kxhKBxVp4OOQnDShbr9nP5pR2mqaQDt+xjRj9iksEQU48xifYxiT0Tk9JTzCyvssLeRL+V9JA2WPP6mN8/F3eRdB2W+yMGvjExZf800vlIt+aMuDFnoRe01JcYpt8UEfhTRWn5kxRcTiVf6acSOij22aPPnHw0PNojoSS9Y6JpeslEC8l+os2mGvqs2c1n3OGHgtOMrxklY8gY8ZwrxmvGFWPAeMlzZlSqXyrm4w/+Q3HicDhVT9rs39MSLxbbtrpNM4t/5Ci/sxebsjqlBY427elgq3G8Pab3VuA90nniu+COW4/X0v+r5S9fLVR6+dLOxEuLg6c08R4A",
      test: false,
    },
  ],
};
