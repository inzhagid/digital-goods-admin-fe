import { useEffect, useState } from "react";
import { useAuth } from "../app/auth/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { CustomerForm } from "../features/customers/CustomerForm";
import { Modal } from "../components/ui/Modal";

export default function CustomersPage() {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsloading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // FETCH
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCustomers() {
      setIsloading(true);
      setError(null);

      try {
        const result = await apiFetch(
          `/api/customers?page=${page}&pageSize=5&q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal },
        );
        setData(result.data);
        setMeta(result.meta);
      } catch (error) {
        if (error.name === "AbortError") return;
        setError(error.message);
      } finally {
        setIsloading(false);
      }
    }

    fetchCustomers();
    return () => controller.abort();
  }, [page, debouncedQuery, refreshKey]);

  // DEBOUNCE
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(id);
  }, [query]);

  // RESET PAGE
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">Manage your customers</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search name / type / phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {user?.role === "admin" && (
          <Button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
          >
            Add Customer
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
        {isLoading && <div>Loading . . .</div>}
        {error && <div>Error: {error}</div>}
        {!isLoading && !error && data.length === 0 && (
          <div>No Customers yet</div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Name
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Type
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Phone
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-600">
                  Status
                </th>
                {user?.role === "admin" && (
                  <th className="text-left font-medium px-4 py-3 text-gray-600">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((cust) => (
                <tr className="border-t" key={cust.id}>
                  <td className="px-4 py-3">{cust.name}</td>
                  <td className="px-4 py-3">{cust.type}</td>
                  <td className="px-4 py-3">{cust.phone}</td>
                  <td className="px-4 py-3">
                    <Badge
                      status={cust.isActive ? "success" : "failed"}
                      label={cust.isActive ? "Active" : "Non Active"}
                    />
                  </td>
                  {user?.role === "admin" && (
                    <td>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingCustomer(cust);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  )}
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

      {isModalOpen && (
        <Modal
          onClose={() => {
            setEditingCustomer(null);
            setIsModalOpen(false);
          }}
        >
          <CustomerForm
            initialValues={editingCustomer}
            onSuccess={() => {
              setEditingCustomer(null);
              setIsModalOpen(false);
              setRefreshKey((key) => key + 1);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
