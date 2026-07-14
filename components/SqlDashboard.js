"use client";

import { useCallback, useEffect, useState } from "react";
import ExampleList from "@/components/ExampleList";
import ResultsTable from "@/components/ResultsTable";
import SchemaList from "@/components/SchemaList";
import SqlEditor from "@/components/SqlEditor";

const DEFAULT_QUERY = "SELECT * FROM projects LIMIT 20;";

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Požiadavka zlyhala.");
  return data;
}

export default function SqlDashboard() {
  const [schema, setSchema] = useState({});
  const [examples, setExamples] = useState([]);
  const [sql, setSql] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState("");
  const [runInfo, setRunInfo] = useState("");
  const [connected, setConnected] = useState(false);

  const runQuery = useCallback(async () => {
    if (!sql.trim() || loadingQuery) return;

    setError("");
    setRunInfo("beží...");
    setLoadingQuery(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });
      const data = await readJson(response);
      setResult(data);
      setRunInfo(`${data.ms} ms`);
    } catch (requestError) {
      setError(requestError.message);
      setRunInfo("");
    } finally {
      setLoadingQuery(false);
    }
  }, [sql, loadingQuery]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [schemaResponse, examplesResponse, healthResponse] =
          await Promise.all([
            fetch("/api/schema", { cache: "no-store" }),
            fetch("/api/examples"),
            fetch("/api/health", { cache: "no-store" }),
            fetch("/api/testing", { cache: "no-store" }),
          ]);

        const [schemaData, examplesData, healthData] = await Promise.all([
          readJson(schemaResponse),
          readJson(examplesResponse),
          readJson(healthResponse),
        ]);

        setSchema(schemaData);
        setExamples(examplesData);
        setConnected(Boolean(healthData.ok));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    runQuery();
    // Run only once after mount with the default query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">◧</span>
          <div>
            <div className="brand-title">SQL Practice</div>
            <div className="brand-sub">Neon PostgreSQL databáza</div>
          </div>
        </div>

        <SchemaList schema={schema} loading={loadingInitial} />
        <ExampleList
          examples={examples}
          loading={loadingInitial}
          onSelect={setSql}
        />
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>SQL ihrisko</h1>
            <p className="topbar-sub">
              Napíš read-only PostgreSQL dotaz, spusti ho a pozri si výsledky.
            </p>
          </div>
          <div className={`status ${connected ? "connected" : "disconnected"}`}>
            {connected ? "pripojené" : "nepripojené"}
          </div>
        </header>

        <SqlEditor
          sql={sql}
          loading={loadingQuery}
          runInfo={runInfo}
          error={error}
          onChange={setSql}
          onRun={runQuery}
          onClear={() => setSql("")}
        />

        <ResultsTable result={result} hasRun={result !== null} />
      </main>
    </div>
  );
}
