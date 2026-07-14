export default function ExampleList({ examples, loading, onSelect }) {
  return (
    <section className="panel">
      <h2>Vzorové queries</h2>
      <div className="examples-list">
        {loading && <div className="loading-note">Načítavam...</div>}

        {!loading &&
          examples.map((example) => (
            <button
              className="example-item"
              key={example.title}
              type="button"
              onClick={() => onSelect(example.sql)}
            >
              <span className="ex-title">{example.title}</span>
              <span className="ex-desc">{example.description}</span>
            </button>
          ))}
      </div>
    </section>
  );
}
