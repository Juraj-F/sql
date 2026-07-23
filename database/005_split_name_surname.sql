UPDATE employees
SET
    name = split_part(employees.name, ' ', 1),
    last_name = split_part(employees.last_name, ' ', 2);