// 2D KD-Tree for O(log N) average nearest-driver search.
//
// Points are plain objects: { id, x, y }. x/y are planar coordinates
// (e.g. normalized lon/lat after an equirectangular projection). Distances
// are Euclidean in that plane, which is a fine approximation at city scale.

export class KDTree {
    constructor(points = []) {
        this.size = points.length;
        // build on a shallow copy so we don't reorder the caller's array
        this.root = this._build(points.slice(), 0);
    }

    _build(points, depth) {
        if (points.length === 0) return null;

        const axis = depth % 2; // 0 -> split on x, 1 -> split on y
        points.sort((a, b) => (axis === 0 ? a.x - b.x : a.y - b.y));

        const mid = Math.floor(points.length / 2);
        return {
            point: points[mid],
            axis,
            left: this._build(points.slice(0, mid), depth + 1),
            right: this._build(points.slice(mid + 1), depth + 1),
        };
    }

    static _dist2(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    // Single nearest neighbour. Returns { point, dist } or null when empty.
    nearest(x, y) {
        let best = null;
        let bestD2 = Infinity;

        const visit = (node) => {
            if (!node) return;
            const p = node.point;
            const d2 = KDTree._dist2(x, y, p.x, p.y);
            if (d2 < bestD2) {
                bestD2 = d2;
                best = p;
            }
            const diff = node.axis === 0 ? x - p.x : y - p.y;
            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            visit(near);
            // only descend the far side if the splitting plane is closer
            // than the best distance found so far (the pruning step)
            if (diff * diff < bestD2) visit(far);
        };

        visit(this.root);
        return best === null ? null : { point: best, dist: Math.sqrt(bestD2) };
    }

    // k nearest neighbours, sorted ascending by distance.
    kNearest(x, y, k) {
        if (k <= 0) return [];
        // bounded collection kept sorted with the worst element at index 0
        const heap = [];
        const worstD2 = () => (heap.length < k ? Infinity : heap[0].d2);

        const offer = (point, d2) => {
            if (heap.length < k) {
                heap.push({ point, d2 });
                if (heap.length === k) heap.sort((a, b) => b.d2 - a.d2);
            } else if (d2 < heap[0].d2) {
                heap[0] = { point, d2 };
                heap.sort((a, b) => b.d2 - a.d2);
            }
        };

        const visit = (node) => {
            if (!node) return;
            const p = node.point;
            offer(p, KDTree._dist2(x, y, p.x, p.y));

            const diff = node.axis === 0 ? x - p.x : y - p.y;
            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            visit(near);
            if (diff * diff < worstD2()) visit(far);
        };

        visit(this.root);
        return heap
            .map((h) => ({ point: h.point, dist: Math.sqrt(h.d2) }))
            .sort((a, b) => a.dist - b.dist);
    }

    // All points inside a radius, sorted ascending by distance.
    withinRadius(x, y, radius) {
        const r2 = radius * radius;
        const out = [];

        const visit = (node) => {
            if (!node) return;
            const p = node.point;
            const d2 = KDTree._dist2(x, y, p.x, p.y);
            if (d2 <= r2) out.push({ point: p, dist: Math.sqrt(d2) });

            const diff = node.axis === 0 ? x - p.x : y - p.y;
            const near = diff < 0 ? node.left : node.right;
            const far = diff < 0 ? node.right : node.left;

            visit(near);
            if (diff * diff <= r2) visit(far);
        };

        visit(this.root);
        return out.sort((a, b) => a.dist - b.dist);
    }
}
