CREATE DATABASE IF NOT EXISTS tododb;
USE tododb;

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO todos (title, completed) VALUES
    ('Belajar Docker', FALSE),
    ('Membuat Dockerfile', FALSE),
    ('Setup Docker Compose', FALSE);
