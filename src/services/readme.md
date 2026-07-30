
# Information

    1. To store boolean values like true and false, I will store "0" and "1" in the Redis.
    2. Date.now() return in number of milliseconds elapsed since january 1, 1970
    3. client.hGet(key, property) -> return single value
    4. client.hGetAll(key) -> return all the properties with value

    5. const sessionId = await client.hGetAll(`activeSessionId:${currentSessionId}`);   -> Returns empty Object in javascript
    So I need to check the length of the Object whether its Zero or not to check whether a key exist in the redis or not.