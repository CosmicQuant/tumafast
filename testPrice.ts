import { orderService } from './services/orderService';
import { VehicleType, ServiceType } from './types';

async function test() {
  // Test Boda 5km
  const boda5 = await orderService.calculatePrice({
    distance: 5000,
    durationSeconds: 12 * 60,
    vehicleType: VehicleType.BODA,
    serviceType: ServiceType.EXPRESS,
    stopCount: 2
  });
  console.log("Boda 5km (12 min, Express):", boda5);

  // Test Boda 7.5km (heavy traffic)
  const boda7_5_traffic = await orderService.calculatePrice({
    distance: 7500,
    durationSeconds: 20 * 60,
    vehicleType: VehicleType.BODA,
    serviceType: ServiceType.EXPRESS,
    stopCount: 2
  });
  console.log("Boda 7.5km (20 min, Express):", boda7_5_traffic);

  // Test Boda 7.5km (no traffic)
  const boda7_5_notraffic = await orderService.calculatePrice({
    distance: 7500,
    durationSeconds: 10 * 60,
    vehicleType: VehicleType.BODA,
    serviceType: ServiceType.EXPRESS,
    stopCount: 2
  });
  console.log("Boda 7.5km (10 min, Express):", boda7_5_notraffic);

  // Test Lorry Economy (Mombasa to Nairobi, ~500km)
  const economyLorry = await orderService.calculatePrice({
    distance: 500000,
    durationSeconds: 10 * 60 * 60,
    vehicleType: VehicleType.LORRY,
    serviceType: ServiceType.ECONOMY,
    stopCount: 2
  });
  console.log("Economy Lorry 500km:", economyLorry);

  // Test standard ETA
  const etaStd = orderService.estimateDeliveryTime(10000, ServiceType.STANDARD, undefined, 30 * 60);
  console.log("Standard ETA (+4hrs):", etaStd);

  // Test economy ETA
  const etaEco = orderService.estimateDeliveryTime(500000, ServiceType.ECONOMY, undefined, 10 * 60 * 60);
  console.log("Economy ETA (Next Day):", etaEco);
}

test().catch(console.error);
