const std = @import("std");

const Orbital = struct {
    n: u8, // principal quantum number
    l: u8, // azimuthal: 0=s,1=p,2=d,3=f
    cap: u8, // max electrons: 2*(2l+1)
};

const FilledOrbital = struct {
    n: u8,
    l: u8,
    cap: u8,
    electrons: u8,
};

const Config = struct {
    electrons: u32,
    filled: []FilledOrbital,
    exception_applied: bool,
    exception_note: [128]u8,
    exception_note_len: usize,
};

// Aufbau Order (diagonal rule, 1s -> 7p)
const AUFBAU_ORDER = [_]Orbital{
    .{ .n = 1, .l = 0, .cap = 2 }, // 1s
    .{ .n = 2, .l = 0, .cap = 2 }, // 2s
    .{ .n = 2, .l = 1, .cap = 6 }, // 2p
    .{ .n = 3, .l = 0, .cap = 2 }, // 3s
    .{ .n = 3, .l = 1, .cap = 6 }, // 3p
    .{ .n = 4, .l = 0, .cap = 2 }, // 4s
    .{ .n = 3, .l = 2, .cap = 10 }, // 3d
    .{ .n = 4, .l = 1, .cap = 6 }, // 4p
    .{ .n = 5, .l = 0, .cap = 2 }, // 5s
    .{ .n = 4, .l = 2, .cap = 10 }, // 4d
    .{ .n = 5, .l = 1, .cap = 6 }, // 5p
    .{ .n = 6, .l = 0, .cap = 2 }, // 6s
    .{ .n = 4, .l = 3, .cap = 14 }, // 4f
    .{ .n = 5, .l = 2, .cap = 10 }, // 5d
    .{ .n = 6, .l = 1, .cap = 6 }, // 6p
    .{ .n = 7, .l = 0, .cap = 2 }, // 7s
    .{ .n = 5, .l = 3, .cap = 14 }, // 5f
    .{ .n = 6, .l = 2, .cap = 10 }, // 6d
    .{ .n = 7, .l = 1, .cap = 6 }, // 7p
};

// NobleGas
const NobleGas = struct { symbol: []const u8, z: u32 };

const NOBLE_GASES = [_]NobleGas{
    .{ .symbol = "Rn", .z = 86 },
    .{ .symbol = "Xe", .z = 54 },
    .{ .symbol = "Kr", .z = 36 },
    .{ .symbol = "Ar", .z = 18 },
    .{ .symbol = "Ne", .z = 10 },
    .{ .symbol = "He", .z = 2 },
};

// Exceptions, ground state
// Key = atomic number (neutral atom electrons), value = override per orbital.
// Format: array of {orbital_index_in_AUFBAU_ORDER, electron_count}.

const OrbitalOverride = struct { idx: usize, count: u8 };
const Exception = struct { z: u32, overrides: []const OrbitalOverride };

