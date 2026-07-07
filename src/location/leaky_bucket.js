// Leaky-bucket rate limiter, per driver, backed by Redis.
//
// Each driver gets a bucket that "leaks" at `leakRate` requests/second. Every
// incoming location update tries to add a drop; if that would overflow the
// bucket's capacity the update is dropped. This caps each driver at ~leakRate
// sustained updates/sec while still absorbing short bursts up to `capacity`.
//
// The whole check runs as a single Redis Lua script: it's atomic (no race
// between reading and writing the level) and it's one round-trip instead of
// four, which is what keeps the location hot path fast under load.

import { client } from '../config/redis.js';

const LEAKY_BUCKET_LUA = `
local key      = KEYS[1]
local now      = tonumber(ARGV[1])
local leakRate = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local cost     = tonumber(ARGV[4])
local ttl      = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'level', 'lastChecked')
local level = tonumber(data[1]) or 0
local last  = tonumber(data[2]) or now

local elapsed = (now - last) / 1000.0
level = math.max(0, level - elapsed * leakRate)

local dropped = 0
if level + cost > capacity then
  dropped = 1
else
  level = level + cost
end

redis.call('HSET', key, 'level', level, 'lastChecked', now)
redis.call('PEXPIRE', key, ttl)
return dropped
`;

// register as a custom command once (uses EVALSHA under the hood)
if (!client.leakyBucket) {
    client.defineCommand('leakyBucket', { numberOfKeys: 1, lua: LEAKY_BUCKET_LUA });
}

export async function isRequestDropped(
    driverId,
    cost = 1,
    leakRate = 100, // drops drained per second
    capacity = 100, // max drops the bucket can hold (burst allowance)
) {
    const dropped = await client.leakyBucket(
        `bucket:${driverId}`,
        Date.now(),
        leakRate,
        capacity,
        cost,
        60000, // ttl ms — quiet drivers' buckets expire
    );
    return dropped === 1;
}

// local data = redis.call('HMGET', key, 'level', 'lastChecked') This code returns about the driver, 
// If the driver is new, data is null and level is 0 and last is now. 