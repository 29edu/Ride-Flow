// Fenwick Tree (Binary Indexed Tree).
//
// Tracks real-time ride demand per zone. Both "a new request arrived in zone z"
// (point update) and "how much demand across zones [l..r]" (prefix/range query)
// run in O(log N), so demand stays queryable as requests stream in.

export class FenwickTree {
    constructor(size) {
        this.n = size;
        this.tree = new Array(size + 1).fill(0); // 1-indexed internally
    }

    // add `delta` to position i (0-based)
    update(i, delta) {
        for (let x = i + 1; x <= this.n; x += x & -x) this.tree[x] += delta;
    }

    // sum of [0..i] inclusive (0-based)
    prefix(i) {
        let s = 0;
        for (let x = i + 1; x > 0; x -= x & -x) s += this.tree[x];
        return s;
    }

    // sum of [l..r] inclusive
    range(l, r) {
        if (r < l) return 0;
        return this.prefix(r) - (l > 0 ? this.prefix(l - 1) : 0);
    }

    total() {
        return this.prefix(this.n - 1);
    }
}
