
   export function buildDashboardQueryString({
      dataset,
      page,
      pageSize,
      filters,
      sortBy,
      sortDirection,
   })
   {

   const params =  new URLSearchParams({
      dataset,
      page: String(page),
      pageSize: String(pageSize),
      filters,
      sortBy,
      sortDirection,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== false
      ) {
        params.set(key, String(value));
      }
    });

    return params.toString();
    
   } 