const EXCEPTIONS = [_]Exception{

    // --- Period 4 ---
    // Cr (24): [Ar] 3d5 4s1
    .{ .z = 24, .overrides = &[_]OrbitalOverride{ .{ .idx = 5, .count = 1 }, .{ .idx = 6, .count = 5 } } },
    // Cu (29): [Ar] 3d10 4s1
    .{ .z = 29, .overrides = &[_]OrbitalOverride{ .{ .idx = 5, .count = 1 }, .{ .idx = 6, .count = 10 } } },

    // --- Period 5 ---
    // Nb (41): [Kr] 4d4 5s1
    .{ .z = 41, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 1 }, .{ .idx = 9, .count = 4 } } },
    // Mo (42): [Kr] 4d5 5s1
    .{ .z = 42, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 1 }, .{ .idx = 9, .count = 5 } } },
    // Ru (44): [Kr] 4d7 5s1
    .{ .z = 44, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 1 }, .{ .idx = 9, .count = 7 } } },
    // Rh (45): [Kr] 4d8 5s1
    .{ .z = 45, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 1 }, .{ .idx = 9, .count = 8 } } },
    // Pd (46): [Kr] 4d10 5s0
    .{ .z = 46, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 0 }, .{ .idx = 9, .count = 10 } } },
    // Ag (47): [Kr] 4d10 5s1
    .{ .z = 47, .overrides = &[_]OrbitalOverride{ .{ .idx = 8, .count = 1 }, .{ .idx = 9, .count = 10 } } },

    // --- Period 6 ---
    // La (57): [Xe] 5d1 6s2  (4f0)
    .{ .z = 57, .overrides = &[_]OrbitalOverride{ .{ .idx = 12, .count = 0 }, .{ .idx = 13, .count = 1 } } },
    // Ce (58): [Xe] 4f1 5d1 6s2
    .{ .z = 58, .overrides = &[_]OrbitalOverride{ .{ .idx = 12, .count = 1 }, .{ .idx = 13, .count = 1 } } },
    // Gd (64): [Xe] 4f7 5d1 6s2
    .{ .z = 64, .overrides = &[_]OrbitalOverride{ .{ .idx = 12, .count = 7 }, .{ .idx = 13, .count = 1 } } },
    // Pt (78): [Xe] 4f14 5d9 6s1
    .{ .z = 78, .overrides = &[_]OrbitalOverride{ .{ .idx = 11, .count = 1 }, .{ .idx = 13, .count = 9 } } },
    // Au (79): [Xe] 4f14 5d10 6s1
    .{ .z = 79, .overrides = &[_]OrbitalOverride{ .{ .idx = 11, .count = 1 }, .{ .idx = 13, .count = 10 } } },

    // --- Period 7 ---
    // Ac (89): [Rn] 6d1 7s2  (5f0)
    .{ .z = 89, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 0 }, .{ .idx = 17, .count = 1 } } },
    // Th (90): [Rn] 6d2 7s2  (5f0)
    .{ .z = 90, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 0 }, .{ .idx = 17, .count = 2 } } },
    // Pa (91): [Rn] 5f2 6d1 7s2
    .{ .z = 91, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 2 }, .{ .idx = 17, .count = 1 } } },
    // U  (92): [Rn] 5f3 6d1 7s2
    .{ .z = 92, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 3 }, .{ .idx = 17, .count = 1 } } },
    // Np (93): [Rn] 5f4 6d1 7s2
    .{ .z = 93, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 4 }, .{ .idx = 17, .count = 1 } } },
    // Cm (96): [Rn] 5f7 6d1 7s2
    .{ .z = 96, .overrides = &[_]OrbitalOverride{ .{ .idx = 16, .count = 7 }, .{ .idx = 17, .count = 1 } } },
    // Lr (103): [Rn] 5f14 7s2 7p1
    .{ .z = 103, .overrides = &[_]OrbitalOverride{ .{ .idx = 17, .count = 0 }, .{ .idx = 18, .count = 1 } } },
};

fn subshellLetter(l: u8) u8 {
    return switch (l) {
        0 => 's',
        1 => 'p',
        2 => 'd',
        3 => 'f',
        else => '?',
    };
}

fn nobleGasForElectrons(electrons: u32) ?NobleGas {
    var best: ?NobleGas = null;
    for (NOBLE_GASES) |ng| {
        if (electrons >= ng.z) {
            if (best == null or ng.z > best.?.z)
                best = ng;
        }
    }
    return best;
}
// Build Aufbau filling array.
// Returns slice length.
fn aufbauFill(electrons: u32, out: []FilledOrbital) usize {
    var remaining: u32 = electrons;
    var count: usize = 0;
    for (AUFBAU_ORDER) |orb| {
        if (remaining == 0) break;
        const e: u8 = if (remaining >= orb.cap) orb.cap else @intCast(remaining);
        out[count] = .{ .n = orb.n, .l = orb.l, .cap = orb.cap, .electrons = e };
        count += 1;
        remaining -= e;
    }
    return count;
}

