export const SORT_OPTIONS = {
  users: [
    ["name", "Name"],
    ["hire_date", "Hire date"],
    ["department", "Department"],
  ],
  suppliers: [
    ["name", "Name"],
    ["rating", "Rating"],
    ["lead_time_days", "Lead time"],
  ],
  projects: [
    ["name", "Name"],
    ["start_date", "Start date"],
    ["budget", "Budget"],
    ["budget_spent", "Spent"],
    ["status", "Status"],
  ],
  components: [
    ["name", "Name"],
    ["updated_at", "Updated"],
    ["unit_cost", "Unit cost"],
    ["criticality", "Criticality"],
  ],
  customers: [
    ["name", "Name"],
    ["created_at", "Created"],
    ["total_revenue", "Revenue"],
    ["order_count", "Order count"],
  ],
  orders: [
    ["order_date", "Order date"],
    ["total_amount", "Amount"],
    ["customer", "Customer"],
  ],
};
