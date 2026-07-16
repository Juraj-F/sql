
// 
PostgreSQL Practice Workbook - Neon Database Page 4
Level 1 - Foundations
Focus: SELECT, aliases, filtering, sorting, DISTINCT, LIMIT



1. List all departments
Task: Return every row from departments.
Expected outcome: 6 rows; columns id and name.
Concept hint: Use SELECT with an explicit column list.

SELECT * FROM departments

// 
2. Employee directory
Task: List employee id, name, role, and email. Sort alphabetically by employee name.
Expected outcome: 60 rows ordered A-Z by name.
Concept hint: ORDER BY name ASC

SELECT id, name, role, email 
FROM employees
ORDER BY name ASC

// 
3. Top-rated suppliers
Task: Show supplier name, country, and rating for suppliers rated at least 4.5.
Expected outcome: Only suppliers with rating >= 4.5; highest rating first.
Concept hint: WHERE and ORDER BY.

SELECT name, country, rating FROM suppliers
WHERE rating >=4.5
ORDER BY rating DESC ;


// 
4. Slow-delivery suppliers
Task: Find suppliers whose lead time is more than 30 days.
Expected outcome: Supplier name, lead_time_days, and country; sorted longest lead time first.
Concept hint: Filter numeric values.

SELECT id, name, country, lead_time_days AS delivery_time
FROM suppliers
WHERE lead_time_days>=30
ORDER BY lead_time_days DESC

// 
5. Active project list
Task: Return projects whose status is in_progress or testing.
Expected outcome: Only matching projects; show id, name, client, status.
Concept hint: Use IN (...).

SELECT id, name, client, status 
FROM projects 
WHERE status IN ('in_progress', 'testing') 
ORDER BY id ASC;


// 
6. Projects over budget
Task: Find projects where budget_spent exceeds budget.
Expected outcome: Each row represents an over-budget project; include overspend amount.
Concept hint: Computed column: budget_spent - budget.

SELECT projects.*, (budget_spent-budget) AS overspent
FROM projects 
WHERE budget_spent>budget
ORDER BY overspent DESC;


// 
7. High-criticality components
Task: List high-criticality components and their current status.
Expected outcome: Rows where criticality = high; include project_id, name, status.
Concept hint: Simple text filter.

SELECT project_id, name, status
FROM components 
WHERE criticality = 'high'
ORDER BY id DESC;

// 
8. Incomplete component deliveries
Task: Return components where qty_delivered is less than qty_needed.
Expected outcome: Only incomplete deliveries; include remaining quantity.
Concept hint: Computed column: qty_needed - qty_delivered.

SELECT project_id, name, status, (qty_needed-qty_delivered) AS remaining_quantity
FROM components 
WHERE qty_delivered<qty_needed
ORDER BY id DESC;


// 
9. Recent customers
Task: List customers created during the last 365 days relative to CURRENT_DATE.
Expected outcome: Customers created within the rolling one-year window.
Concept hint: CURRENT_DATE - INTERVAL '365 days'.

SELECT customers.*, (CURRENT_DATE - INTERVAL '365 days') AS cutoff_date 
FROM customers 
WHERE created_at >= (CURRENT_DATE - INTERVAL '365 days')
ORDER BY id DESC;


10. Largest orders
Task: Show the 20 orders with the highest total_amount.
Expected outcome: Exactly 20 rows unless fewer exist; descending total_amount.
Concept hint: ORDER BY ... DESC LIMIT 20.

SELECT orders.*
FROM orders 
ORDER BY total_amount DESC
LIMIT 20;


11. Unique customer countries
Task: Return each distinct country represented in customers.
Expected outcome: One row per country, no duplicates, alphabetical order.
Concept hint: DISTINCT.

SELECT DISTINCT country
FROM customers 
ORDER BY country DESC;

12. Cancelled orders
Task: List cancelled orders from newest to oldest.
Expected outcome: Only status = cancelled; newest order_date first.
Concept hint: WHERE and timestamp sorting

SELECT id,customer_id,status, order_date
FROM orders
WHERE status='cancelled'
ORDER BY order_date DESC;