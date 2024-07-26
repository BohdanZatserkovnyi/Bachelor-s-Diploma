#include <ESP8266WiFi.h>
#include <Wire.h>
#include <GyverHTU21D.h>

GyverHTU21D htu_21_sensor;

const char* NETWORK_NAME = "_BeautyPixie";
const char* NETWORK_PASSWORD = "80689228646SoLyA";
const char* SERVER_ADDRESS = "192.168.0.105";

const int PHOTORESISTOR_PIN = A0;

WiFiClient client;

void setup() {
  Serial.begin(9600);
  WiFi.begin(NETWORK_NAME, NETWORK_PASSWORD);
  Serial.print("Connecting to ");
  Serial.println(NETWORK_NAME);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Wi-Fi connected");
  if (!htu_21_sensor.begin()) Serial.println(F("HTU21D error"));
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    int lighting_photoresistor_value = analogRead(PHOTORESISTOR_PIN);
    float temperature_htu_21_sensor_value = htu_21_sensor.getTemperatureWait();
    float humidity_htu_21_sensor_value = htu_21_sensor.getHumidityWait();

    if (client.connect(SERVER_ADDRESS, 8080)) {
      String data = "{\"light\":" + String(lighting_photoresistor_value) + ",\"temperature\":" + String(temperature_htu_21_sensor_value) + ",\"humidity\":" + String(humidity_htu_21_sensor_value) + "}";
      client.print("POST /data HTTP/1.1\r\n");
      client.print("Host: ");
      client.print(SERVER_ADDRESS);
      client.print("\r\n");
      client.print("Content-Type: application/json\r\n");
      client.print("Content-Length: ");
      client.print(data.length());
      client.print("\r\n\r\n");
      client.print(data);
      Serial.println("Data sent to server");
    } else {
      Serial.println("Connection to server failed");
    }
    client.stop();
  }
  delay(60000);
}
