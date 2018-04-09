const int trigerPin[] = {2};//, 4, 6, 8, 10};
const int echoPin[] = {3};//, 5, 7, 9, 11};
const int length = 1;
const double speedOfSound = 0.034;                /* (cm/us) centimeters by microseconds */
int maxDistance[] = {20};//, 20, 20, 20, 20};         /* Distance from the sensor to the floor in centimeters */
long travelTime;                                  /* Roundtrip time */
int distance;                                     /* Distance between the sensor and the target in centimeters */
int availability;                                 /* Parking availability */
int lastAvailability;                             /* Last parking availability recorded */


void setup() {
    // put your setup code here, to run once:
    Serial.begin (9600);
    for(int i = 0; i < length; i++) {
        pinMode(trigerPin[i], OUTPUT);
        pinMode(echoPin[i], INPUT);
    }
}

void loop() {
    // put your main code here, to run repeatedly:

    for (int i = 0; i < length; i++) {
        availability = length;
        // Clear the trigerPin.
        digitalWrite(trigerPin[i], LOW);
        delayMicroseconds(2);

        // Generate ultra sound wave.
        digitalWrite(trigerPin[i], HIGH);
        delayMicroseconds(10);
        digitalWrite(trigerPin[i], LOW);

        // Read traveled time.
        /** 
         * pulseIn(): function wait for the pin to go HIGH 
         * caused by the bounced sound wave, and it will start timing.
         * Then, it will wait for the pin to go LOW when the sound
         * wave will end, and it will stop the timing.
         * 
         * return: the length of the pulse in microseconds.
         */
        travelTime = pulseIn(echoPin[i], HIGH);

        /* 
         *  Travel time =  (travel distance) / (speed of sound)  
         *  Then,  travel distance = (travel time) * (speed of sound)
         *  Then, distance = (travel distance) / 2
         */
        long travelDistance = (long) (travelTime * speedOfSound);
        distance = travelDistance / 2;

        if (distance <= 0 || distance >= 500) {
          Serial.println("Out of range");
        }

        int errorDistance = maxDistance[i] / 10;  /* Error distance because false true */
        if(distance + errorDistance < maxDistance[i]) {
            // Car present! Availability count plus 1.
            availability--;
        }
    }



    if(availability != lastAvailability) {
        // Update database.
        Serial.println(availability);
        // Update lastAvailability.
        lastAvailability = availability;
    }

    // Wait a second before checking again.
    delayMicroseconds(1000 - 12 * length);
}
