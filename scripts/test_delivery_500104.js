const path = require('path');
const { computeDeliveryFee, findNearestLaundryHub } = require('../dist/lib/delivery');

console.log('=== TESTING DELIVERY CALCULATION BASED ON LAUNDRY HUBS ===\n');

// 1. Check nearest hub for Siri Sampada Arcade 1 (Khajaguda, Hyderabad - 500104)
const lat500104 = 17.4200;
const lng500104 = 78.3680;
const pin500104 = '500104';

const hub = findNearestLaundryHub(lat500104, lng500104, pin500104);
console.log('Location: Siri Sampada Arcade 1, Khajaguda (500104)');
console.log('Nearest Hub ID:', hub.id);
console.log('Nearest Hub Name:', hub.name);
console.log('Hub Address:', hub.address);
console.log('Hub Latitude/Longitude:', hub.latitude, hub.longitude);
console.log('Hub Base Fare:', '₹' + hub.baseDeliveryFare, 'for', hub.baseDistanceKm + 'km, then ₹' + hub.perKmFare + '/km');
console.log('Hub Free Delivery Above:', '₹' + hub.freeDeliveryAbove);

// 2. Compute delivery for Order < ₹499 (e.g. ₹300)
const calcUnder499 = computeDeliveryFee({
  customerLat: lat500104,
  customerLng: lng500104,
  customerPincode: pin500104,
  subtotal: 300,
  settings: {},
});

console.log('\n--- Order Below Free Delivery (Subtotal: ₹300) ---');
console.log('Delivery Distance:', calcUnder499.distanceKm, 'km');
console.log('Calculated Delivery Fee: ₹' + calcUnder499.deliveryFee);
console.log('Is Free Delivery?:', calcUnder499.isFreeDelivery);
console.log('Breakdown:', calcUnder499.breakdown);
console.log('Assigned Store / Hub:', calcUnder499.storeName);

// 3. Compute delivery for Order >= ₹499 (e.g. ₹550)
const calcOver499 = computeDeliveryFee({
  customerLat: lat500104,
  customerLng: lng500104,
  customerPincode: pin500104,
  subtotal: 550,
  settings: {},
});

console.log('\n--- Order Above Free Delivery (Subtotal: ₹550) ---');
console.log('Delivery Distance:', calcOver499.distanceKm, 'km');
console.log('Calculated Delivery Fee: ₹' + calcOver499.deliveryFee);
console.log('Is Free Delivery?:', calcOver499.isFreeDelivery);
console.log('Breakdown:', calcOver499.breakdown);

// 4. Verify other cities (e.g. Rajahmundry 533101)
const rjyHub = findNearestLaundryHub(16.9891, 81.784, '533101');
console.log('\n--- Rajahmundry Pincode 533101 ---');
console.log('Assigned Hub:', rjyHub.id, '-', rjyHub.name);

console.log('\n✅ All hub delivery calculation tests completed successfully.');
