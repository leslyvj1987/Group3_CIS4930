#include <SPI.h>
//#include <Ethernet.h>

byte mac[] = {0x90, 0xA2, 0x0D, 0x0E, 0x96 };
byte server[] = {10, 167, 125, 235 };
//EthernetClient client;

const char* _id = "6abfe91fd376605d02700b3b";
const int trigerPin[] = {2, 4};//, 6, 8, 10};
const int echoPin[] = {3, 5};//, 7, 9, 11};
const int length = 2;
const double speedOfSound = 0.0343;               /* (cm/us) centimeters by microseconds */
int maxDistance[] = {20, 20};//, 20, 20, 20};     /* Distance from the sensor to the floor in centimeters */
long travelTime;                                  /* Roundtrip time */
int distance;                                     /* Distance between the sensor and the target in centimeters */
int availability;                                 /* Parking availability */
int lastAvailability;                             /* Last parking availability recorded */
const int port = 3000;
const char* templatePostRequest = "{\"_id\":%s,\"availability\":%d}";


void setup() {
    Serial.begin (9600);
    // Start the Ethernet connection.
    /*if (Ethernet.begin(mac) == 0) {
      Serial.println("Failed to configure Ethernet using DHCP");
    }

    // Give time to the ethernet shield to initialize.
    delayMicroseconds(1000);
    Serial.println("Connectiong...");*/

    //connect();

    // Define pins' mode.
    for(int i = 0; i < length; i++) {
        pinMode(trigerPin[i], OUTPUT);
        pinMode(echoPin[i], INPUT);
    }
}

void loop() {
    // Checking for client connection.
    /*if(!client.connected()) {
      Serial.println("Disconnection!");
      connect();
      return;
    }*/

    availability = 0;
    for (int i = 0; i < length; i++) {
        // Clear the trigerPin.
        digitalWrite(trigerPin[i], LOW);
        delayMicroseconds(2);

        /* Get distance between sensor and object. */
        if(getData(i)) {
            int errorDistance = maxDistance[i] / 10;           /* Error distance because false true. */
            if(distance + errorDistance >= maxDistance[i]) {
                // Car present! Availability count plus 1.
                availability++;
            }
        }
    }

    if(availability != lastAvailability) {
      Serial.print("Actual Availability: "); Serial.println(availability);
        // Update database.
//        char result[(sizeof(templatePostRequest) + sizeof(_id)) / sizeof(char) + ((int) ceil(log10(availability)) + 2)];
//        sprintf(result, templatePostRequest, _id, availability);
//        Serial.println(result);
        
        // Update lastAvailability.
        lastAvailability = availability;
    }

    // Wait a second before checking again.
    delayMicroseconds(5000 - 12 * length);
}


bool getData(int i) {
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
      Serial.print("Sensor ");
      Serial.print(i);
      Serial.print(" is ");
      Serial.println("Out of range");
      return false;
    }

    return true;
}

/*void connect() {
    if(client.connect(server, port)) {
      Serial.println("Connected!");
    } else {
      Serial.println("Connection failed!");
    }
}*/

