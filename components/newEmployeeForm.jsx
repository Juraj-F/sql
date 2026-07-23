"use client";

import { useState } from "react";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  salary: "",
};

export default function NewEmployeeForm({ onSuccess, onCancel, open }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

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
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role.trim(),
          email: form.email.trim(),
          salary: Number(form.salary),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ?? "The employee could not be created.",
        );
      }

      setForm(INITIAL_FORM);
      setFieldErrors({});

      onSuccess?.(result.employee);
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
      aria-labelledby="new-employee-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="dialog-panel">
        <div className="dialog-header">
          <div>
            <h2 id="new-employee-title">Create employee</h2>

            <p>Enter the employee&apos;s information below.</p>
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
              label="Role"
              name="role"
              value={form.role}
              error={fieldErrors.role}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="organization-title"
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
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Creating..." : "Create employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
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

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

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

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}