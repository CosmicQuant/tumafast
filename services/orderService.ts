import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DeliveryOrder, DriverMetrics, Driver, PricingDetails, Review } from '../types';
import { VehicleType, ServiceType } from '../types';

const ORDERS_COLLECTION = 'orders';

export const orderService = {

  /**
   * Fetch all orders belonging to a specific user.
   */
  getUserOrders: async (userId: string): Promise<DeliveryOrder[]> => {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        // Ensure the Firestore document ID is the 'id' in our object, 
        // even if the data itself contains an 'id' field for legacy reasons.
        return { ...data, id: doc.id } as DeliveryOrder;
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  /**
   * Fetch orders for the Driver Marketplace (Pending Status).
   */
  getMarketplaceOrders: async (): Promise<DeliveryOrder[]> => {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('status', '==', 'pending')
        // orderBy('date', 'desc') // Removed to avoid needing a specific composite index for now
      );

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as DeliveryOrder));

      // Sort in memory by date desc
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching marketplace orders:", error);
      throw error;
    }
  },

  /**
   * Fetch active jobs for a specific driver.
   */
  getDriverJobs: async (driverId: string): Promise<DeliveryOrder[]> => {
    try {
      // Note: Firestore requires an index for this compound query (driver.id + status)
      // If index is missing, it might fail. Alternatively, filter in client.
      // For simplicity, let's fetch by driver.id and filter status in client if needed, 
      // or assume index exists.
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('driver.id', '==', driverId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allJobs = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as DeliveryOrder));

      // Filter out delivered jobs to show only active ones
      return allJobs.filter(job => job.status !== 'delivered');
    } catch (error) {
      console.error("Error fetching driver jobs:", error);
      throw error;
    }
  },

  /**
   * Get Driver Dashboard Metrics
   */
  getDriverMetrics: async (driverId: string): Promise<DriverMetrics> => {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('driver.id', '==', driverId)
      );

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as DeliveryOrder));

      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const earningsToday = deliveredOrders
        .filter(o => new Date(o.date) >= today)
        .reduce((sum, o) => sum + (o.price || 0), 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const earningsWeek = deliveredOrders
        .filter(o => new Date(o.date) >= weekAgo)
        .reduce((sum, o) => sum + (o.price || 0), 0);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const earningsMonth = deliveredOrders
        .filter(o => new Date(o.date) >= monthAgo)
        .reduce((sum, o) => sum + (o.price || 0), 0);

      // For now, balance is just total earnings (in a real app, this would be minus withdrawals)
      const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      const ratings = deliveredOrders
        .filter(o => o.reviewForDriver)
        .map(o => o.reviewForDriver!.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 5.0;

      const recentReviews = deliveredOrders
        .filter(o => o.reviewForDriver)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          rating: o.reviewForDriver!.rating,
          comment: o.reviewForDriver!.comment,
          date: o.reviewForDriver!.date,
          customerName: o.sender.name
        }));

      return {
        earnings: {
          today: earningsToday,
          week: earningsWeek,
          month: earningsMonth,
          balance: totalEarnings
        },
        performance: {
          tripsCompleted: deliveredOrders.length,
          acceptanceRate: 100, // Placeholder
          rating: Math.round(avgRating * 10) / 10,
          hoursOnline: 0, // Placeholder
          totalDistanceKm: 0 // Placeholder
        },
        recentReviews,
        weeklyChart: [
          { day: 'Mon', value: 0, amount: 'KES 0' },
          { day: 'Tue', value: 0, amount: 'KES 0' },
          { day: 'Wed', value: 0, amount: 'KES 0' },
          { day: 'Thu', value: 0, amount: 'KES 0' },
          { day: 'Fri', value: 0, amount: 'KES 0' },
          { day: 'Sat', value: 0, amount: 'KES 0' },
          { day: 'Sun', value: 0, amount: 'KES 0' },
        ],
        recentTransactions: deliveredOrders.slice(0, 5).map(o => ({
          id: o.id,
          amount: o.price,
          date: new Date(o.date).toLocaleDateString(),
          type: 'trip'
        }))
      };
    } catch (error) {
      console.error("Error fetching driver metrics:", error);
      return {
        earnings: { today: 0, week: 0, month: 0, balance: 0 },
        performance: { tripsCompleted: 0, acceptanceRate: 0, rating: 0, hoursOnline: 0, totalDistanceKm: 0 },
        weeklyChart: [],
        recentTransactions: []
      };
    }
  },

  /**
   * Get Business Dashboard Metrics
   */
  getBusinessMetrics: async (businessId: string) => {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', businessId)
      );

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id } as DeliveryOrder));

      const deliveredCount = orders.filter(o => o.status === 'delivered').length;
      const activeCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
      const totalSpend = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.price || 0), 0);

      const successRate = orders.length > 0 ? (deliveredCount / orders.length) * 100 : 0;

      const recentReviews = orders
        .filter(o => o.reviewForDriver)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          rating: o.reviewForDriver!.rating,
          comment: o.reviewForDriver!.comment,
          date: o.reviewForDriver!.date,
          driverName: o.driver?.name || 'Driver'
        }));

      return {
        spend: totalSpend,
        deliveries: deliveredCount,
        successRate: Math.round(successRate * 10) / 10,
        activeOrders: activeCount,
        recentReviews
      };
    } catch (error) {
      console.error("Error fetching business metrics:", error);
      return { spend: 0, deliveries: 0, successRate: 0, activeOrders: 0, recentReviews: [] };
    }
  },

  /**
   * Get a single order by ID.
   */
  getOrder: async (orderId: string): Promise<DeliveryOrder | undefined> => {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DeliveryOrder;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (order: Omit<DeliveryOrder, 'id'>): Promise<DeliveryOrder> => {
    try {
      // Use provided verification code or generate a new one
      const verificationCode = (order as any).verificationCode || Math.floor(1000 + Math.random() * 9000).toString();

      // Clean undefined values for Firestore
      const now = new Date().toISOString();
      const cleanOrder = JSON.parse(JSON.stringify({
        ...order,
        date: now,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        verificationCode: verificationCode
      }));

      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), cleanOrder);
      return { ...order, id: docRef.id, verificationCode } as DeliveryOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Update an order
   */
  updateOrder: async (orderId: string, updates: Partial<DeliveryOrder>): Promise<void> => {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  /**
   * Atomic Job Acceptance
   * Uses a transaction to ensure no two drivers accept the same job.
   */
  acceptOrder: async (orderId: string, driver: Driver): Promise<void> => {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    try {
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order does not exist");
        }

        const orderData = orderDoc.data();
        if (orderData.status !== 'pending') {
          throw new Error("Job has already been taken or is no longer available");
        }

        transaction.update(orderRef, {
          status: 'driver_assigned',
          driver: driver,
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error("Error accepting job:", error);
      throw error;
    }
  },

  /**
   * Update Order Status (Wrapper for updateOrder)
   */
  updateOrderStatus: async (orderId: string, status: DeliveryOrder['status'], extraData?: Partial<DeliveryOrder>): Promise<void> => {
    const updates: Partial<DeliveryOrder> = { status, ...extraData };
    await orderService.updateOrder(orderId, updates);
  },

  updateDriverLocation: async (orderId: string, location: { lat: number, lng: number, bearing: number }, remainingDistance?: number, remainingDuration?: number, routeGeometry?: string) => {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const updates: any = { driverLocation: location };
      if (remainingDistance !== undefined) updates.remainingDistance = remainingDistance;
      if (remainingDuration !== undefined) updates.remainingDuration = remainingDuration;
      if (routeGeometry !== undefined) updates.routeGeometry = routeGeometry;
      await updateDoc(orderRef, updates);
    } catch (error) {
      // Silent fail
    }
  },

  /**
   * Calculate Price based on distance, vehicle type and service speed
   */
  calculatePrice: async (details: PricingDetails): Promise<number> => {
    const {
      distance = 0,
      vehicleType = VehicleType.BODA,
      serviceType = ServiceType.EXPRESS,
      stopCount = 0
    } = details;

    // Base rates in KES
    const baseRates: Record<string, number> = {
      [VehicleType.BODA]: 100,
      [VehicleType.TUKTUK]: 250,
      [VehicleType.PICKUP]: 800,
      [VehicleType.VAN]: 1500,
      [VehicleType.LORRY]: 3500,
      [VehicleType.TRAILER]: 12000
    };

    // Per Stop Surcharge (Professional handling fee)
    const stopSurcharges: Record<string, number> = {
      [VehicleType.BODA]: 40,
      [VehicleType.TUKTUK]: 80,
      [VehicleType.PICKUP]: 250,
      [VehicleType.VAN]: 350,
      [VehicleType.LORRY]: 1000,
      [VehicleType.TRAILER]: 2500
    };

    // Per KM rates in KES
    const perKmRates: Record<string, number> = {
      [VehicleType.BODA]: 40,
      [VehicleType.TUKTUK]: 60,
      [VehicleType.PICKUP]: 120,
      [VehicleType.VAN]: 180,
      [VehicleType.LORRY]: 350,
      [VehicleType.TRAILER]: 850
    };

    // Service Multipliers
    const serviceMultipliers: Record<string, number> = {
      [ServiceType.EXPRESS]: 1.25,
      [ServiceType.STANDARD]: 1.0,
      [ServiceType.ECONOMY]: 0.75
    };

    const base = baseRates[vehicleType] || 100;
    const perKm = perKmRates[vehicleType] || 40;
    const stopFee = stopSurcharges[vehicleType] || 40;
    const multiplier = serviceMultipliers[serviceType] || 1.0;

    // distance is in meters from API, convert to km
    const distanceKm = distance / 1000;

    // Additional stops surcharge (excluding the first dropoff)
    const extraStopFee = Math.max(0, stopCount - 1) * stopFee;

    // Intercity Surcharge
    const intercitySurcharge = distanceKm > 100 ? (base * 0.5) : 0;

    let total = (base + (distanceKm * perKm) + extraStopFee + intercitySurcharge) * multiplier;

    // Safety minimums
    const minimums: Record<string, number> = {
      [VehicleType.BODA]: 100,
      [VehicleType.TUKTUK]: 250,
      [VehicleType.PICKUP]: 1000,
      [VehicleType.VAN]: 2000,
      [VehicleType.LORRY]: 5000,
      [VehicleType.TRAILER]: 15000
    };

    const min = (minimums[vehicleType] || 100) * (serviceType === ServiceType.ECONOMY ? 0.8 : 1);
    if (total < min) total = min;

    // Round to nearest 50 for a professional "quoted" feel
    return Math.ceil(total / 50) * 50;
  },

  /**
   * Estimate Delivery Time based on distance and service type
   */
  estimateDeliveryTime: (distanceMeters: number, serviceType: ServiceType, scheduledTime?: string): { arrivalTime: string, arrivalDate: string } => {
    const now = (scheduledTime && scheduledTime !== 'ASAP') ? new Date(scheduledTime) : new Date();
    const distanceKm = distanceMeters / 1000;

    // Average speeds in Kenya (considering traffic/road conditions)
    // Avg 35km/h for mixed city/highway use
    const avgSpeedKmH = 35;
    const travelTimeHours = distanceKm / avgSpeedKmH;
    const travelTimeMs = travelTimeHours * 60 * 60 * 1000;

    let estimatedArrival = new Date(now.getTime() + travelTimeMs);

    // Add processing/pickup buffer based on service
    if (serviceType === ServiceType.EXPRESS) {
      // Direct pickup within 20 mins
      estimatedArrival = new Date(estimatedArrival.getTime() + (20 * 60 * 1000));
    } else if (serviceType === ServiceType.STANDARD) {
      // 4 hour window for bundling logic
      estimatedArrival = new Date(estimatedArrival.getTime() + (4 * 60 * 60 * 1000));
      // If result is after 6 PM, push to tomorrow 10 AM
      if (estimatedArrival.getHours() >= 18) {
        estimatedArrival.setDate(estimatedArrival.getDate() + 1);
        estimatedArrival.setHours(10, 0, 0, 0);
      }
    } else if (serviceType === ServiceType.ECONOMY) {
      // Always next day delivery
      estimatedArrival.setDate(estimatedArrival.getDate() + 1);
      // If it's already next day from travel time, add more buffer
      estimatedArrival.setHours(15, 0, 0, 0);
    }

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };

    return {
      arrivalTime: estimatedArrival.toLocaleTimeString([], timeOptions),
      arrivalDate: estimatedArrival.toLocaleDateString([], dateOptions)
    };
  },

  /**
   * Submit a review for a driver or customer
   */
  submitReview: async (orderId: string, target: 'driver' | 'customer', review: Review): Promise<void> => {
    try {
      const field = target === 'driver' ? 'reviewForDriver' : 'reviewForCustomer';
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        [field]: review,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },

  /**
   * Update the status of a specific stop in a multi-stop order.
   */
  updateStopStatus: async (orderId: string, stopId: string, status: 'pending' | 'arrived' | 'completed', proofImage?: string): Promise<void> => {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) throw new Error("Order not found");

        const orderData = orderDoc.data() as any;
        const currentStops = orderData.stops || [];

        const newStops = currentStops.map((stop: any) =>
          stop.id === stopId
            ? {
              ...stop,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : stop.completedAt,
              proofImage: proofImage || stop.proofImage
            }
            : stop
        );

        transaction.update(orderRef, {
          stops: newStops,
          updatedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error("Error updating stop status:", error);
      throw error;
    }
  }
};
