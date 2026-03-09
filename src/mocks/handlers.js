import { http, HttpResponse } from "msw";
import { transactions } from "./data/transactions";
import { suppliers } from "./data/suppliers";
import { customers } from "./data/customers";

export const handlers = [
  // Transactions
  http.get("/api/transactions", ({ request }) => {
    const url = new URL(request.url);

    const page = url.searchParams.get("page");
    const pageNumber = Number(page) || 1;

    const pageSize = url.searchParams.get("pageSize");
    const pageSizeNumber = Number(pageSize) || 5;

    const q = url.searchParams.get("q") || "";
    const search = q.toLowerCase();

    const status = url.searchParams.get("status") || "all";
    const channel = url.searchParams.get("channel") || "all";

    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";

    const fromTime = from ? new Date(`${from}T00:00:00.000Z`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59.999Z`).getTime() : null;

    const filteredTransactions = transactions.filter((trx) => {
      const matchesSearch =
        trx.invoice.toLowerCase().includes(search) ||
        trx.customerName.toLowerCase().includes(search) ||
        trx.product.toLowerCase().includes(search);

      const matchesStatus =
        status === "all" || trx.status.toLowerCase() === status.toLowerCase();

      const matchesChannel =
        channel === "all" ||
        trx.channel.toLowerCase() === channel.toLowerCase();

      const trxTime = new Date(trx.createdAt).getTime();
      const matchesFrom = !fromTime || trxTime >= fromTime;
      const matchesTo = !toTime || trxTime <= toTime;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesChannel &&
        matchesFrom &&
        matchesTo
      );
    });

    const total = filteredTransactions.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSizeNumber));

    const start = (pageNumber - 1) * pageSizeNumber;
    const end = start + pageSizeNumber;

    const paginatedTransactions = filteredTransactions.slice(start, end);

    return HttpResponse.json({
      data: paginatedTransactions,
      meta: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        total: total,
        totalPages: totalPages,
      },
    });
  }),

  // Suppliers
  http.get("/api/suppliers", ({ request }) => {
    const url = new URL(request.url);

    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("pageSize");
    const q = url.searchParams.get("q") || "";

    const pageNumber = Number(page) || 1;
    const pageSizeNumber = Number(pageSize) || 5;
    const search = q.toLowerCase();

    const filteredSuppliers = suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(search) ||
        s.contactName.toLowerCase().includes(search) ||
        s.phone.toLowerCase().includes(search)
      );
    });

    const total = filteredSuppliers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSizeNumber));

    const start = (pageNumber - 1) * pageSizeNumber;
    const end = start + pageSizeNumber;

    const paginatedSuppliers = filteredSuppliers.slice(start, end);

    return HttpResponse.json({
      data: paginatedSuppliers,
      meta: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        total: total,
        totalPages: totalPages,
      },
    });
  }),

  http.post("/api/suppliers", async ({ request }) => {
    const body = await request.json();
    const newSupplier = {
      id: `sp_${String(suppliers.length + 1).padStart(3, "0")}`,
      ...body,
    };

    suppliers.push(newSupplier);
    return HttpResponse.json(newSupplier);
  }),

  http.put("/api/suppliers/:id", async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = suppliers.findIndex((s) => s.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: "Supplier not found" },
        { status: 404 },
      );
    }

    suppliers[index] = { ...suppliers[index], ...body };

    return HttpResponse.json(suppliers[index]);
  }),

  // Customers
  http.get("/api/customers", ({ request }) => {
    const url = new URL(request.url);

    const page = url.searchParams.get("page");
    const pageNumber = Number(page) || 1;

    const pageSize = url.searchParams.get("pageSize");
    const pageSizeNumber = Number(pageSize) || 5;

    const q = url.searchParams.get("q") || "";
    const search = q.toLowerCase();

    const filteredCustomers = customers.filter((cust) => {
      return (
        cust.name.toLowerCase().includes(search) ||
        cust.type.toLowerCase().includes(search) ||
        cust.phone.toLowerCase().includes(search)
      );
    });

    const total = filteredCustomers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSizeNumber));

    const start = (pageNumber - 1) * pageSizeNumber;
    const end = start + pageSizeNumber;

    const paginatedCustomers = filteredCustomers.slice(start, end);

    return HttpResponse.json({
      data: paginatedCustomers,
      meta: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        total: total,
        totalPages: totalPages,
      },
    });
  }),

  http.post("/api/customers", async ({ request }) => {
    const body = await request.json();
    const newCustomer = {
      id: `cu_${String(customers.length + 1).padStart(3, "0")}`,
      ...body,
    };

    customers.push(newCustomer);
    return HttpResponse.json(newCustomer);
  }),

  http.put("/api/customers/:id", async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = customers.findIndex((cust) => cust.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    customers[index] = { ...customers[index], ...body };
    return HttpResponse.json(customers[index]);
  }),
];
