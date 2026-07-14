const FORBIDDEN_PATTERN = /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy|call|do|vacuum|analyze|refresh|reindex|cluster|comment|security|listen|notify|unlisten|set|reset|discard|prepare|execute|deallocate)\b/i;

export function validateReadOnlyQuery(input) {
  const trimmed = String(input ?? "").trim().replace(/;+\s*$/, "");

  if (!trimmed) {
    return { ok: false, reason: "Chýba SQL dotaz." };
  }

  if (trimmed.includes(";")) {
    return {
      ok: false,
      reason: "Povolený je iba jeden SQL príkaz naraz.",
    };
  }

  if (!/^(select|with)\b/i.test(trimmed)) {
    return {
      ok: false,
      reason: "Povolené sú iba SELECT alebo WITH ... SELECT dotazy.",
    };
  }

  if (FORBIDDEN_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "Dotaz obsahuje zakázaný príkaz meniaci databázu.",
    };
  }

  return { ok: true, sql: trimmed };
}
