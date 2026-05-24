/*
 * HORUS OS — Arduino Blink starter
 * Blinks the built-in LED. No wiring needed: works on UNO (D13) out of the box.
 * Upload:  arduino-cli compile --fqbn arduino:avr:uno .
 *          arduino-cli upload  --fqbn arduino:avr:uno -p /dev/ttyACM0 .
 */
const int LED = LED_BUILTIN;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(115200);
  Serial.println("HORUS blink started");
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
