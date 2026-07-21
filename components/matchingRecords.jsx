     import { formatColumn, formatValue } from "@/lib/company-dashboard/formatters"
     
      export function MatchingRecords({
        styles,
        totalRows,
        summary,
      }){
        
        return(<div className={styles.summary}>
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
      </div>)
      }
      