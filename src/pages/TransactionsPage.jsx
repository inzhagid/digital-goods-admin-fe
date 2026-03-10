import { useEffect, useState } from "react";
import { useAuth } from "../app/auth/AuthContext";
import Button from "../components/ui/Button";
import { apiFetch } from "../lib/apiFetch";
import Input from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { formatIDR } from "../lib/formatIDR";
import { formatDateTime } from "../lib/formatDateTime";
import { useSearchParams } from "react-router-dom";
import { Modal } from "../components/ui/Modal";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedTrx, setSelectedTrx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedTrx(null);
  };

  const DetailRow = ({ label, value }) => {
    return (
      <div className="flex items-start justify-between gap-6">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-700 text-right">{value}</div>
      </div>
    );
  };

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "all";
    const channel = searchParams.get("channel") ?? "all";
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";
    const pageParam = Number(searchParams.get("page") ?? 1);

    setQuery(q);
    setDebouncedQuery(q);
    setStatusFilter(status);
    setChannelFilter(channel);
    setFromDate(from);
    setToDate(to);
    setPage(Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();

    if (debouncedQuery) next.set("q", debouncedQuery);

    if (statusFilter && statusFilter !== "all")
      next.set("status", statusFilter);
    if (channelFilter && channelFilter !== "all")
      next.set("channel", channelFilter);

    if (fromDate) next.set("from", fromDate);
    if (toDate) next.set("to", toDate);

    if (page && page !== 1) next.set("page", String(page));

    const currentStr = searchParams.toString();
    const nextStr = next.toString();
    if (currentStr === nextStr) return;

    setSearchParams(next, { replace: true });
  }, [
    debouncedQuery,
    statusFilter,
    channelFilter,
    fromDate,
    toDate,
    page,
    searchParams.toString(),
    setSearchParams,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTransactions() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(
          `/api/transactions?page=${page}&pageSize=5&q=${encodeURIComponent(debouncedQuery)}&status=${statusFilter}&channel=${channelFilter}&from=${fromDate}&to=${toDate}`,
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
  }, [page, debouncedQuery, statusFilter, channelFilter, fromDate, toDate]);

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
  }, [debouncedQuery, statusFilter, channelFilter, fromDate, toDate]);

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

      <div className="flex items-center gap-3">
        <div className="w-44">
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded border border-gray-300 transition-colors focus:outline-none focus:ring-blue-500 focus:ring-2 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="w-44">
          <label className="block text-xs text-gray-500 mb-1">Channel</label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded border border-gray-300 transition-colors focus:outline-none focus:ring-blue-500 focus:ring-2 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="b2b">B2B</option>
            <option value="b2c">B2C</option>
          </select>
        </div>

        <div className="w-44">
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="w-44">
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
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
                  Channel
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((trx) => (
                <tr
                  key={trx.id}
                  className="border-t cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedTrx(trx);
                    setIsDetailOpen(true);
                    console.log(trx.invoice);
                  }}
                >
                  <td className="px-4 py-4">{trx.invoice}</td>
                  <td className="px-4 py-4">{formatDateTime(trx.createdAt)}</td>
                  <td className="px-4 py-4">{trx.customerName}</td>
                  <td className="px-4 py-4">{trx.product}</td>
                  <td className="px-4 py-4">{formatIDR(trx.total)}</td>
                  <td className="px-4 py-4">{trx.channel}</td>
                  <td className="px-4 py-4">
                    <Badge status={trx.status} label={trx.status} />
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

      {/* Modal */}
      {isDetailOpen && selectedTrx && (
        <Modal onClose={closeDetail}>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Detail
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">
                  {selectedTrx.invoice}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    status={selectedTrx.status}
                    label={selectedTrx.status}
                  />
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {selectedTrx.channel}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <DetailRow label="Customer" value={selectedTrx.customerName} />
                <DetailRow label="Product" value={selectedTrx.product} />
                <DetailRow label="Qty" value={String(selectedTrx.qty)} />
                <DetailRow label="Total" value={formatIDR(selectedTrx.total)} />
                <DetailRow
                  label="Date"
                  value={formatDateTime(selectedTrx.createdAt)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
