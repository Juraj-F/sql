
function badgeClass(value) {
  if (value === "high") return "badge-high";
  if (value === "medium") return "badge-medium";
  if (value === "low") return "badge-low";
  return "";
}

function displayValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ResultsTable({ result, hasRun }) {
  const columns = result?.columns ?? [];
  const rows = result?.rows ?? [];

  return (
  
    <section className="results-block">
      <div className="results-header">
        <h2>Výsledky</h2>
        {hasRun && (
          <span className="result-meta">
            {result.row_count} riadkov · {columns.length} stĺpcov
          </span>
        )}
      </div>

      <div className="table-wrap">
        {!hasRun && (
          <div className="empty-state">
            Spusti dotaz, aby si tu videl výsledky.
          </div>
        )}

        {hasRun && rows.length === 0 && (
          <div className="empty-state">
            Dotaz prebehol úspešne, ale nevrátil žiadne riadky.
          </div>
        )}

        {rows.length > 0 && (
          <table id="results-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td
                      className={badgeClass(row[column])}
                      key={`${rowIndex}-${column}`}
                    >
                      {displayValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>

  );
}
