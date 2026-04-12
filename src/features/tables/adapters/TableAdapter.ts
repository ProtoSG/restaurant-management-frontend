import type { Table, TableResponse } from "../types/Table";

export function tableAdapater(tableResponse: TableResponse): Table {
  return {
    id: tableResponse.id,
    number: tableResponse.number,
    status: tableResponse.status
  } as Table;
}
