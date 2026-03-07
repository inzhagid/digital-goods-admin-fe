import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import Input from "../components/ui/Input";
import { useAuth } from "../app/auth/AuthContext";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export default function SuppliersPage() {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSuppliers() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(
          `/api/suppliers?page=${page}&pageSize=5&q=${encodeURIComponent(debouncedQuery)}`,
          {
            signal: controller.signal,
          },
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

    fetchSuppliers();
    return () => controller.abort();
  }, [page, debouncedQuery]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-gray-900">Suppliers</h2>
          <p className="text-sm text-gray-500">Manage your suppliers</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search name / contact name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {user?.role === "admin" && <Button>Add Suppliers</Button>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
        {isLoading && <div>Loading . . .</div>}
        {error && <div>Error: {error}</div>}
        {!isLoading && !error && data.length === 0 && (
          <div>No Suppliers yet</div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Name
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Contact Name
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Phone
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((spl) => (
                <tr className="border-t" key={spl.id}>
                  <td className="px-4 py-3">{spl.name}</td>
                  <td className="px-4 py-3">{spl.contactName}</td>
                  <td className="px-4 py-3">{spl.phone}</td>
                  <td className="px-4 py-3">
                    <Badge
                      status={spl.isActive ? "success" : "failed"}
                      label={spl.isActive ? "Active" : "Non Active"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={isLoading || !meta || page <= 1}
        >
          Prev
        </Button>

        <span>
          Page {page} of {meta?.totalPages || 1}
        </span>

        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.min(meta?.totalPages || 1, p + 1))}
          disabled={isLoading || !meta || page >= meta.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
