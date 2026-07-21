import { query } from "../db";
import { DATASETS } from "./dataSet";
import { buildWhereClause } from "./buildWhereClause";

export class DashboardQueryError extends Error {
  constructor(message, status = 400) {
    super(message);

    this.name = "DashboardQueryError";
    this.status = status;
  }
}

export async function getDashboardData(queryParams) {
  const datasetName = queryParams.dataset;

  if (!datasetName) {
    throw new DashboardQueryError(
      "A dataset is required",
    );
  }

  const config = DATASETS[datasetName];

  if (!config) {
    throw new DashboardQueryError(
      `Unsupported dataset: ${datasetName}`,
    );
  }

  const sortColumn = getSortColumn(
    queryParams.sortColumn,
    config,
  );

  const sortDirection =
    queryParams.sortDirection === "desc"
      ? "DESC"
      : "ASC";

  const page = Math.max(
    Number.parseInt(queryParams.page, 10) || 1,
    1,
  );

  const pageSize = Math.min(
    Math.max(
      Number.parseInt(queryParams.pageSize, 10) || 25,
      1,
    ),
    100,
  );

  const offset = (page - 1) * pageSize;

  const { whereClause, values } = buildWhereClause(
    config.filters,
    queryParams,
  );

  /*
   * The count query uses only the filter values.
   * It must not receive LIMIT or OFFSET values.
   */
  const countValues = [...values];

  values.push(pageSize);
  const limitPlaceholder = `$${values.length}`;

  values.push(offset);
  const offsetPlaceholder = `$${values.length}`;

  /*
   * config.table and sortColumn are safe here because both come
   * from the server-side DATASETS whitelist, not directly from
   * user input.
   */
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

  const totalRows = countResult.rows[0]?.total_rows ?? 0;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    dataset: datasetName,
    rows: rowsResult.rows,
    columns: rowsResult.rows.length > 0
      ? Object.keys(rowsResult.rows[0])
      : [],
    pagination: {
      page,
      pageSize,
      totalRows,
      totalPages,
    },
    sorting: {
      sortColumn,
      sortDirection: sortDirection.toLowerCase(),
    },
  };
}

function getSortColumn(requestedSortColumn, config) {
  if (
    requestedSortColumn &&
    config.sortColumns.includes(requestedSortColumn)
  ) {
    return requestedSortColumn;
  }

  return config.defaultSort;
}