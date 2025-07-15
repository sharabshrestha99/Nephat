let device, server, service, characteristic;
const serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb'; // BLE service UUID
const characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb'; // BLE characteristic UUID
const encoder = new TextEncoder();

function log(msg) {
  document.getElementById('log').insertAdjacentText('beforeend', msg + '\n');
}

document.getElementById('connect').addEventListener('click', async () => {
  try {
    log("🔍 Requesting Bluetooth device...");
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUUID] }]    });

    log(`✅ Device selected: ${device.name}`);
    server = await device.gatt.connect();
    log("🔗 Connected to GATT server");

    service = await server.getPrimaryService(serviceUUID);
    characteristic = await service.getCharacteristic(characteristicUUID);
    log("📡 Connected to characteristic");

    // Listen for incoming messages
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

    function handleCharacteristicValueChanged(event) {
      const decoder = new TextDecoder('utf-8');
      const received = decoder.decode(event.target.value);
      log("📥 Received: " + received);
    }

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

  const data = encoder.encode(message);

  try {
    if (typeof characteristic.writeValueWithResponse === 'function') {
      await characteristic.writeValueWithResponse(data);
    } else if (typeof characteristic.writeValue === 'function') {
      await characteristic.writeValue(data);
    } else {
      log("❌ Error: No supported write method found on characteristic.");
      return;
    }

    log("📤 Sent: " + message);
  } catch (error) {
    log("❌ Write failed: " + error);
  }
});
