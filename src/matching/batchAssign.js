// Batch ride assignment.
//
// Instead of greedily matching each rider to its nearest driver (which can
// leave riders stranded when several compete for the same driver), we model
// the whole batch as a min-cost max-flow problem:
//
//        source --(cap 1, cost 0)--> rider_i
//        rider_i --(cap 1, cost = distance)--> driver_j   (only k nearest)
//        driver_j --(cap 1, cost 0)--> sink
//
// Max flow = number of riders matched; min cost = total pickup distance.
// Restricting each rider to its k nearest drivers (found via the KD-tree)
// keeps the graph sparse so the flow solve stays fast on 10k+10k inputs.

import { KDTree } from './kdTree.js';
import { MinCostMaxFlow } from './minCostMaxFlow.js';

// distances are floats; flow costs must be integers-ish for stable comparisons
const COST_SCALE = 1000;

export function batchAssign(riders, drivers, { k = 6, maxRadius = Infinity } = {}) {
    const R = riders.length;
    const D = drivers.length;

    if (R === 0 || D === 0) {
        return { matched: 0, total: R, matchRate: 0, totalDistance: 0, assignments: [] };
    }

    const tree = new KDTree(drivers);

    // node layout: 0 = source, 1..R = riders, R+1..R+D = drivers, R+D+1 = sink
    const S = 0;
    const T = R + D + 1;
    const mcmf = new MinCostMaxFlow(R + D + 2);

    const driverNode = new Map();
    drivers.forEach((d, j) => driverNode.set(d.id, R + 1 + j));

    for (let i = 0; i < R; i++) {
        mcmf.addEdge(S, 1 + i, 1, 0);
        const candidates = tree.kNearest(riders[i].x, riders[i].y, k);
        for (const { point, dist } of candidates) {
            if (dist > maxRadius) continue;
            mcmf.addEdge(1 + i, driverNode.get(point.id), 1, Math.round(dist * COST_SCALE));
        }
    }
    for (let j = 0; j < D; j++) {
        mcmf.addEdge(driverNode.get(drivers[j].id), T, 1, 0);
    }

    const { flow } = mcmf.solve(S, T);

    // recover assignments: a rider node has flow on exactly one rider->driver edge
    const assignments = [];
    let totalDistance = 0;
    for (let i = 0; i < R; i++) {
        for (const e of mcmf.graph[1 + i]) {
            if (e.cap === 1 && e.flow === 1 && e.to >= R + 1 && e.to <= R + D) {
                const j = e.to - (R + 1);
                const dist = e.cost / COST_SCALE;
                totalDistance += dist;
                assignments.push({ riderId: riders[i].id, driverId: drivers[j].id, distance: dist });
            }
        }
    }

    return {
        matched: flow,
        total: R,
        matchRate: flow / R,
        totalDistance,
        assignments,
    };
}

const cellKey = (cx, cy) => `${cx},${cy}`;

// Build a reusable spatial index over the driver pool: drivers bucketed into a
// grid plus the cell geometry. The driver pool changes slowly, so we build this
// ONCE (at boot / on reload) and reuse it across many match requests instead of
// re-bucketing 10k drivers on every call — that re-bucketing under load is what
// blocks the event loop.
export function buildGridIndex(drivers, { cellSize, targetPerCell = 150 } = {}) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of drivers) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    const span = Math.max(maxX - minX, maxY - minY) || 1;
    if (!cellSize) {
        const gridDim = Math.max(1, Math.round(Math.sqrt(drivers.length / targetPerCell)));
        cellSize = span / gridDim;
    }

    const buckets = new Map();
    for (const d of drivers) {
        const cx = Math.floor((d.x - minX) / cellSize);
        const cy = Math.floor((d.y - minY) / cellSize);
        const kk = cellKey(cx, cy);
        if (!buckets.has(kk)) buckets.set(kk, []);
        buckets.get(kk).push(d);
    }

    return { buckets, cellSize, minX, minY };
}

// Grid-partitioned batch assignment against a prebuilt driver index.
//
// A single global min-cost max-flow over 10k riders is too slow (one augmenting
// path per match). But matches are local — a rider only wants a nearby driver —
// so we tile the map into cells and run MCMF independently per cell, letting
// each cell also pull drivers from its 8 neighbours (a 1-cell "halo") so riders
// near a border aren't cut off. Drivers are claimed once within a batch so none
// is matched twice. Total work is ~linear in riders, which gets 10k under 2s.
export function batchAssignWithIndex(riders, index, { k = 8 } = {}) {
    const R = riders.length;
    const { buckets, cellSize, minX, minY } = index;
    if (R === 0 || buckets.size === 0) {
        return { matched: 0, total: R, matchRate: 0, totalDistance: 0, assignments: [] };
    }

    const riderBuckets = new Map();
    for (const r of riders) {
        const cx = Math.floor((r.x - minX) / cellSize);
        const cy = Math.floor((r.y - minY) / cellSize);
        const kk = cellKey(cx, cy);
        if (!riderBuckets.has(kk)) riderBuckets.set(kk, { cx, cy, list: [] });
        riderBuckets.get(kk).list.push(r);
    }

    const taken = new Set();
    const assignments = [];
    let matched = 0;
    let totalDistance = 0;

    for (const { cx, cy, list } of riderBuckets.values()) {
        const candidates = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const arr = buckets.get(cellKey(cx + dx, cy + dy));
                if (arr) for (const d of arr) if (!taken.has(d.id)) candidates.push(d);
            }
        }
        if (candidates.length === 0) continue;

        const res = batchAssign(list, candidates, { k });
        for (const a of res.assignments) {
            taken.add(a.driverId);
            totalDistance += a.distance;
            assignments.push(a);
        }
        matched += res.matched;
    }

    return { matched, total: R, matchRate: matched / R, totalDistance, assignments };
}

// Convenience wrapper: build the index and match in one call (used by the
// standalone benchmark where the driver set is generated fresh).
export function batchAssignGrid(riders, drivers, opts = {}) {
    if (riders.length === 0 || drivers.length === 0) {
        return { matched: 0, total: riders.length, matchRate: 0, totalDistance: 0, assignments: [] };
    }
    const index = buildGridIndex(drivers, opts);
    return batchAssignWithIndex(riders, index, opts);
}
