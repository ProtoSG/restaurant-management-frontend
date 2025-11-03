import type { Table, TableResponse } from "../models/Table.model";

export function tableAdapater(tableResponse: TableResponse): Table {
  return {
    id: tableResponse.id,
    number: tableResponse.number,
    status: tableResponse.status
  } as Table;
}
