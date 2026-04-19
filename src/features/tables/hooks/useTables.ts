import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TableServiceImpl } from "../services/TableServiceImpl";
import type { CreateTableRequest, UpdateTableRequest } from "../schemas/Table.schema";

const tableService = new TableServiceImpl();

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
    mutationFn: ({ tableId, productId, quantity }: { tableId: number; productId: number; quantity?: number }) =>
      tableService.addItemToOrder(tableId, productId, quantity),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al agregar item al pedido:', error);
    }
  });
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, itemId, quantity }: { tableId: number; itemId: number; quantity: number }) =>
      tableService.updateOrderItem(tableId, itemId, quantity),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al actualizar item del pedido:', error);
    }
  });
}

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, itemId }: { tableId: number; itemId: number }) =>
      tableService.removeOrderItem(tableId, itemId),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: [`order-${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al eliminar item del pedido:', error);
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
    }
  });
}
