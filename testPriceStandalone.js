// test script
const VehicleType = { BODA: 'boda', TUKTUK: 'tuktuk', LORRY: 'lorry' };
const ServiceType = { EXPRESS: 'express', STANDARD: 'standard', ECONOMY: 'economy' };

const calculatePrice = async (details) => {
    const {
      distance = 0,
      durationSeconds = 0, // Duration from Google Maps API (in seconds)
      vehicleType = VehicleType.BODA,
      serviceType = ServiceType.EXPRESS,
      stopCount = 0
    } = details;

    // distance is in meters from API, convert to km
    const distanceKm = distance / 1000;

    // ECONOMY Service Logic
    // Highly discounted rates for inter-county or next-day grouped delivery
    if (serviceType === ServiceType.ECONOMY) {
      const economyBases = {
        [VehicleType.BODA]: 150,
        [VehicleType.TUKTUK]: 200,
        [VehicleType.LORRY]: 300, 
      };
      // Base fee + 0.5 KES per km for economy shipping
      const baseEco = economyBases[vehicleType] || 200;
      let ecoTotal = baseEco + (distanceKm * 0.5);
      
      // Safety minimums for economy
      const ecoMin = 200;
      if (ecoTotal < ecoMin) ecoTotal = ecoMin;
      
      // Round to nearest 50
      return Math.ceil(ecoTotal / 50) * 50;
    }

    // Base rates in KES (Includes the first 2km free)
    const baseRates = {
      [VehicleType.BODA]: 180, // 180 base
      [VehicleType.TUKTUK]: 300,
      [VehicleType.LORRY]: 4000
    };

    // Per Stop Surcharge (Handling fee)
    const stopSurcharges = {
      [VehicleType.BODA]: 50,
      [VehicleType.TUKTUK]: 80,
      [VehicleType.LORRY]: 1000
    };

    // Per KM rates in KES (Applied after the first 2 base km)
    const perKmRates = {
      [VehicleType.BODA]: 20,
      [VehicleType.TUKTUK]: 30,
      [VehicleType.LORRY]: 150
    };

    // Time-based pricing (Traffic factor) per minute
    const perMinuteRates = {
      [VehicleType.BODA]: 4, // 4 KES per minute in traffic
      [VehicleType.TUKTUK]: 8,
      [VehicleType.LORRY]: 30
    };

    // Service Multipliers (Economy handled separately above)
    const serviceMultipliers = {
      [ServiceType.EXPRESS]: 1.0,
      [ServiceType.STANDARD]: 0.8
    };

    const base = baseRates[vehicleType] || 180;
    const perKm = perKmRates[vehicleType] || 20;
    const perMinute = perMinuteRates[vehicleType] || 4;
    const stopFee = stopSurcharges[vehicleType] || 50;
    const multiplier = serviceMultipliers[serviceType] || 1.0;

    // Duration is in seconds, convert to minutes
    // If API failed to return duration (0), we guess 35km/h
    const durationMinutes = durationSeconds > 0
      ? durationSeconds / 60
      : (distanceKm / 35) * 60;

    // Additional stops surcharge (excluding the first dropoff)
    const extraStopFee = Math.max(0, stopCount - 1) * stopFee;

    // Intercity Surcharge
    const intercitySurcharge = distanceKm > 100 ? (base * 0.5) : 0;

    // Calculate Billable Distance (First 2 KM are free/covered in base rate)
    const billableDistanceKm = Math.max(0, distanceKm - 2);

    let total = (base + (billableDistanceKm * perKm) + (durationMinutes * perMinute) + extraStopFee + intercitySurcharge) * multiplier;

    // Safety minimums
    const minimums = {
      [VehicleType.BODA]: 150,
      [VehicleType.TUKTUK]: 300,
      [VehicleType.LORRY]: 5000,
    };

    const min = (minimums[vehicleType] || 150);
    if (total < min) total = min;

    // Round to nearest 50 for a professional "quoted" feel
    return Math.ceil(total / 50) * 50;
};

async function test() {
  console.log("Boda 5km (12 min, Express):", await calculatePrice({
    distance: 5000, durationSeconds: 12 * 60, vehicleType: VehicleType.BODA, serviceType: ServiceType.EXPRESS
  }));
  console.log("Boda 7.5km (20 min traffic, Express):", await calculatePrice({
    distance: 7500, durationSeconds: 20 * 60, vehicleType: VehicleType.BODA, serviceType: ServiceType.EXPRESS
  }));
  console.log("Boda 7.5km (10 min no traffic, Express):", await calculatePrice({
    distance: 7500, durationSeconds: 10 * 60, vehicleType: VehicleType.BODA, serviceType: ServiceType.EXPRESS
  }));
  console.log("Economy Lorry 500km:", await calculatePrice({
    distance: 500000, durationSeconds: 10 * 60 * 60, vehicleType: VehicleType.LORRY, serviceType: ServiceType.ECONOMY
  }));
}
test();
