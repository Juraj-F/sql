export default function SchemaList({ schema, loading }) {
  return (
    <section className="panel">
      <h2>Schéma databázy</h2>
      <div className="schema-list">
        {loading && <div className="loading-note">Načítavam...</div>}

        {!loading &&
          Object.entries(schema).map(([table, info]) => (
            <details className="schema-item" key={table}>
              <summary className="schema-item-head">
                <span>{table}</span>
                <span className="count">{info.row_count} riadkov</span>
              </summary>
              <div className="schema-cols">
                {info.columns.map((column) => (
                  <div key={`${table}-${column.name}`}>
                    {column.name}{" "}
                    <span className="column-type">({column.type})</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
      </div>
    </section>
  );
}
