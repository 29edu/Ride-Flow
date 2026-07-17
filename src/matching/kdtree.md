
# Problems with the K-D Tree

    1. Drive move but the tree is static. My tree is built only once. Tree doesn't update the reposition of the driver
    2. Updating many drivers require rebuilding. For 100, 1000 drivers it is fine but for thousand of drivers, it requires re building
    3. Creating a single tree creates one Huge KD- tree on one server and create scalable and reliable problem. If there are millions of drivers

        It become bottleneck. Too many request are going on a single tree. Thousands of request consume CPU, memory, bandwidth, latency. But the machine 
        has limitd capacity.

    4. Location Update

        When the location of many driver changes, thounds of driver location hit every few seconds, all update the same tree.

        The server must simultanously handle
        1. Driver location updates
        2. Rider nearest-driver searches
        3. Driver availiability Changes
        4. Driver goes offline 
        5. New Driver coming online
        6. Tree Rebuilding

        MY Current KD tree does not support dynamic updates, so I may have to rebuild the tree continously. This is going to be very expensive.

        7. Single Point of Failure. One server crashes -> No KD tree -> Matching stop worldwide
   
        8. Network Latency Increases: Supppose the one KD-tree server is located in the US. A rider in India sends Request. This network round trip may be much slower. Location service should be geographically distributed.


## Mental Model for Searching the nearest Driver

    1. It compares the distance with the root; if the distance is less than the best, it stores it.
    2. Going forward, it calculates the difference based on the current axis.
    3. When the difference comes out negative, it means I must go to the left side; if the difference comes out positive, I must go to the right side.
    4. At each stage, I calculate the distance and store it if it's better than the current best.
    5. At each node — not just at the end — I also check a condition: even if the difference was negative (so I went left first), going to the right side might still give a shorter distance — that's why I do this checking at every node, not just once at the last step.

# Design

    1. Uber doesn't use K-D tree for driver match making. Rather they use H3, a hexgonal  heirarchial spatial Index. 
    2. My plan is to change from K-D Tree to H3 based lookup (HashMap)
    3. 