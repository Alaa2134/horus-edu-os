import { X, Cpu, Zap, Code2 } from "lucide-react";

const WIRING = [
  { part: "IR Sensor VCC", pin: "ESP32 3.3V", color: "text-ok" },
  { part: "IR Sensor GND", pin: "ESP32 GND", color: "text-slate-300" },
  { part: "IR Sensor OUT", pin: "ESP32 GPIO 27", color: "text-ai" },
  { part: "LED + (via 220Ω)", pin: "ESP32 GPIO 2", color: "text-critical" },
  { part: "LED −", pin: "ESP32 GND", color: "text-slate-300" },
  { part: "Buzzer +", pin: "ESP32 GPIO 26", color: "text-danger" },
  { part: "Buzzer −", pin: "ESP32 GND", color: "text-slate-300" },
];

const ARDUINO_CODE = `// Horus Rescue AI — ESP32 Smart Checkpoint
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";
const char* API_URL   = "https://your-server/api/ir-alert";
const char* DEVICE_ID = "ESP-CHECKPOINT-01";
const char* LOCATION  = "AI Faculty Gate";

const int IR_PIN     = 27;   // IR sensor OUT
const int LED_PIN    = 2;    // status / alarm LED
const int BUZZER_PIN = 26;   // alarm buzzer

bool lastState = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.println("\\nWiFi connected");
}

void sendIrAlert() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  String body = String("{") +
    "\\"deviceId\\":\\"" + DEVICE_ID + "\\"," +
    "\\"location\\":\\"" + LOCATION + "\\"," +
    "\\"eventType\\":\\"IR_CROSSING\\"," +
    "\\"message\\":\\"Movement detected by IR checkpoint\\"}";
  int code = http.POST(body);
  Serial.printf("POST /api/ir-alert -> %d\\n", code);
  http.end();
}

void fireAlarm() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(150);
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(120);
  }
}

void loop() {
  bool state = digitalRead(IR_PIN);
  if (state == LOW && lastState == HIGH) {   // crossing detected
    Serial.println("IR crossing!");
    fireAlarm();
    sendIrAlert();
    delay(800);  // debounce
  }
  lastState = state;
}`;

export function Esp32Modal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-strong max-h-[88vh] w-full max-w-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-bg-900/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-ai" />
            <h2 className="text-lg font-bold text-white">ESP32 Smart Checkpoint Setup</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ai">
              <Zap className="h-4 w-4" /> Wiring
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <tbody>
                  {WIRING.map((w, i) => (
                    <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                      <td className={`px-4 py-2.5 font-semibold ${w.color}`}>{w.part}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">→ {w.pin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ai">
              <Code2 className="h-4 w-4" /> Arduino Firmware
            </h3>
            <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-bg-900/80 p-4 font-mono text-xs leading-relaxed text-slate-300">
              <code>{ARDUINO_CODE}</code>
            </pre>
            <p className="mt-2 text-xs text-slate-500">
              On crossing, the device fires its buzzer/LED and POSTs to{" "}
              <span className="font-mono text-ai">/api/ir-alert</span>. The fusion
              engine escalates to Critical when a linked camera already sees a person.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