// Find exception for given electron count Z. Returns null if none.
fn findException(electrons: u32) ?*const Exception {
    for (&EXCEPTIONS) |*ex| {
        if (ex.z == electrons) return ex;
    }
    return null;
}

/// Apply exception overrides to a filled orbital array.
/// Returns new length (may grow if an override injects an orbital not yet filled).
fn applyException(filled: []FilledOrbital, exc: *const Exception, len: usize) usize {
    var new_len = len;
    for (exc.overrides) |ov| {
        var found = false;
        var i: usize = 0;
        while (i < new_len) : (i += 1) {
            if (filled[i].n == AUFBAU_ORDER[ov.idx].n and
                filled[i].l == AUFBAU_ORDER[ov.idx].l)
            {
                filled[i].electrons = ov.count;
                found = true;
                break;
            }
        }
        // Orbital not yet in array -> inject it (e.g. 5d1 for Gd)
        if (!found and ov.count > 0 and new_len < 19) {
            const orb = AUFBAU_ORDER[ov.idx];
            filled[new_len] = .{ .n = orb.n, .l = orb.l, .cap = orb.cap, .electrons = ov.count };
            new_len += 1;
        }
    }
    return new_len;
}

// Valence electron
// Highest n s+p electrons for main group. highest (n-1)d + ns for transition.

// fn valenceElectrons(filled: []const FilledOrbital, len: usize) u32 {
//     var max_n: u8 = 0;
//     var i: usize = 0;
//     while (i < len) : (i += 1) {
//         if (filled[i].electrons > 0 and filled[i].n > max_n)
//             max_n = filled[i].n;
//     }
//     var valence: u32 = 0;
//     i = 0;
//     while (i < len) : (i += 1) {
//         const f = filled[i];
//         if (f.electrons == 0) continue;
//         // Outermost s/p
//         if (f.n == max_n and (f.l == 0 or f.l == 1)) valence += f.electrons;
//         // (n-1)d for transition metals
//         if (f.n == max_n - 1 and f.l == 2) valence += f.electrons;
//     }
//     return valence;
// }

fn valenceElectrons(filled: []const FilledOrbital, len: usize) u32 {
    var max_n: u8 = 0;
    var last_l: u8 = 0;

    // Find outermost shell and last orbital type
    for (filled[0..len]) |f| {
        if (f.electrons > 0 and f.n >= max_n) {
            max_n = f.n;
            last_l = f.l;
        }
    }

    var valence: u32 = 0;

    for (filled[0..len]) |f| {
        if (f.electrons == 0) continue;

        switch (last_l) {

            // s-block
            0 => {
                if (f.n == max_n and f.l == 0)
                    valence += f.electrons;
            },

            // p-block
            1 => {
                if (f.n == max_n and (f.l == 0 or f.l == 1))
                    valence += f.electrons;
            },

            // d-block
            2 => {
                if (f.n == max_n and f.l == 0)
                    valence += f.electrons;
                if (f.n == max_n - 1 and f.l == 2)
                    valence += f.electrons;
            },

            // f-block
            3 => {
                if (f.n == max_n and f.l == 0)
                    valence += f.electrons;
                if (f.n == max_n - 1 and f.l == 2)
                    valence += f.electrons;
                if (f.n == max_n - 2 and f.l == 3)
                    valence += f.electrons;
            },

            else => {},
        }
    }

    return valence;
}
/// Write full configuration string into buf, return length.
/// Sort filled orbitals by (n, l) for display.
fn writeFull(filled: []const FilledOrbital, len: usize, buf: []u8) usize {
    // Collect non-zero
    var sorted: [19]FilledOrbital = undefined;
    var slen: usize = 0;
    var i: usize = 0;
    while (i < len) : (i += 1) {
        if (filled[i].electrons > 0) {
            sorted[slen] = filled[i];
            slen += 1;
        }
    }
    // Bubble sort by n then l
    var a: usize = 0;
    while (a < slen) : (a += 1) {
        var b: usize = a + 1;
        while (b < slen) : (b += 1) {
            if (sorted[a].n > sorted[b].n or
                (sorted[a].n == sorted[b].n and sorted[a].l > sorted[b].l))
            {
                const tmp = sorted[a];
                sorted[a] = sorted[b];
                sorted[b] = tmp;
            }
        }
    }
    var pos: usize = 0;
    i = 0;
    while (i < slen) : (i += 1) {
        if (i > 0) {
            buf[pos] = ' ';
            pos += 1;
        }
        const f = sorted[i];
        pos += (std.fmt.bufPrint(buf[pos..], "{d}{c}{d}", .{ f.n, subshellLetter(f.l), f.electrons }) catch unreachable).len;
    }
    return pos;
}

