"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";

import FilterData from "./filteredData";
import NewUserForm from "./newUserForm";
import DashboardControls from "./dashboardControls";
import { MatchingRecords } from "./matchingRecords";
import { DashboardTable } from "./dashboardTable";
import UserDataCard from "./userDataCard";

import styles from './CompanyDashboard.module.css';

import { fetchJson } from "@/lib/fetchJson.js";
import { DEFAULT_FILTERS } from "@/lib/company-dashboard/defaultFilters";
import { SORT_OPTIONS } from "@/lib/company-dashboard/sortOptions";
import { buildDashboardQueryString } from "@/lib/company-dashboard/buildDashboardQueryString";


const DEFAULT_PAGE_SIZE = 25;

export default function CompanyDashboard() {
  const {
    isLoaded,
    isSignedIn,
    userId,
    orgId,
    orgRole,
  } = useAuth();

  const router = useRouter()
  const searchParams = useSearchParams()

  const [dataset, setDataset] = useState(searchParams.get("dataset") ?? "projects");
  const [filters, setFilters] = useState(() => ({
  ...DEFAULT_FILTERS,
  role: searchParams.get("role") ?? "",
  search: searchParams.get("search") ?? "",
  id: searchParams.get("id") ?? "",
  email: searchParams.get("email") ?? "",
    }));

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [sortBy, setSortBy] = useState( searchParams.get("sortBy") ?? "start_date");
  const [sortDirection, setSortDirection] = useState(searchParams.get("direction") ?? "desc");
  const [pageSize, setPageSize] = useState( Number(searchParams.get("pageSize")) ||
    DEFAULT_PAGE_SIZE);


  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showUserForm, setShowUserForm]= useState(false)
  const [clickedRow, setClickedRow]=useState({})
  const [showUserDataCard, setShowUserDataCard] = useState(false)

 const dataSetIsUsers = dataset === "users"? true : false

const handleUserCreated = ()=>{
  setShowUserForm(false)
  loadRows()
}

const handleUserEditted = ()=>{
  setShowUserDataCard(false)
  loadRows()
}

const handleClickedRow = (data)=>{
    setShowUserDataCard(true)
    setClickedRow(data)
}

useEffect(()=>{
  const params = new URLSearchParams();

  params.set("dataset", dataset);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("sortBy", sortBy);
  params.set("direction", sortDirection);

    for (const [name, value] of Object.entries(filters)) {
    if (
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      params.set(name, String(value));
    }
  }

  // if (filters.role) {
  //   params.set("role", filters.role);
  // }

  // if (filters.search) {
  //   params.set("search", filters.search);
  // }
  // if (filters.id){
  //    params.set("id", filters.id);
  // }
  //   if (filters.email){
  //    params.set("email", filters.email);
  // }

  router.replace(`/dashboard?${params.toString()}`);

},[  
  dataset,
  page,
  pageSize,
  sortBy,
  sortDirection,
  filters,
  router,])

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
            Explore users, projects, suppliers,
            components, customers, and orders.
          </p>
        </div>
        <div>
          <button className="page-button status connected"
            onClick={() => router.push("/sql-dashboard")}
          >
            SQL PLAYGROUND
          </button>
          <DashboardControls />
          <button
          type="button"
          onClick={loadRows}
          disabled={loading}
        >
          Refresh
        </button>
          </div>

      </header>

       <button
        type="button"
        onClick={() => setShowUserForm(true)}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        New user
      </button>

      {showUserForm && (
        <NewUserForm
          open={showUserForm}
          onSuccess={handleUserCreated}
          onCancel={() => setShowUserForm(false)}
        />
      )}
      
      {showUserDataCard && dataSetIsUsers && (
        <UserDataCard
          userData={clickedRow}
          onClick={()=>setShowUserDataCard(true)}
          open={showUserDataCard}
          onSuccess={handleUserEditted}
          onCancel={() => setShowUserDataCard(false)}
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
        clicked={(data)=>handleClickedRow(data)}
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