
# K Tree ( k dimension Tree)

    Concept:- Suppose there are many riders from my location. Maybe more then 100, or 1000 or 10000. I don't know. I have to find the rider with the
    minimum distance so if i use brute force and calculate the distance from the passenger to the riders, its going to take a lot of 
    time and totally inefficent.

    To solve this issue, we will use K tree data structure. 

    What it does ? 
    
    1. To locate the rider location, we are going to use the x-axis and y-axis. 
    2. Suppose passenger location is (x, y) then we are going to form a tree with the root asa (x, y).
    3. First we are going to sort the list of positions of riders based on x-axis and will split into two parts.
    4. first part goes to the left side and second part goes to the right side. 
    5. Now we will split based on Y Axis.
    6. Sort the rest of the remaining list based on the y axis and then select the median. It will act as root.
    7. Do the partition, into left and right. Lower values goes to the left side and higher value goes to the right side.
    8. This process will continue