/// Write condensed configuration (noble gas core + remainder).
fn writeCondensed(filled: []const FilledOrbital, len: usize, electrons: u32, buf: []u8) usize {
    const ng = nobleGasForElectrons(electrons);
    var pos: usize = 0;
    if (ng) |gas| {
        pos += (std.fmt.bufPrint(buf[pos..], "[{s}]", .{gas.symbol}) catch unreachable).len;
        // Remaining orbitals after noble gas core
        var core_e: u32 = gas.z;
        var sorted: [19]FilledOrbital = undefined;
        var slen: usize = 0;
        var i: usize = 0;
        while (i < len) : (i += 1) {
            if (filled[i].electrons == 0) continue;
            // Check if this orbital is fully within the noble gas core
            if (core_e >= filled[i].electrons) {
                core_e -= filled[i].electrons;
            } else {
                // Partial or beyond core
                var f = filled[i];
                f.electrons -= @intCast(core_e);
                core_e = 0;
                sorted[slen] = f;
                slen += 1;
            }
        }
        // Sort remainder by n then l
        var a: usize = 0;
        while (a < slen) : (a += 1) {
            var b: usize = a + 1;
            while (b < slen) : (b += 1) {
                if (sorted[a].n > sorted[b].n or
                    (sorted[a].n == sorted[b].n and sorted[a].l > sorted[b].l))
                {
                    const tmp = sorted[a];
                    sorted[a] = sorted[b];
                    sorted[b] = tmp;
                }
            }
        }
        i = 0;
        while (i < slen) : (i += 1) {
            buf[pos] = ' ';
            pos += 1;
            const f = sorted[i];
            pos += (std.fmt.bufPrint(buf[pos..], "{d}{c}{d}", .{ f.n, subshellLetter(f.l), f.electrons }) catch unreachable).len;
        }
    } else {
        // No noble gas core
        pos += writeFull(filled, len, buf[pos..]);
    }
    return pos;
}

// ION

/// Output buffer (?)
var OUTPUT_BUF: [4096]u8 = undefined;
var OUTPUT_LEN: usize = 0;

