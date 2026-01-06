import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { DeliveryOrder, Driver, DriverMetrics } from '../types';

// Query Keys
export const ORDER_KEYS = {
    all: ['orders'] as const,
    user: (userId: string) => [...ORDER_KEYS.all, 'user', userId] as const,
    marketplace: () => [...ORDER_KEYS.all, 'marketplace'] as const,
    driverJobs: (driverId: string) => [...ORDER_KEYS.all, 'driver', driverId] as const,
    driverMetrics: (driverId: string) => ['driverMetrics', driverId] as const,
    detail: (orderId: string) => [...ORDER_KEYS.all, 'detail', orderId] as const,
};

// Hooks

export const useOrder = (orderId: string) => {
    return useQuery({
        queryKey: ORDER_KEYS.detail(orderId),
        queryFn: () => orderService.getOrder(orderId),
        enabled: !!orderId,
    });
};

export const useUserOrders = (userId: string) => {
    return useQuery({
        queryKey: ORDER_KEYS.user(userId),
        queryFn: () => orderService.getUserOrders(userId),
        enabled: !!userId,
    });
};

export const useMarketplaceOrders = () => {
    return useQuery({
        queryKey: ORDER_KEYS.marketplace(),
        queryFn: () => orderService.getMarketplaceOrders(),
    });
};

export const useDriverJobs = (driverId: string) => {
    return useQuery({
        queryKey: ORDER_KEYS.driverJobs(driverId),
        queryFn: () => orderService.getDriverJobs(driverId),
        enabled: !!driverId,
    });
};

export const useDriverMetrics = (driverId: string) => {
    return useQuery({
        queryKey: ORDER_KEYS.driverMetrics(driverId),
        queryFn: () => orderService.getDriverMetrics(driverId),
        enabled: !!driverId,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (order: DeliveryOrder) => orderService.createOrder(order),
        onSuccess: (newOrder) => {
            // Invalidate user orders to trigger refetch
            if (newOrder.userId) {
                queryClient.invalidateQueries({ queryKey: ORDER_KEYS.user(newOrder.userId) });
            }
            // Also invalidate marketplace if it's a pending order
            if (newOrder.status === 'pending') {
                queryClient.invalidateQueries({ queryKey: ORDER_KEYS.marketplace() });
            }
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status, driver }: { orderId: string; status: DeliveryOrder['status']; driver?: Driver }) =>
            orderService.updateOrderStatus(orderId, status, driver),
        onSuccess: (_, variables) => {
            // Invalidate all order queries as status change affects lists
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });

            // If driver is involved, invalidate their metrics too (optional but good practice)
            if (variables.driver?.id) {
                queryClient.invalidateQueries({ queryKey: ORDER_KEYS.driverMetrics(variables.driver.id) });
            }
        },
    });
};
export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, updates }: { orderId: string; updates: Partial<DeliveryOrder> }) =>
            orderService.updateOrder(orderId, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
        },
    });
};
