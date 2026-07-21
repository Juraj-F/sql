export const DATASETS = {
  employees: {
    table: "employees",
    defaultSort: "name",

    sortColumns: {
      id: "id",
      name: "name",
      email: "email",
      role: "role",
      hire_date: "hire_date",
      department_id: "department_id",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      search: {
        columns: ["name"],
        operator: "search",
      },

      email: {
        columns: ["email"],
        operator: "search",
      },

      departmentId: {
        column: "department_id",
        operator: "=",
        type: "integer",
      },

      role: {
        column: "role",
        operator: "=",
      },

      hireFrom: {
        column: "hire_date",
        operator: ">=",
        cast: "date",
      },

      hireTo: {
        column: "hire_date",
        operator: "<=",
        cast: "date",
      },
    },
  },

  suppliers: {
    table: "suppliers",
    defaultSort: "name",

    sortColumns: {
      id: "id",
      name: "name",
      country: "country",
      rating: "rating",
      lead_time_days: "lead_time_days",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      search: {
        columns: ["name"],
        operator: "search",
      },

      country: {
        column: "country",
        operator: "=",
      },

      minRating: {
        column: "rating",
        operator: ">=",
        type: "number",
      },

      maxLeadTime: {
        column: "lead_time_days",
        operator: "<=",
        type: "integer",
      },
    },
  },

  projects: {
    table: "projects",
    defaultSort: "start_date",

    sortColumns: {
      id: "id",
      name: "name",
      client: "client",
      manager_id: "manager_id",
      start_date: "start_date",
      end_date: "end_date",
      status: "status",
      budget: "budget",
      budget_spent: "budget_spent",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      search: {
        columns: ["name", "client"],
        operator: "search",
      },

      managerId: {
        column: "manager_id",
        operator: "=",
        type: "integer",
      },

      status: {
        column: "status",
        operator: "=",
      },

      dateFrom: {
        column: "start_date",
        operator: ">=",
        cast: "date",
      },

      dateTo: {
        column: "start_date",
        operator: "<=",
        cast: "date",
      },

      minBudget: {
        column: "budget",
        operator: ">=",
        type: "number",
      },

      maxBudget: {
        column: "budget",
        operator: "<=",
        type: "number",
      },

      overBudget: {
        operator: "raw",
        condition: "budget_spent > budget",
        truthyValue: "true",
      },
    },
  },

  components: {
    table: "components",
    defaultSort: "updated_at",

    sortColumns: {
      id: "id",
      name: "name",
      project_id: "project_id",
      supplier_id: "supplier_id",
      material: "material",
      component_type: "component_type",
      status: "status",
      criticality: "criticality",
      unit_cost: "unit_cost",
      qty_needed: "qty_needed",
      qty_delivered: "qty_delivered",
      updated_at: "updated_at",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      search: {
        columns: ["name"],
        operator: "search",
      },

      projectId: {
        column: "project_id",
        operator: "=",
        type: "integer",
      },

      supplierId: {
        column: "supplier_id",
        operator: "=",
        type: "integer",
      },

      status: {
        column: "status",
        operator: "=",
      },

      criticality: {
        column: "criticality",
        operator: "=",
      },

      material: {
        column: "material",
        operator: "=",
      },

      updatedAfter: {
        column: "updated_at",
        operator: ">=",
        cast: "timestamptz",
      },

      missingDelivery: {
        operator: "raw",
        condition: "qty_delivered < qty_needed",
        truthyValue: "true",
      },
    },
  },

  customers: {
    table: "customers",
    defaultSort: "name",

    sortColumns: {
      id: "id",
      name: "name",
      country: "country",
      segment: "segment",
      created_at: "created_at",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      search: {
        columns: ["name"],
        operator: "search",
      },

      country: {
        column: "country",
        operator: "=",
      },

      segment: {
        column: "segment",
        operator: "=",
      },

      dateFrom: {
        column: "created_at",
        operator: ">=",
        cast: "date",
      },

      dateTo: {
        column: "created_at",
        operator: "<=",
        cast: "date",
      },

      hasOrders: {
        operator: "raw",
        truthyValue: "true",
        condition: `
          EXISTS (
            SELECT 1
            FROM orders
            WHERE orders.customer_id = customers.id
          )
        `,
      },
    },
  },

  orders: {
    table: "orders",
    defaultSort: "order_date",

    sortColumns: {
      id: "id",
      customer_id: "customer_id",
      order_date: "order_date",
      status: "status",
      total_amount: "total_amount",
    },

    filters: {
      id: {
        column: "id",
        operator: "=",
        type: "integer",
      },

      customerId: {
        column: "customer_id",
        operator: "=",
        type: "integer",
      },

      status: {
        column: "status",
        operator: "=",
      },

      dateFrom: {
        column: "order_date",
        operator: ">=",
        cast: "timestamptz",
      },

      dateTo: {
        column: "order_date",
        operator: "<",
        cast: "endOfDay",
      },

      minAmount: {
        column: "total_amount",
        operator: ">=",
        type: "number",
      },

      maxAmount: {
        column: "total_amount",
        operator: "<=",
        type: "number",
      },

      product: {
        operator: "existsSearch",
        table: "order_items",
        foreignKey: "order_id",
        parentKey: "orders.id",
        searchColumn: "product_name",
      },
    },
  },
};