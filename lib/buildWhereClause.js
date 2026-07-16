function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
}

function convertValue(value, type) {
  if (type === "integer") {
    const number = Number(value);

    if (!Number.isInteger(number)) {
      throw new Error(`Expected an integer, received "${value}".`);
    }

    return number;
  }

  if (type === "number") {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new Error(`Expected a number, received "${value}".`);
    }

    return number;
  }

  return value;
}

export function buildWhereClause(filterConfig, queryParams) {
  const conditions = [];
  const values = [];

  function addValue(value) {
    values.push(value);
    return `$${values.length}`;
  }
    
    console.log("Object.entries", Object.entries(
    filterConfig ?? {}
  ))

  for (const [paramName, config, test] of Object.entries(
    filterConfig ?? {}
  )) {
    console.log("paramName in constru",paramName)
        console.log("config in constru",config)

    const rawValue = queryParams[paramName];

    if (!hasValue(rawValue)) {
      continue;
    }

    const value = convertValue(rawValue, config.type);
    const placeholder = addValue(value);

    if (config.operator === "search") {
      const searchParts = config.columns.map(
        (column) =>
          `${column} ILIKE '%' || ${placeholder} || '%'`
      );

      conditions.push(`(${searchParts.join(" OR ")})`);
      continue;
    }

    const cast = config.cast ? `::${config.cast}` : "";

    conditions.push(
      `${config.column} ${config.operator} ${placeholder}${cast}`
    );
  }

  return {
    whereClause:
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "",
    values,
  };
}