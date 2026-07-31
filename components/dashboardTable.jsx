     import { formatColumn, formatValue } from "@/lib/company-dashboard/formatters"

     export function DashboardTable({
        error,        
        columns,
        loading,
        rows,
        styles,
        clicked
     }){

      const handleClicked = (row)=>{
        clicked(row)
      }

        return(

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
              rows.map((row, rowIndex) => {
                 return(
                <tr
                  key={
                    row.id ??
                    `${dataset}-${page}-${rowIndex}`
                  }
                  onClick={()=>handleClicked(row)}
                >
                  {columns.map((column) => 
                  {
                    return (
                    <td key={column}>
                      {formatValue(row[column], column)
                      
                      }
                    </td>
                  )})}
                </tr>
              )})}
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
        )
      }
      
      