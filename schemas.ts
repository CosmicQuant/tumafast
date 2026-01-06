import { z } from 'zod';
import { VehicleType, ServiceType } from './types';

export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/, "Invalid Kenyan phone number").optional(),
    role: z.enum(['customer', 'driver', 'business'])
});

export const BookingSchema = z.object({
    pickup: z.string().min(3, "Pickup location is required"),
    dropoff: z.string().min(3, "Dropoff location is required"),
    vehicle: z.nativeEnum(VehicleType),
    serviceType: z.nativeEnum(ServiceType),
    items: z.object({
        description: z.string().min(3),
        weightKg: z.number().positive().optional(),
        fragile: z.boolean().optional(),
        value: z.number().nonnegative().optional()
    }),
    recipient: z.object({
        name: z.string().min(2),
        phone: z.string().min(10)
    }),
    stops: z.array(z.object({
        id: z.string(),
        address: z.string(),
        lat: z.number(),
        lng: z.number(),
        type: z.enum(['pickup', 'dropoff', 'waypoint']),
        status: z.enum(['pending', 'arrived', 'completed']),
        verificationCode: z.string().optional(),
        sequenceOrder: z.number().optional()
    })).optional()
});
