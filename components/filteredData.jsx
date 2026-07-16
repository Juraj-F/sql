"use client";

const DATASETS = [
  { value: "employees", label: "Employees" },
  { value: "suppliers", label: "Suppliers" },
  { value: "projects", label: "Projects" },
  { value: "components", label: "Components" },
  { value: "customers", label: "Customers" },
  { value: "orders", label: "Orders" },
];

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}) {
  return (
    <label>
      <span>{label}</span>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  emptyLabel = "All",
}) {
  return (
    <label>
      <span>{label}</span>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="">{emptyLabel}</option>

        {options.map((option) => {
          const normalized =
            typeof option === "object"
              ? option
              : {
                  value: option,
                  label: option,
                };

          return (
            <option
              key={normalized.value}
              value={normalized.value}
            >
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default function FilterData({
  dataset,
  filters,
  options,
  loading,
  onDatasetChange,
  onFilterChange,
  onApply,
  onReset,
}) {
  
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    onFilterChange(name, type === "checkbox" ? checked : value);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div>
        <label>
          <span>Dashboard table</span>

          <select
            value={dataset}
            onChange={(event) =>
              onDatasetChange(event.target.value)
            }
          >
            {DATASETS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        {dataset === "employees" && (
          <>
            <InputField
              label="Employee ID"
              name="id"
              type="number"
              min="1"
              value={filters.id}
              onChange={handleChange}
            />

            <InputField
              label="Name"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search employee name"
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={filters.email}
              onChange={handleChange}
            />

            <SelectField
              label="Department"
              name="departmentId"
              value={filters.departmentId}
              onChange={handleChange}
              options={options.departments ?? []}
            />

            <SelectField
              label="Role"
              name="role"
              value={filters.role}
              onChange={handleChange}
              options={options.roles ?? []}
            />

            <InputField
              label="Hired from"
              name="hireFrom"
              type="date"
              value={filters.hireFrom}
              onChange={handleChange}
            />

            <InputField
              label="Hired to"
              name="hireTo"
              type="date"
              value={filters.hireTo}
              onChange={handleChange}
            />
          </>
        )}

        {dataset === "suppliers" && (
          <>
            <InputField
              label="Supplier name"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search supplier"
            />

            <SelectField
              label="Country"
              name="country"
              value={filters.country}
              onChange={handleChange}
              options={options.supplierCountries ?? []}
            />

            <InputField
              label="Minimum rating"
              name="minRating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={filters.minRating}
              onChange={handleChange}
            />

            <InputField
              label="Maximum lead time"
              name="maxLeadTime"
              type="number"
              min="0"
              value={filters.maxLeadTime}
              onChange={handleChange}
            />
          </>
        )}

        {dataset === "projects" && (
          <>
            <InputField
              label="Project or client"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search project/client"
            />

            <SelectField
              label="Manager"
              name="managerId"
              value={filters.managerId}
              onChange={handleChange}
              options={options.managers ?? []}
            />

            <SelectField
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              options={options.projectStatuses ?? []}
            />

            <InputField
              label="Started from"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleChange}
            />

            <InputField
              label="Started to"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleChange}
            />

            <InputField
              label="Minimum budget"
              name="minBudget"
              type="number"
              min="0"
              value={filters.minBudget}
              onChange={handleChange}
            />

            <InputField
              label="Maximum budget"
              name="maxBudget"
              type="number"
              min="0"
              value={filters.maxBudget}
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="overBudget"
                checked={Boolean(filters.overBudget)}
                onChange={handleChange}
              />

              <span>Only projects over budget</span>
            </label>
          </>
        )}

        {dataset === "components" && (
          <>
            <InputField
              label="Component name"
              name="search"
              value={filters.search}
              onChange={handleChange}
            />

            <SelectField
              label="Project"
              name="projectId"
              value={filters.projectId}
              onChange={handleChange}
              options={options.projects ?? []}
            />

            <SelectField
              label="Supplier"
              name="supplierId"
              value={filters.supplierId}
              onChange={handleChange}
              options={options.suppliers ?? []}
            />

            <SelectField
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              options={options.componentStatuses ?? []}
            />

            <SelectField
              label="Criticality"
              name="criticality"
              value={filters.criticality}
              onChange={handleChange}
              options={options.criticalities ?? []}
            />

            <SelectField
              label="Material"
              name="material"
              value={filters.material}
              onChange={handleChange}
              options={options.materials ?? []}
            />

            <InputField
              label="Updated after"
              name="updatedAfter"
              type="date"
              value={filters.updatedAfter}
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="missingDelivery"
                checked={Boolean(filters.missingDelivery)}
                onChange={handleChange}
              />

              <span>Only incomplete deliveries</span>
            </label>
          </>
        )}

        {dataset === "customers" && (
          <>
            <InputField
              label="Customer name"
              name="search"
              value={filters.search}
              onChange={handleChange}
            />

            <SelectField
              label="Country"
              name="country"
              value={filters.country}
              onChange={handleChange}
              options={options.customerCountries ?? []}
            />

            <SelectField
              label="Segment"
              name="segment"
              value={filters.segment}
              onChange={handleChange}
              options={options.customerSegments ?? []}
            />

            <InputField
              label="Created from"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleChange}
            />

            <InputField
              label="Created to"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="hasOrders"
                checked={Boolean(filters.hasOrders)}
                onChange={handleChange}
              />

              <span>Only customers with orders</span>
            </label>
          </>
        )}

        {dataset === "orders" && (
          <>
            <InputField
              label="Order ID"
              name="id"
              type="number"
              min="1"
              value={filters.id}
              onChange={handleChange}
            />

            <SelectField
              label="Customer"
              name="customerId"
              value={filters.customerId}
              onChange={handleChange}
              options={options.customers ?? []}
            />

            <SelectField
              label="Customer country"
              name="country"
              value={filters.country}
              onChange={handleChange}
              options={options.customerCountries ?? []}
            />

            <SelectField
              label="Order status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              options={options.orderStatuses ?? []}
            />

            <InputField
              label="Ordered from"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleChange}
            />

            <InputField
              label="Ordered to"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleChange}
            />

            <InputField
              label="Minimum total"
              name="minAmount"
              type="number"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={handleChange}
            />

            <InputField
              label="Maximum total"
              name="maxAmount"
              type="number"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={handleChange}
            />

            <InputField
              label="Product name"
              name="product"
              value={filters.product}
              onChange={handleChange}
              placeholder="Search order items"
            />
          </>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading…" : "Apply filters"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}