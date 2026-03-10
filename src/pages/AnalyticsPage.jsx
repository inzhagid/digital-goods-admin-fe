import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import { formatIDR } from "../lib/formatIDR";
import Card, { CardContent, CardHeader } from "../components/ui/Card";

export default function AnalyticsPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);

  // DATE
  const toYMD = (date) => {
    return date.toISOString().slice(0, 10);
  };

  const today = new Date();
  const toDate = toYMD(today);

  const from = new Date();
  from.setDate(from.getDate() - 6);
  const fromDate = toYMD(from);

  // REVENUE 7 DAYS
  const totalsByDate = {};
  for (const trx of transactions) {
    const dateKey = trx.createdAt.slice(0, 10);
    totalsByDate[dateKey] = (totalsByDate[dateKey] || 0) + trx.total;
  }

  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);

    daily.push({
      date: dateKey,
      total: totalsByDate[dateKey] || 0,
    });
  }

  const total7d = daily.reduce((sum, trx) => sum + trx.total, 0);

  // TOP PRODUCTS
  const totalsByProduct = {};

  for (const trx of transactions) {
    const key = trx.product;

    if (!totalsByProduct[key]) {
      totalsByProduct[key] = { product: key, total: 0, qty: 0 };
    }

    totalsByProduct[key].total += trx.total;
    totalsByProduct[key].qty += trx.qty;
  }

  const productList = Object.values(totalsByProduct);
  const topProducts = [...productList]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxDaily = daily.reduce((max, d) => Math.max(max, d.total), 0);

  useEffect(() => {
    async function fetchTransactions() {
      const result = await apiFetch(
        `/api/transactions?page=1&pageSize=500&status=success&channel=${channelFilter}&from=${fromDate}&to=${toDate}`,
      );
      setTransactions(result.data);
      console.log("rows", result.data.length);
    }

    fetchTransactions();
  }, [channelFilter, fromDate, toDate]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500">
          Revenue & Top products (last 7 days)
        </p>
      </div>

      <div className="w-44">
        <label className="block text-xs mb-1 text-gray-500">Channel</label>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded border border-gray-300 transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="b2b">B2B</option>
          <option value="b2c">B2C</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-700">Revenue (7d)</h3>
            <p className="text-xs text-gray-600">
              {fromDate} → {toDate}
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatIDR(total7d)}
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {daily.map((d) => (
                <div key={d.date} className="flex items-center justify-between">
                  <span>{d.date}</span>
                  <span className="font-semibold">{formatIDR(d.total)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="h-24 flex items-end gap-2">
                {daily.map((d) => {
                  const heightPct =
                    maxDaily === 0 ? 0 : (d.total / maxDaily) * 100;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full bg-gray-100 rounded h-full flex items-end">
                        <div
                          className="w-full rounded bg-blue-500"
                          style={{
                            height: `${heightPct}%`,
                            minHeight: d.total > 0 ? 4 : 0,
                          }}
                          title={`${d.date} • ${formatIDR(d.total)}`}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {d.date.slice(8, 10)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-700">
              Top products (7d)
            </h3>
            <p className="text-xs text-gray-600">By Revenue</p>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-xs text-gray-700">No data</div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p) => (
                  <div
                    key={p.product}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="text-sm text-gray-800">{p.product}</div>
                    <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatIDR(p.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
