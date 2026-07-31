ALTER TABLE users
ADD COLUMN salary INT CHECK (salary > 0)