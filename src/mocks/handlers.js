import { http, HttpResponse } from "msw";
import { transactions } from "./data/transactions";

export const handlers = [
  http.get("/api/transactions", ({ request }) => {
    const url = new URL(request.url);

    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("pageSize");
    const q = url.searchParams.get("q") || "";

    const pageNumber = Number(page) || 1;
    const pageSizeNumber = Number(pageSize) || 5;
    const search = q.toLowerCase();

    const filteredTransactions = transactions.filter((trx) => {
      return (
        trx.invoice.toLowerCase().includes(search) ||
        trx.customerName.toLowerCase().includes(search) ||
        trx.product.toLowerCase().includes(search)
      );
    });

    const total = filteredTransactions.length;
    const totalPages = Math.ceil(total / pageSizeNumber);

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
];
