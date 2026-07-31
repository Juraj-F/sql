"use client";

import { useState } from "react";
import { departmentOptions } from "@/lib/company-dashboard/departments";
import { rolesOptions } from "@/lib/company-dashboard/rolesOptions";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  department:"",
  hireDate: "",
  salary: "",
};

export default function UserDataCard({ onSuccess, onCancel, open, userData }) {

  const [form, setForm] = useState(
{   firstName:userData.name?? "",
    lastName: userData.last_name?? "",
    role: userData.role?? "",
    email: userData.email?? "",
    department:userData.department?? "",
    hireDate: userData.hire_date.split("T",1)[0]?? "",
    salary: userData.salary?? ""});

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

console.log("form", form)
  if (!open) {
    return null;
  }

  function handleChange(event) {
    const {name, value} = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError("");
  }

  function validateForm() {
    const errors = {};

    if (!form.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!form.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }

    if (!form.role.trim()) {
      errors.role = "Role is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(form.email.trim())) {
        errors.email = "Enter a valid email address.";
      }
    }

    if(!form.department){
      errors.department = "Department is required.";
    }

   if (form.hireDate) {

    const today = new Date().toISOString().split("T")[0];

    if (form.hireDate > today) {
        errors.hireDate =
            "Hire date cannot be in the future.";
    }}

    if (form.salary === "") {
      errors.salary = "Salary is required.";
    } else {
      const salary = Number(form.salary);

      if (!Number.isFinite(salary)) {
        errors.salary = "Salary must be a valid number.";
      } else if (salary < 0) {
        errors.salary = "Salary cannot be negative.";
      }
    }

    return errors;
  }

  async function handleSubmit(event) {
    console.log("submitting has started")
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const currentUserId = userData.id
    console.log("path with user id", `/api/users/${currentUserId}`)

    // if(userData)return
    try {
      const response = await fetch(`/api/users/${currentUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role.trim(),
          department: form.department,
          hireDate: form.hireDate.split("T"),
          email: form.email.trim(),
          salary: Number(form.salary),
          clerk_user_id:userData.clerk_user_id
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ?? "The user could not be created.",
        );
      }

      setForm(INITIAL_FORM);
      setFieldErrors({});
      console.log("result user on user data card", result.user)
      onSuccess?.(result.user);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (isSubmitting) {
      return;
    }

    setForm(INITIAL_FORM);
    setFieldErrors({});
    setSubmitError("");

    onCancel?.();
  }

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-data-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="dialog-panel">
        <div className="dialog-header">
          <div>
            <h2 id="new-employee-title">Create user</h2>

            <p>Enter the user&apos;s information below.</p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="dialog-close"
            aria-label="Close employee form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <FormField
              label="First name"
              name="firstName"
              value={form.firstName}
              error={fieldErrors.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="given-name"
            />

            <FormField
              label="Last name"
              name="lastName"
              value={form.lastName}
              error={fieldErrors.lastName}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="family-name"
            />

            <FormField
              options={rolesOptions}
              type="select"
              label="Role"
              name="role"
              value={form.role}
              error={fieldErrors.role}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="role"
            />

            <FormField
              options={departmentOptions}
              type="select"
              label="Department"
              name="department"
              value={form.department}
              error={fieldErrors.department}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="department"
            />


            <FormField
              type="date"
              label="Hire Date"
              name="hireDate"
              value={form.hireDate}
              error={fieldErrors.hireDate}
              onChange={handleChange}
              disabled={form.hireDate.length>0? true: false}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              error={fieldErrors.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <div className="form-field-wide">
              <FormField
                label="Salary"
                name="salary"
                type="number"
                value={form.salary}
                error={fieldErrors.salary}
                onChange={handleChange}
                disabled={isSubmitting}
                min="0"
                step="0.01"
                inputMode="decimal"
              />
            </div>
          </div>

          {submitError && (
            <div className="form-submit-error" role="alert">
              {submitError}
            </div>
          )}

          <div className="dialog-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="btn"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Editing..." : "Edit User Data"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  options,
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  disabled,
  ...inputProps
}) {
  const errorId = `${name}-error`;
  console.log("options in formfield ", options)

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="" disabled>Select a department</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ):(
        <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={error ? "form-input input-error" : "form-input"}
        {...inputProps}
      />
      )}

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}