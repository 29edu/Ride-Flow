// Min-Cost Max-Flow using SPFA (queue-based Bellman-Ford) to find the
// shortest (cheapest) augmenting path on each iteration.
//
// We use SPFA rather than Dijkstra-with-potentials because the residual graph
// contains negative-cost back edges; SPFA handles those directly as long as
// there are no negative cycles (there are none here — forward costs are all
// non-negative distances).

export class MinCostMaxFlow {
    constructor(n) {
        this.n = n;
        this.graph = Array.from({ length: n }, () => []);
    }

    // Directed edge u->v with the given capacity and per-unit cost.
    // A residual (reverse) edge with 0 capacity and negated cost is added too.
    addEdge(u, v, cap, cost) {
        this.graph[u].push({ to: v, cap, cost, flow: 0, rev: this.graph[v].length });
        this.graph[v].push({ to: u, cap: 0, cost: -cost, flow: 0, rev: this.graph[u].length - 1 });
    }

    // Returns { flow, cost } for max flow at minimum cost from s to t.
    solve(s, t) {
        let totalFlow = 0;
        let totalCost = 0;

        for (;;) {
            const dist = new Array(this.n).fill(Infinity);
            const inQueue = new Array(this.n).fill(false);
            const prevV = new Array(this.n).fill(-1);
            const prevE = new Array(this.n).fill(-1);

            dist[s] = 0;
            const queue = [s];
            inQueue[s] = true;

            while (queue.length) {
                const u = queue.shift();
                inQueue[u] = false;
                const edges = this.graph[u];
                for (let i = 0; i < edges.length; i++) {
                    const e = edges[i];
                    if (e.cap - e.flow > 0 && dist[u] + e.cost < dist[e.to]) {
                        dist[e.to] = dist[u] + e.cost;
                        prevV[e.to] = u;
                        prevE[e.to] = i;
                        if (!inQueue[e.to]) {
                            queue.push(e.to);
                            inQueue[e.to] = true;
                        }
                    }
                }
            }

            if (dist[t] === Infinity) break; // no more augmenting paths

            // bottleneck along the path
            let push = Infinity;
            for (let v = t; v !== s; v = prevV[v]) {
                const e = this.graph[prevV[v]][prevE[v]];
                push = Math.min(push, e.cap - e.flow);
            }
            // apply the flow
            for (let v = t; v !== s; v = prevV[v]) {
                const e = this.graph[prevV[v]][prevE[v]];
                e.flow += push;
                this.graph[v][e.rev].flow -= push;
            }

            totalFlow += push;
            totalCost += push * dist[t];
        }

        return { flow: totalFlow, cost: totalCost };
    }
}
