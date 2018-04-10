#include <SPI.h>
#include <Ethernet.h>

byte mac[] = {0x90, 0xA2, 0x0D, 0x0E, 0x96, 0xC1 };
byte server[] = {192, 168, 0, 12};
byte arduinoIP[] = {192, 168, 0, 30};
//IPAddress arduinoIP(192, 168, 0, 30);

EthernetClient client;

const char* _id = "6abfe91fd376605d02700b3b";
const int trigerPin[] = {2, 4};//, 6, 8, 10};
const int echoPin[] = {3, 5};//, 7, 9, 11};
const int length = sizeof(trigerPin) / sizeof(int);
const double speedOfSound = 0.0343;               /* (cm/us) centimeters by microseconds */
int maxDistance[] = {20, 20};//, 20, 20, 20};     /* Distance from the sensor to the floor in centimeters */
long travelTime;                                  /* Roundtrip time */
int distance;                                     /* Distance between the sensor and the target in centimeters */
int availability;                                 /* Parking availability */
int lastAvailability = -1;                        /* Last parking availability recorded */
const int port = 8080;

const char* templatePostRequest = "{\"_id\":\"%s\",\"availability\":%d}";

void setup() {
    Serial.begin (9600);

     Ethernet.begin(mac, arduinoIP);

    /*if () {
      Serial.println("Failed to configure Ethernet using DHCP");
    }*/

    // Give time to the ethernet shield to initialize.
    delay(1);
    Serial.println(Ethernet.localIP());
    
    // Define pins' mode.
    for(int i = 0; i < length; i++) {
        pinMode(trigerPin[i], OUTPUT);
        pinMode(echoPin[i], INPUT);
    }
}

void loop() {
    availability = 0;
    for (int i = 0; i < length; i++) {
        // Clear the trigerPin.
        digitalWrite(trigerPin[i], LOW);
        delayMicroseconds(2);

        /* Get distance between sensor and object. */
        if(getData(i)) {
            int errorDistance = maxDistance[i] / 10;           /* Error distance because false true. */
            //Serial.print(i); Serial.print(": "); Serial.println(distance + errorDistance);
            if(distance + errorDistance >= maxDistance[i]) {
                // Car present! Availability count plus 1.
                availability++;
            }
        }
    }

    //Serial.println(availability);

    if(availability != lastAvailability) {
      Serial.print("Availability changed: "); Serial.print(lastAvailability); Serial.print(" -> "); Serial.println(availability);
      sendData();
      lastAvailability = availability;
    }

    // Wait 5 seconds before checking again.
    delay(5000);
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

void sendData() {

    char outBuffer[128];

    if (connect() == 1) {
      char json[strlen(templatePostRequest) + strlen(_id) + ((int) ceil(log10(availability))) + 1];
      sprintf(json, templatePostRequest, _id, availability);

      send("POST /update HTTP/1.1");
      sprintf(outBuffer, "Host: %d.%d.%d.%d:%d", server[0], server[1], server[2], server[3], port);
      send(outBuffer);
      send("Connection: close");
      send("Accept: */*");
      send("User-Agent: Mozilla/4.0 (compatible; esp8266 Lua; Windows NT 5.1)");
      send("Content-Type: application/json");
      sprintf(outBuffer, "Content-Length: %d", strlen(json));
      send(outBuffer);
      client.println();
      Serial.println();
      send(json);

      while(!client.available()) {} // Wait until we get a resonse back.
      while(client.available()) {
        Serial.print((char) client.read());
      }
      
      client.stop();
    }
}

void send(const String message) {
  send(message.c_str());
}

void send(const char* message) {
  client.println(message);
}

int connect() {

    
    Serial.println("Connecting...");

    Serial.print(server[0]); Serial.print("."); Serial.print(server[1]); Serial.print("."); Serial.print(server[2]); Serial.print("."); Serial.println(server[3]);
    Serial.println(port);

    int result = client.connect(server, port);
    
    if(result == 1) {
      Serial.println("Connected!");
    } else {
      Serial.print("Connection failed!"); Serial.print(result); Serial.println();
    }

    return result;
}

