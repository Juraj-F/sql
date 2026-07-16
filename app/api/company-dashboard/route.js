import { query } from "@/lib/db";
import { buildWhereClause } from "@/lib/buildWhereClause";
import { DATASETS } from "@/lib/dataSet";



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);



    const dataset = queryParams.dataset?? "Projects";

    const config = DATASETS[dataset];

    if (!config) {
      return Response.json(
        { error: "Invalid dataset." },
        { status: 400 }
      );
    }

    const sortColumn =
      config.sortColumns[queryParams.sortBy] ??
      config.sortColumns[config.defaultSort];

    const sortDirection =
      queryParams.sortDirection === "desc"
        ? "DESC"
        : "ASC";

    const page = Math.max(
      Number.parseInt(queryParams.page, 10) || 1,
      1
    );

    const pageSize = Math.min(
      Math.max(
        Number.parseInt(queryParams.pageSize, 10) || 25,
        1
      ),
      100
    );

    const offset = (page - 1) * pageSize;
    const filterConfig = config.filters
    
    console.log("Object.entries", Object.entries(
    filterConfig ?? {}
  ))

    const { whereClause, values } = buildWhereClause(
      config.filters,
      queryParams
    );

    const countValues = [...values];

    values.push(pageSize);
    const limitPlaceholder = `$${values.length}`;

    values.push(offset);
    const offsetPlaceholder = `$${values.length}`;

    const rowsSql = `
      SELECT *
      FROM ${config.table}
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `;

    const countSql = `
      SELECT COUNT(*)::integer AS total_rows
      FROM ${config.table}
      ${whereClause}
    `;

    const [rowsResult, countResult] = await Promise.all([
      query(rowsSql, values),
      query(countSql, countValues),
    ]);

    const totalRows = Number(
      countResult.rows[0]?.total_rows ?? 0
    );

    return Response.json({
      rows: rowsResult.rows,
      columns: rowsResult.fields.map(
        (field) => field.name
      ),
      pagination: {
        page,
        pageSize,
        totalRows,
        pageCount: Math.max(
          1,
          Math.ceil(totalRows / pageSize)
        ),
      },
      summary: {},
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load dashboard data.",
      },
      { status: 500 }
    );
  }
}