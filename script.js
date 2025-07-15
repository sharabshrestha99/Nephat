let device, server, service, characteristic;
const serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb'; // example UUID (change as needed)
const characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb'; // change as needed

function log(msg) {
  document.getElementById('log').textContent += msg + '\n';
}

document.getElementById('connect').addEventListener('click', async () => {
  try {
    log("🔍 Requesting Bluetooth device...");
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUUID] }]
    });

    log(`✅ Device selected: ${device.name}`);
    server = await device.gatt.connect();
    log("🔗 Connected to GATT server");

    service = await server.getPrimaryService(serviceUUID);
    characteristic = await service.getCharacteristic(characteristicUUID);
    log("📡 Connected to characteristic");

    // Optional: Listen for incoming messages
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const decoder = new TextDecoder('utf-8');
      const received = decoder.decode(event.target.value);
      log("📥 Received: " + received);
    });

  } catch (error) {
    log("❌ Error: " + error);
  }
});

document.getElementById('send').addEventListener('click', async () => {
  const message = document.getElementById('message').value;
  if (!characteristic || !message) {
    log("⚠️ Not connected or empty message");
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  await characteristic.writeValue(data);
  log("📤 Sent: " + message);
});
