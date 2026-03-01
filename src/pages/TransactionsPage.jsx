import { useEffect, useState } from "react";
import { useAuth } from "../app/auth/AuthContext";
import Button from "../components/ui/Button";
import { apiFetch } from "../lib/apiFetch";
import Input from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { formatIDR } from "../lib/formatIDR";
import { formatDateTime } from "../lib/formatDateTime";

export default function TransactionsPage() {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTransactions() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(
          `/api/transactions?page=${page}&pageSize=5&q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal },
        );
        setData(result.data);
        setMeta(result.meta);
      } catch (error) {
        if (error.name === "AbortError") return;
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
    return () => controller.abort();
  }, [page, debouncedQuery]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500">Manage your transactions</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search invoice / customer / product"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {user?.role === "admin" && <Button>Add Transactions</Button>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
        {isLoading && <div>Loading . . . </div>}
        {error && <div>Error: {error}</div>}
        {!isLoading && !error && data.length === 0 && (
          <div>No transactions yet</div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Invoice
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((trx) => (
                <tr key={trx.id} className="border-t">
                  <td className="px-4 py-4">{trx.invoice}</td>
                  <td className="px-4 py-4">{formatDateTime(trx.createdAt)}</td>
                  <td className="px-4 py-4">{trx.customerName}</td>
                  <td className="px-4 py-4">{trx.product}</td>
                  <td className="px-4 py-4">{formatIDR(trx.total)}</td>
                  <td className="px-4 py-4">
                    <Badge status={trx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={isLoading || !meta || page <= 1}
          variant="secondary"
        >
          Prev
        </Button>

        <span>
          Page {page} of {meta?.totalPages || 1}
        </span>

        <Button
          onClick={() => setPage((p) => Math.min(meta?.totalPages || 1, p + 1))}
          disabled={isLoading || !meta || page >= meta.totalPages}
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
