export interface Transaction {
  id: number;
  from: string;
  amount: number;
  time: string;
  change: number;
}

interface Props {
  transactions: Transaction[];
}

export function RecentTransactionsCard({ transactions }: Props) {
  const safeTransactions = transactions ?? [];
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas transferencias</h3>
      
      {safeTransactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay transferencias recientes</p>
      ) : (
        <div className="space-y-1">
          {safeTransactions.map((transaction, index) => {
            const isIncoming = (transaction.amount ?? 0) > 0;

            return (
              <div key={transaction.id ?? index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs font-mono text-gray-400 w-5 shrink-0 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {transaction.from ?? 'Desconocido'}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.time ?? ''}</p>
                </div>
                <p className={`font-semibold text-sm tabular-nums ${isIncoming ? 'text-green' : 'text-red'}`}>
                  {isIncoming ? '+' : '-'}S/ {Math.abs(Number(transaction.amount ?? 0)).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