/// Main computation. Writes text result into OUTPUT_BUF.
pub fn compute(electrons: u32) void {
    // 1. Aufbau fill
    var aufbau_filled: [19]FilledOrbital = undefined;
    const aufbau_len = aufbauFill(electrons, &aufbau_filled);

    // 2. Working copy for exception application
    var working: [19]FilledOrbital = undefined;
    @memcpy(working[0..aufbau_len], aufbau_filled[0..aufbau_len]);

    var exception_applied = false;
    var exc_note_buf: [256]u8 = undefined;
    var exc_note_len: usize = 0;

    var working_len = aufbau_len;
    if (findException(electrons)) |exc| {
        working_len = applyException(&working, exc, aufbau_len);
        exception_applied = true;
        exc_note_len = (std.fmt.bufPrint(
            &exc_note_buf,
            "Exception applied (observed ground state): ",
            .{},
        ) catch unreachable).len;
        // Describe overrides
        for (exc.overrides, 0..) |ov, ei| {
            if (ei > 0) {
                exc_note_buf[exc_note_len] = ',';
                exc_note_buf[exc_note_len + 1] = ' ';
                exc_note_len += 2;
            }
            const f = AUFBAU_ORDER[ov.idx];
            exc_note_len += (std.fmt.bufPrint(
                exc_note_buf[exc_note_len..],
                "{d}{c}{d}",
                .{ f.n, subshellLetter(f.l), ov.count },
            ) catch unreachable).len;
        }
    }

    // 3. Build output text
    var pos: usize = 0;
    var tmp: [1024]u8 = undefined;

    // Full
    const full_len = writeFull(&working, working_len, &tmp);
    pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "Full: {s}\n", .{tmp[0..full_len]}) catch unreachable).len;

    // Condensed
    const cond_len = writeCondensed(&working, working_len, electrons, &tmp);
    pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "Condensed: {s}\n", .{tmp[0..cond_len]}) catch unreachable).len;

    // Aufbau filling steps (always show neutral Aufbau)
    pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "Aufbau filling:\n", .{}) catch unreachable).len;
    var i: usize = 0;
    while (i < aufbau_len) : (i += 1) {
        const f = aufbau_filled[i];
        pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "  - {d}{c}{d} (cap {d})\n", .{ f.n, subshellLetter(f.l), f.electrons, f.cap }) catch unreachable).len;
    }

    // Exception note
    if (exception_applied) {
        pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "{s}\n", .{exc_note_buf[0..exc_note_len]}) catch unreachable).len;
    }

    // Valence electrons
    const ve = valenceElectrons(&working, working_len);
    pos += (std.fmt.bufPrint(OUTPUT_BUF[pos..], "Valence electrons (heuristic): {d}\n", .{ve}) catch unreachable).len;

    OUTPUT_LEN = pos;
}

// WASM Exports

export fn wasm_compute(electrons: u32) void {
    compute(electrons);
}

export fn wasm_output_ptr() [*]const u8 {
    return &OUTPUT_BUF;
}

export fn wasm_output_len() usize {
    return OUTPUT_LEN;
}

// TEST
// pub fn main() !void {
//     const stdout = std.io.getStdOut().writer();

//     const test_cases = [_]u32{
//         1, // H
//         2, // He
//         6, // C
//         10, // Ne
//         18, // Ar
//         24, // Cr  (exception test)
//         26, // Fe
//         29, // Cu  (exception test)
//         36, // Kr
//         41, // Nb  (exception test)
//         42, // Mo  (exception test)
//         44, // Ru  (exception test)
//         45, // Rh  (exception test)
//         46, // Pd  (exception test)
//         47, // Ag  (exception test)
//         50, // Sn
//         54, // Xe
//         57, // La  (exception test)
//         58, // Ce  (exception test)
//         64, // Gd  (exception test)
//         78, // Pt  (exception test)
//         79, // Au  (exception test)
//         80, // Hg
//         86, // Rn
//         92, // U   (exception test)
//         96, // Cm  (exception test)
//         108,
//     };

//     for (test_cases) |z| {
//         try stdout.print("Z = {d} \n", .{z});
//         compute(z);
//         try stdout.writeAll(OUTPUT_BUF[0..OUTPUT_LEN]);
//         try stdout.writeByte('\n');
//     }
// }

const builtin = @import("builtin");

pub fn main() !void {
    if (builtin.target.os.tag == .freestanding) return;

    const stdout = std.io.getStdOut().writer();

    const test_cases = [_]u32{ 1, 2, 6, 10, 18, 24, 26, 29, 36, 41, 42, 44, 45, 46, 47, 50, 54, 57, 58, 64, 78, 79, 80, 86, 92, 96, 108 };

    for (test_cases) |z| {
        try stdout.print("Z = {d}\n", .{z});
        compute(z);
        try stdout.writeAll(OUTPUT_BUF[0..OUTPUT_LEN]);
        try stdout.writeByte('\n');
    }
}
