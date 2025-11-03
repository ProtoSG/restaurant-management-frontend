import { CardTable } from "../../components/tables";
import { useTables } from "../../hooks/useTables"

export function ListTables() {
  const { tables, isLoading, error} = useTables();

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <ul className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tables.map((t) => (
        <CardTable key={t.id} table={t} />
      ))}
    </ul>
  )
}
