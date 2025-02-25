/** The Sudoku solver. */

modules["sudoku"] = {
  name: "Sudoku",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    const sep = {
      9: [3, 3],
      8: [2, 4],
      6: [2, 3],
      4: [2, 2],
    };

    solver.add_program_line(grid(n, n));
    solver.add_program_line(adjacent("x"));

    const [seg_i, seg_j] = sep[n];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const area_id = Math.floor(i / seg_i) * Math.floor(n / seg_j) + Math.floor(j / seg_j);
        solver.add_program_line(area(area_id, [[i, j]]));
      }
    }

    solver.add_program_line(fill_num(Array.from({ length: n }, (_, i) => i + 1)));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));
    solver.add_program_line(unique_num("grid", "area"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
    }

    if (puzzle.param["diagonal"]) {
      for (let i = 0; i < n; i++) {
        solver.add_program_line(`area(${n + 1}, ${i}, ${i}).`);
        solver.add_program_line(`area(${n + 2}, ${i}, ${8 - i}).`);
      }
    }

    if (puzzle.param["untouch"]) {
      solver.add_program_line(avoid_num_adjacent("x"));
    }

    if (puzzle.param["antiknight"]) {
      solver.add_program_line("adj_knight(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| = 2, |C - C1| = 1.");
      solver.add_program_line("adj_knight(R, C, R1, C1) :- grid(R, C), grid(R1, C1), |R - R1| = 1, |C - C1| = 2.");
      solver.add_program_line(avoid_num_adjacent("knight"));
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVLi9s8FN3nVwxaayFd2fJjl04n3aTpIynDYMKQSVMmNCElj4/ikP8+514rkV0+GEopZFEc35xrSefch2TvDl833w+6wOVybbTF5XIjd57wz4RrstyvFuWN7h/2z5stgNYfBgP9bbbaLXpVmDXtHeuirPu6fldWyiqtCLdVU11/Ko/1+1I1gkrXY0xQ2mJk2EwlwLsI72Wc0W3z0BrgUcCAD4Dz5Xa+WjwOmycfy6qeaMVqb2Q1Q7Xe/LdQIRr255v105IfPM32SGn3vPwRRkJsZ4mTrvuvBe1i0AyboBn9T9Ccy18OmqanE1rwGWE/lhVn8CXCPMJxeYQdlUflHJZy16VLyiVw3cVNPFyKbgY3u7gpT06im3ZHea2PbtFh9gZuEV1mzqObd3Q9r00vbsFunGwNc8U4rLGdnKzpslnD66O2tdSht5ZrEkO1lvNs6dEv/MTrW+NSxBa/48KcK4G6W6n+g9iBWBI7QXN07cS+FWvEpmKHMucOPbM5yLgIBMai0MQJAONfE0GMMaWaHBJnjKNNKYJmnFpNHgEy9ommDJVnnGWaChSScYEXgEERmD8Hvwn8Bvw28FvwU+An8CeBPwE/bwzRAj93VrTAnwd+vFyoaPjxDy1sFeHh+MNzcsCBh8DTzovO8z1w4Cfwt+Ohpj74Rx2CroOuC3F6rkPIy0PXB10P3XZ9fND10PVB10O3nRdvV8HQ5b0qGLoZ66Jp99K6W7GJWC8tzfg0/tZ5/fPd82o4FarHm7t98eG4oifTXqXG8t67GW2269lK4cNz6qmfSm45u8m/b9EVfIu4Hebadvi1hYMzp+ar2W63nKtp7wU=",
    },
    {
      data: "m=edit&p=7VVda9swFH3Pryh61oN0Zcsfb1nX7CXLPpJRigklzVIalpCRjzEc8t977rUa2WNQxhjkYTi+OVeWzrkfkr07fN18O+gCl8u10RaXy43cecI/E67Jcr9alFe6f9g/bbYAWn8YDPTjbLVb9Kowa9o71kVZ93X9rqyUVVoRbqumuv5UHuv3pWoEla7HmKC0xZNhM5UAbyK8leeMrptBa4BHAQPeAc6X2/lqcT9sRj6WVT3RitXeyGqGar35sVAhGvbnm/XDkgceZnuktHtafg9PQmwvEidd918L2sWgGTZBM/pN0JzLPw6apqcTWvAZYd+XFWfwJcI8wnF5hB2VR+UslnLXpUvKpXD92U34KUWX4BbRzeAm0c3hZmc3ZSoX3aJD5dmNkzPT0c14bXp2C9d1WSiPbpfKml98211tibXaPicZs7LkOyWxxGlGOeuYr+3z85f1KKuV4t6JHYglsRPUXtdO7FuxRmwqdihzbtASm6MQnBSBsSg0WZQdGP+aCJVhTKkmhzowxsmlFEkwTq0mnzTYJ5oyBMc4yzQVSJxxgfNtkATz5+A3gd+A3wZ+C34K/AR+3gmME/CngT8Fvw/8Hvx54Me7g7hlouWghYIKD8cfxskBBx4CTzsvboBgDxz4CfzteKipD/5Rh6DroMv7WeLhOoS8PHR90PXQbdfHB10PXR90PXTbefmg66HL+1YwdHnTEpp2K627FpuI9dLSjA/bHx3Hv989r4ZToXq8udsXH4YLGpn2KjWW19rVaLNdz1YK35VTT/1UcstLJfn/qbmATw23w1zaDr+0cHDm1Hw12+2WczXtPQM=",
      config: { diagonal: true },
    },
    {
      data: "m=edit&p=7VRNa9tAEL37V4Q972F3Vlp93Nw07sV1P5ISgjDBcV1iauNiO6XI+L/nzewYKVAIpRR8KLJGb1bj997sh3ZPXzffn2yFK5TWWY8rlE7uMuOf0+tmuV8t6gs7fNo/brYA1n4Yjey32Wq3GDRaNR0c2qpuh7Z9VzfGG2sItzdT236qD+372iRBY9trFBjr8WacSgnwqoO38p7RZRr0DniiGPAOcL7czleL+3Ea+Vg37Y01rPZG/s3QrDc/F0bdcD7frB+WPPAw26Ol3ePyh75RbyeJo22Hr5kOnWmGyTSj35jmXv6xaZoej1iCz7B9XzfcwZcOlh28rg+Ik/pggsdfCasuq2RCjpQ3QUqzgDR0afGiOOfirEurF8XecR673DNZ3uXE0kUvZ7pefeD6spez+qke9r00cSdxJJEk3qBH2waJbyU6ibnEsdRcoXVfQqyCSQJjVVnyJBhPS2yGMeWWQpkwTgjlMM0495ZilnDMLBUwx7goLFUu4QrnyKEJ5i/B75Tfgd8rvwc/KT+BP1P+DPy58ufgj8ofwV8qP84oVYkfT2hF5WH/Ok4BWHkIPP2+6FQfgZWfwN/3Q2l+8MQ8qG6ALu8b8cPzoH1F6EbVjdDtz09U3QjdqLoRuv2+oupG6EbVjdAtWBeLditLdykxkxhlSQve1H+07f9+97xqp8Hs8UHqX7z5z2hkOmjMtXw+Liab7Xq2Mvh+Hwfml5FbznL2/5N+Bp90Xg53bjv83OzgzJn5arbbLedmOngG",
      config: { untouch: true, antiknight: true },
    },
  ],
  parameters: {
    diagonal: { name: "Diagonal", type: "checkbox", default: false },
    untouch: { name: "Untouch", type: "checkbox", default: false },
    antiknight: { name: "Antiknight", type: "checkbox", default: false },
  },
};
