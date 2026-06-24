CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mechanics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    vehicle_number VARCHAR(20),
    id_verified BOOLEAN NOT NULL DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    available BOOLEAN NOT NULL DEFAULT false,
    rating_avg DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    total_jobs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mechanic_specializations (
    mechanic_id BIGINT NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
    problem_type VARCHAR(30) NOT NULL,
    PRIMARY KEY (mechanic_id, problem_type)
);

CREATE TABLE IF NOT EXISTS service_requests (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES users(id),
    mechanic_id BIGINT REFERENCES mechanics(id),
    problem_type VARCHAR(30) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES service_requests(id),
    mechanic_id BIGINT NOT NULL REFERENCES mechanics(id),
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mechanics_available
    ON mechanics (available)
    WHERE current_lat IS NOT NULL AND current_lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_driver ON service_requests (driver_id);
CREATE INDEX IF NOT EXISTS idx_requests_mechanic ON service_requests (mechanic_id);
