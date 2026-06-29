import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TableServiceImpl } from "../services/TableServiceImpl";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type { CreateTableRequest, UpdateTableRequest } from "../schemas/Table.schema";

const tableService = new TableServiceImpl();

// Unique negative ids for optimistic items (Date.now() alone collides within the same ms).
let optimisticSeq = 0;
const nextOptimisticId = () => -(Date.now() * 1000 + (++optimisticSeq % 1000));

export const useTables = () => {
  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableService.getTables(),
    staleTime: 10000
  });

  return { tables, isLoading, error };
};

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, table}: {id: number; table: UpdateTableRequest}) => tableService.update(id, table),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      console.error('Error updating table:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (table: CreateTableRequest) => tableService.create(table),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      console.error('Error al crear la mesa:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      console.error('Error al eliminar la mesa:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: number) => tableService.createOrder(tableId),
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al crear la orden: ', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useOrderActive(id: number, enabled = false) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`order-${id}`],
    queryFn: () => tableService.getOrderActive(id),
    enabled: enabled && id > 0,
    staleTime: 10000,
  });

  return { order, isLoading, error };
}

export function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, productId, quantity, notes, isTakeaway }: {
      orderId: number;
      tableId: number;
      productId: number;
      quantity?: number;
      notes?: string;
      isTakeaway?: boolean;
      product?: import("@/shared/types/OrderProduct").OrderProduct;
    }) => tableService.addItemToOrder(orderId, productId, quantity, notes, isTakeaway),

    onMutate: async ({ tableId, quantity = 1, product }) => {
      if (!product) return undefined;
      await queryClient.cancelQueries({ queryKey: [`order-${tableId}`] });
      const previous = queryClient.getQueryData<import("@/shared/types/Order").Order>([`order-${tableId}`]);
      if (previous) {
        const optimisticItem: import("@/shared/types/OrderItem").OrderItem = {
          id: nextOptimisticId(),
          quantity,
          subTotal: product.price * quantity,
          product,
        };
        queryClient.setQueryData<import("@/shared/types/Order").Order>([`order-${tableId}`], {
          ...previous,
          items: [...previous.items, optimisticItem],
          total: previous.total + optimisticItem.subTotal,
        });
      }
      return { previous };
    },

    onError: (error, { tableId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData([`order-${tableId}`], ctx.previous);
      console.error('Error al agregar item al pedido:', error);
      toast.error(getApiErrorMessage(error));
    },

    onSettled: (_, __, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId, quantity, notes }: { orderId: number; tableId: number; itemId: number; quantity: number; notes?: string }) =>
      tableService.updateOrderItem(orderId, itemId, quantity, notes),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al actualizar item del pedido:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; tableId: number; itemId: number }) =>
      tableService.removeOrderItem(orderId, itemId),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al eliminar item del pedido:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentMethod }: { orderId: number; paymentMethod: string }) =>
      tableService.payOrder(orderId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al pagar el pedido:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function usePayPartialOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, amount, paymentMethod }: { orderId: number; amount: number; paymentMethod: string; tableId: number }) =>
      tableService.payPartialOrder(orderId, amount, paymentMethod),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al pagar parcialmente el pedido:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}

export function useChangeOrderTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, destinationTableId }: { orderId: number; destinationTableId: number }) =>
      tableService.changeOrderTable(orderId, destinationTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'table-transfers'] });
    },
    onError: (error) => {
      console.error('Error al cambiar la orden de mesa:', error);
      toast.error(getApiErrorMessage(error));
    }
  });
}
