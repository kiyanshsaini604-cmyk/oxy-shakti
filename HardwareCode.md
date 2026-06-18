#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

#define MQ2_PIN 34
#define LED_PIN 2
#define BUZZER_PIN 15

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  dht.begin();

  Serial.println("Oxy Shakti Node Started");
}

void loop() {

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  int gasValue = analogRead(MQ2_PIN);

  bool danger = false;

  if (gasValue > 1800 || temperature > 45) {
    danger = true;
  }

  if (danger) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000);
  } else {
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }

  Serial.println("{");
  Serial.print("  \"node\": \"NODE-01\",");
  Serial.println();

  Serial.print("  \"temperature\": ");
  Serial.print(temperature);
  Serial.println(",");

  Serial.print("  \"humidity\": ");
  Serial.print(humidity);
  Serial.println(",");

  Serial.print("  \"gas\": ");
  Serial.print(gasValue);
  Serial.println(",");

  Serial.print("  \"status\": \"");
  Serial.print(danger ? "CRITICAL" : "SAFE");
  Serial.println("\"");

  Serial.println("}");
  Serial.println();

  delay(2000);
}
