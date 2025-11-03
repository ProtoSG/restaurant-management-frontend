import { useMutation, useQuery, useQueryClient } from "react-query";
import { TableService } from "../services/tableService";
import type { CreateTableRequest, UpdateTableRequest } from "../models/Table.model";

const tableService = new TableService();

export const useTables = () => {
  const { data: tables = [], isLoading, error } = useQuery(
    'tables',
    () => tableService.getTables()
  );

  return { tables, isLoading, error };
};

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation(
    ({id, table}: {id: number; table: UpdateTableRequest}) => tableService.update(id, table),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('tables');
    },
    onError: (error) => {
      console.error('Error updating table:', error);
    }
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation(
    (table: CreateTableRequest) => tableService.create(table),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('tables');
    },
    onError: (error) => {
      console.error('Error al crear la mesa:', error)
    }
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => tableService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al eliminar la mesa:', error);
      }
    }
  );
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    (tableId: number) => tableService.createOrder(tableId),
    {
      onSuccess: (_, tableId) => {
        queryClient.invalidateQueries(`order-${tableId}`);
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al crear la orden: ', error)
      }
    }
  )
}

export function useOrderActive(id: number, enabled = false) {
  const { data: order, isLoading, error } = useQuery(
    `order-${id}`,
    () => tableService.getOrderActive(id),
    {
      enabled: enabled && id > 0,
    }
  );

  return { order, isLoading, error };
}

export function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ tableId, productId, quantity }: { tableId: number; productId: number; quantity?: number }) =>
      tableService.addItemToOrder(tableId, productId, quantity),
    {
      onSuccess: (_, { tableId }) => {
        queryClient.invalidateQueries(`order-${tableId}`);
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al agregar item al pedido:', error);
      }
    }
  );
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ tableId, itemId, quantity }: { tableId: number; itemId: number; quantity: number }) =>
      tableService.updateOrderItem(tableId, itemId, quantity),
    {
      onSuccess: (_, { tableId }) => {
        queryClient.invalidateQueries(`order-${tableId}`);
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al actualizar item del pedido:', error);
      }
    }
  );
}

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ tableId, itemId }: { tableId: number; itemId: number }) =>
      tableService.removeOrderItem(tableId, itemId),
    {
      onSuccess: (_, { tableId }) => {
        queryClient.invalidateQueries(`order-${tableId}`);
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al eliminar item del pedido:', error);
      }
    }
  );
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, paymentMethod }: { orderId: number; paymentMethod: string }) =>
      tableService.payOrder(orderId, paymentMethod),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tables');
      },
      onError: (error) => {
        console.error('Error al pagar el pedido:', error);
      }
    }
  );
}
