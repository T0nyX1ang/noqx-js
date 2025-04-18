/** The Cave solver. */

function cave_product_rule(target, src_cell, color = "black", adj_type = 4) {
  /**
   * Product rule for cave.
   */
  const tag = tag_encode("reachable", "bulb", "src", "adj", adj_type, color);
  const [src_r, src_c] = src_cell;
  const count_r = `#count { R: ${tag}(${src_r}, ${src_c}, R, C) } = CR`;
  const count_c = `#count { C: ${tag}(${src_r}, ${src_c}, R, C) } = CC`;
  return `:- ${count_r}, ${count_c}, CR * CC != ${target}.`;
}

modules["cave"] = {
  name: "Cave",
  category: "shade",
  aliases: ["corral", "bag"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("not black"));
    solver.add_program_line(border_color_connected(puzzle.row, puzzle.col, "black"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      solver.add_program_line(bulb_src_color_connected([r, c], "not black"));

      if (Number.isInteger(num)) {
        if (puzzle.param["product"]) {
          solver.add_program_line(cave_product_rule(num, [r, c], "not black"));
        } else {
          solver.add_program_line(count_reachable_src(num, [r, c], "bulb", "not black"));
        }
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
      data: "m=edit&p=7VRNb9swDL37VwQ682D560O3rGt2Sb2PZCgKwygcz0WDOXDnxMOgIP+9JG1PUZHLMKAohiHRwyNFUs+ipP2PvuxqkJL+fgIuIIMgjHhI6fFwx996e2hqNYN5f3hsOyQAHxcLeCibfe3kY1ThHHWq9Bz0B5ULT8A4CtCf1VHfKJ2BXuGUAIm+JTIpwEN6begtzxO7GpzSRZ6NHOkd0mrbVU19vxw8n1Su1yBonXecTVTs2p+1GNLYrtrdZkuOTXnAj9k/bp/GmX3/rf3ej7GyOIGeD3JXk9zAyPWNXKKDXGIX5NJX/L3c5qm9JDQtTifc8C8o9V7lpPqroYmhK3VEzNRR+B6mpthlTMdqfoBm/NsMXDSx85NJwaExEys4jKzZyA6OqLIpFVNlkxtTsJlNqdSZaS+Eh9ASLT07XHov4kNbigxJy5kdkRhJp31y2HJkRAXpWkyOmFb0jZ28SEhohcTYqf25Mj2Px1ZIbsgd44LRY1xjv0D7jO8ZXcaQcckx14y3jFeMAWPEMTF1/I/OxCvIyX18Si78qCf/qLdwcrHqu4eyqvHmZv1uU3ezrO12ZSPwkTw54pfgwccq+P9uvvq7SZvvvrWb8tbk4N0VVYnbWzjP",
    },
    {
      data: "m=edit&p=7VVRb5swEH7nV1R+vgdsEwK8TFnb7CWj25KpqhCKCKNqNCIyEqbJUf577w4maujDpkmZJk3EXz5/Z58/zrFz+NZkdQHSpY8OAL/x8WTATQU+N7d7VttjWURXMGuOT1WNBOBuPofHrDwUTtKNSp2TCSMzA/MuSoQS0LUUzMfoZN5HJgazxJAAidoCmRSgkN729J7jxK5bUbrI444jfUCab+u8LNaLVvkQJWYFgtZ5y7OJil31vRDtNO7n1W6zJWGTHfFlDk/bfRc5NF+qr003VqZnMLPW7vKnXa+3q3u7RFu7xF6xS2/x53bLffWa0TA9n7Hgn9DqOkrI9eeeBj1dRifEODoJ7dPUN+gCMAHm8yYoqL4bWN2JtLsUfTnbp7gleAMhcK0MgZ0/tPOHejBbusN8Uo6V6VBRtKitKGshqUK7r0cr61FWj2r3Yo43yDGqjvRp1V7BPZC8Ew+Mc0bFuMKNAqMZbxhdxgnjgsfcMt4zXjN6jD6PmdJW/+KPQWgskEeW8ZVU+9O4gLlEtzeM/Uz+PS11ErFs6scsL/BYxs1uU9RXcVXvslLgDXh2xA/BLdF0of6/FC9+KVLx3d+6Gv/+4UywrnhCzB2IfbPO1nlVCvxHBdLxpI4CF7ePJ1jkGW5H6jwD",
    },
    {
      data: "m=edit&p=7VRNb5tAEL3zK6w974FhAeO9uWnci0s/7CqKEIowJQoqiBRMVS3yf8/MgLNGyqWqFKVShff5vdmZ8WMw2/3ss7aQ4NJHRRK/8fIh4uVFIS93uvblsSr0Qq7740PTIpHy02Yj77OqK5xkykqdway0WUvzQSfCE3JaqTRf9GA+ahNLs8MtIQFjW2QgpIf02tIb3id2NQbBRR5PHOkt0rxs86q4246Rzzoxeynod95xNVFRN78KMZaxzpv6UFLgkB3xZrqH8nHa6frvzY9+yoX0JM16tLs72/WtXWXtEh3tEnvBLt3F39utHpuXjK7S0wkH/hWt3umEXH+zNLJ0pwfEWA9C+Vi6xKeM5djNJ+k9y8BD6T/LUM3kkpIhtDpEHVm5mmVHgDKwcp4MLmXbbQBqbnsDUD5YawBUcJHgUX+46KDm5sEn9/TfPgcCqrjoGJI+W8L5AE/plnHD6DHucYjSKMb3jC5jwLjlnGvGG8YrRp8x5JwlPYY/elCvYCdR4/s+v2ig/1gsdRKx69v7LC/wJYn7+lC0i7hp66wSeB6dHPFb8EoUHW//j6hXP6Jo+O5b+/+/NTv4Roo8w/GmzhM=",
      config: { product: true },
    },
  ],
  parameters: {
    product: { name: "Product", type: "checkbox", default: false },
  },
};
