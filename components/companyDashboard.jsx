"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import FilterData from "./filteredData";
import styles from './CompanyDashboard.module.css'
import { fetchJson } from "@/lib/fetchJson.js";



const DEFAULT_PAGE_SIZE = 25;

const DEFAULT_FILTERS = {
  search: "",
  id: "",
  email: "",
  departmentId: "",
  role: "",
  hireFrom: "",
  hireTo: "",
  country: "",
  segment: "",
  managerId: "",
  projectId: "",
  supplierId: "",
  customerId: "",
  status: "",
  criticality: "",
  material: "",
  minRating: "",
  maxLeadTime: "",
  minBudget: "",
  maxBudget: "",
  minAmount: "",
  maxAmount: "",
  dateFrom: "",
  dateTo: "",
  updatedAfter: "",
  product: "",
  overBudget: false,
  missingDelivery: false,
  hasOrders: false,
};

const SORT_OPTIONS = {
  employees: [
    ["name", "Name"],
    ["hire_date", "Hire date"],
    ["department", "Department"],
  ],
  suppliers: [
    ["name", "Name"],
    ["rating", "Rating"],
    ["lead_time_days", "Lead time"],
  ],
  projects: [
    ["name", "Name"],
    ["start_date", "Start date"],
    ["budget", "Budget"],
    ["budget_spent", "Spent"],
    ["status", "Status"],
  ],
  components: [
    ["name", "Name"],
    ["updated_at", "Updated"],
    ["unit_cost", "Unit cost"],
    ["criticality", "Criticality"],
  ],
  customers: [
    ["name", "Name"],
    ["created_at", "Created"],
    ["total_revenue", "Revenue"],
    ["order_count", "Order count"],
  ],
  orders: [
    ["order_date", "Order date"],
    ["total_amount", "Amount"],
    ["customer", "Customer"],
  ],
};

function formatColumn(column) {
  return column
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value, column) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (
    column.includes("date") ||
    column.includes("updated_at")
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
      }).format(date);
    }
  }

  if (
    column.includes("budget") ||
    column.includes("amount") ||
    column.includes("revenue") ||
    column.includes("cost")
  ) {
    const number = Number(value);

    if (!Number.isNaN(number)) {
      return new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

export default function CompanyDashboard() {
  const [dataset, setDataset] = useState("projects");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [options, setOptions] = useState({});

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState(DEFAULT_PAGE_SIZE);

  const [sortBy, setSortBy] = useState("start_date");
  const [sortDirection, setSortDirection] =
    useState("desc");

  const [totalRows, setTotalRows] = useState(0);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

// console.log("filters", filters)

useEffect(() => {
  setMounted(true);
}, []);


  const pageCount = Math.max(
    1,
    Math.ceil(totalRows / pageSize)
  );

  const availableSortOptions =
    SORT_OPTIONS[dataset] ?? [];


  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      dataset,
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDirection,
    });
    console.log("params before setting filter", params)

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== false
      ) {
        params.set(key, String(value));
      }
    });

    console.log("params in query string after setting filter", params)
    return params.toString();
  }, [
    dataset,
    filters,
    page,
    pageSize,
    sortBy,
    sortDirection,
  ]);

  const loadOptions = useCallback(async () => {
  try {
    const [
      criticalities,
      materials,
      suppliers,
      projects,
    ] = await Promise.all([
      fetchJson(
        "/api/company-dashboard/options/criticalities"
      ),
      fetchJson(
        "/api/company-dashboard/options/materials"
      ),
      fetchJson(
        "/api/company-dashboard/options/suppliers"
      ),
      fetchJson(
        "/api/company-dashboard/options/projects"
      ),
    ]);

    setOptions({
      criticalities:
        criticalities.criticalities ?? [],
      materials:
        materials.materials ?? [],
      suppliers:
        suppliers.suppliers ?? [],
      projects:
        projects.projects ?? [],
    });
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Could not load filter options."
    );
  }
}, []);

  const loadRows = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const data = await fetchJson(
      `/api/company-dashboard?${queryString}`
    );

    setRows(data.rows ?? []);
    setColumns(data.columns ?? []);
    setTotalRows(data.pagination?.totalRows ?? 0);
    setSummary(data.summary ?? {});
  } catch (error) {
    setRows([]);
    setColumns([]);
    setTotalRows(0);
    setSummary({});

    setError(
      error instanceof Error
        ? error.message
        : "Could not load dashboard data."
    );
  } finally {
    setLoading(false);
  }
}, [queryString]);

useEffect(() => {
  loadOptions();
}, [loadOptions]);

useEffect(() => {
  loadRows();
}, [loadRows]);

  function handleDatasetChange(nextDataset) {
    setDataset(nextDataset);
    setFilters(DEFAULT_FILTERS);
    setPage(1);

    const firstSort =
      SORT_OPTIONS[nextDataset]?.[0]?.[0] ?? "id";

    setSortBy(firstSort);
    setSortDirection("asc");
  }

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function applyFilters() {
    setPage(1);
    loadRows();
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }


  if (!mounted) {
  return (
    <section className={styles.dashboard}>
      <div className={styles.state}>
        Loading dashboard…
      </div>
    </section>
  );
}

  return (
    <section className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            Neon PostgreSQL
          </p>

          <h1>Company dashboard</h1>

          <p>
            Explore employees, projects, suppliers,
            components, customers, and orders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRows}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <FilterData
        dataset={dataset}
        filters={filters}
        options={options}
        loading={loading}
        onDatasetChange={handleDatasetChange}
        onFilterChange={handleFilterChange}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.summary}>
        <article>
          <span>Matching records</span>
          <strong>{totalRows}</strong>
        </article>

        {Object.entries(summary).map(([key, value]) => (
          <article key={key}>
            <span>{formatColumn(key)}</span>
            <strong>{formatValue(value, key)}</strong>
          </article>
        ))}
      </div>

      <div className={styles.tableToolbar}>
        <div>
          <label>
            Sort by

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
            >
              {availableSortOptions.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Direction

            <select
              value={sortDirection}
              onChange={(event) => {
                setSortDirection(event.target.value);
                setPage(1);
              }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <label>
          Rows

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  {formatColumn(column)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading &&
              rows.map((row, rowIndex) => (
                <tr
                  key={
                    row.id ??
                    `${dataset}-${page}-${rowIndex}`
                  }
                >
                  {columns.map((column) => (
                    <td key={column}>
                      {formatValue(row[column], column)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className={styles.state}>
            Loading data…
          </div>
        )}

        {!loading && rows.length === 0 && !error && (
          <div className={styles.state}>
            No records match the selected filters.
          </div>
        )}
      </div>

      <footer className={styles.pagination}>
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() =>
            setPage((current) =>
              Math.max(1, current - 1)
            )
          }
        >
          Previous
        </button>

        <span>
          Page {page} of {pageCount}
        </span>

        <button
          type="button"
          disabled={loading || page >= pageCount}
          onClick={() =>
            setPage((current) =>
              Math.min(pageCount, current + 1)
            )
          }
        >
          Next
        </button>
      </footer>
    </section>
  );
}