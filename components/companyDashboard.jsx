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
import NewEmployeeForm from "./newEmployeeForm";
import { useAuth } from "@clerk/nextjs";
import DashboardControls from "./dashboardControls";
import { DEFAULT_FILTERS } from "@/lib/company-dashboard/defaultFilters";
import { SORT_OPTIONS } from "@/lib/company-dashboard/sortOptions";
import { buildDashboardQueryString } from "@/lib/company-dashboard/buildDashboardQueryString";
import { MatchingRecords } from "./matchingRecords";
import { DashboardTable } from "./dashboardTable";

const DEFAULT_PAGE_SIZE = 25;

export default function CompanyDashboard() {
  const {
    isLoaded,
    isSignedIn,
    userId,
    orgId,
    orgRole,
  } = useAuth();

  console.log("isLoaded isSignedIn, userId, orgId, orgRole",isLoaded,
    isSignedIn,
    userId,
    orgId,
    orgRole,)


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

  const [showEmployeeForm, setShowEmployeeForm]= useState(false)


const handleEmployeeCreated = ()=>{
}

useEffect(() => {
  setMounted(true);
}, []);


  const pageCount = Math.max(
    1,
    Math.ceil(totalRows / pageSize)
  );

  const availableSortOptions =
    SORT_OPTIONS[dataset] ?? [];


  const queryString = useMemo(() =>
    buildDashboardQueryString({
      dataset,
      page,
      pageSize,
      filters,
      sortBy,
      sortDirection,
    }),
    [
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
        "/api/dashboard/options/criticalities"
      ),
      fetchJson(
        "/api/dashboard/options/materials"
      ),
      fetchJson(
        "/api/dashboard/options/suppliers"
      ),
      fetchJson(
        "/api/dashboard/options/projects"
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
      `/api/dashboard?${queryString}`
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
          <DashboardControls />

        <button
          type="button"
          onClick={loadRows}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

       <button
        type="button"
        onClick={() => setShowEmployeeForm(true)}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        New employee
      </button>

      {showEmployeeForm && (
        <NewEmployeeForm
          open={showEmployeeForm}
          onSuccess={handleEmployeeCreated}
          onCancel={() => setShowEmployeeForm(false)}
        />
      )}

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

      <MatchingRecords
        styles={styles}
        totalRows={totalRows}
        summary={summary}
      />

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
      
      <DashboardTable
        error={error}
        columns={columns}
        loading={loading}
        rows={rows}
        styles={styles}
      />

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