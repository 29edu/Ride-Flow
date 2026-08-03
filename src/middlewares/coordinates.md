
# Problem

    1. How I am going to validate Whether the Incoming coordinates are from valid area or not like it should not be from areas where uber doesn't provide service and it should not be from area like forest or restricted Area or Mountains etc

    Different Parts of Coordinates Validation

    1. It verifies whether the coordinates belong to earth or not mathematically. 
    2. Android’s accuracy value represents an estimated horizontal accuracy radius in metres. It also provides an elapsed-time value that can be used to determine the age and ordering of location readings.

    Eg:- latitude: 28.6139
         longitude: 77.2090
         accuracy: 10 metres

    Accuracy = 10 metres means the real device location is probably somewhere within a 10-m radius around the coordinate , not necessarily exact at the center

    5-15 m -> Usually good GPS
    50-100 m -> Approximate Location
    500 m+ -> Unreliable for driver matching

    Accuracy can worsen inside building, tunnels, undergound parking, or areas surrounded by tall building

    3. Is the movement Physically believable?
     The server compares the new coordinate with the driver's previous accepted coordinate. Both coordinates should be mathematically valid.

     Eg:- 10:00 Am :- Driver in Delhi
     Eg:- 10:01 AM :- Driver in Mumbai

     Both coordinates are valid but logically it is impossible to move from Delhi to Mumbai within 1  minute. The Update would be marked as suspicious, rejected or marked as fruad Investigation

    4. It also checks

          New Sequence Number > Previous Sequence Number
          New timestamp > previous timestamp
          Movement is consistent with speed and bearing
          Location Doesn't repeat repeatedly
          Location doesn't teleport


          By doing this , It protects from 

               GPS jumps
               delayed network messages
               duplicated events
               messages arriving out of order
               basic location spoofing
               corrupted data

    Time Stamp Verification:-

    A timestamp tells the server when the phone measured the location, not when the server received it.

     5. Time Stamp Verification 

          1. Upcoming time should not be greater than server time.
          2. Location shouldn't change unrealistically from one location to another in short period of time
          3. Track the Speed of the User, In case if the user is in train 

     I need to track the proper location because suppose the location comes late due to network delay and Server can replace the latest location to
     the old location. Thus, driver is going back. So I need to prevent this.


     Challange in Calculating the distance between two points

     1. If I calcualte normally using shortest distance without caring about the actual distance then I can use Haversine Formula for a straight line.

     2. But I don't want to calculate the straight line distance because in reality, its impossible to calculate the distance on straight line. The roads are not always straight line. Calculated distance is coming 2 km but actual distanc is 5km because of terrain or road or anything else.

     Solution:-

     