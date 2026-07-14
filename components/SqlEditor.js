export default function SqlEditor({
  sql,
  loading,
  runInfo,
  error,
  onChange,
  onRun,
  onClear,
}) {
  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onRun();
    }
  }

  return (
    <section className="editor-block">
      <div className="editor-toolbar">
        <button
          className="btn btn-primary"
          type="button"
          onClick={onRun}
          disabled={loading}
        >
          {loading ? "Spúšťam..." : "▶ Spustiť"} <kbd>Ctrl/Cmd + Enter</kbd>
        </button>
        <button className="btn" type="button" onClick={onClear}>
          Vyčistiť
        </button>
        <span className="run-info">{runInfo}</span>
      </div>

      <textarea
        id="sql-editor"
        value={sql}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="SELECT * FROM projects LIMIT 20;"
      />

      {error && <div className="error-box">{error}</div>}
    </section>
  );
}
