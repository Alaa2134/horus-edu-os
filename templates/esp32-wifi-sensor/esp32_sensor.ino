/*
 * HORUS OS — ESP32 Wi-Fi sensor starter
 * Connects to Wi-Fi and serves live readings over HTTP at http://<esp-ip>/
 * Reads the internal hall sensor + an analog pin (swap for your sensor).
 *
 * Board:  esp32:esp32:esp32
 * Library: WiFi (bundled with the ESP32 core)
 */
#include <WiFi.h>
#include <WebServer.h>

const char* SSID     = "YOUR_WIFI";
const char* PASSWORD = "YOUR_PASS";
const int   SENSOR_PIN = 34;   // analog-capable GPIO

WebServer server(80);

String readJson() {
  int analog = analogRead(SENSOR_PIN);
  int hall   = hallRead();
  return String("{\"analog\":") + analog + ",\"hall\":" + hall +
         ",\"rssi\":" + WiFi.RSSI() + "}";
}

void handleRoot() { server.send(200, "application/json", readJson()); }

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.println("\nIP: " + WiFi.localIP().toString());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}
