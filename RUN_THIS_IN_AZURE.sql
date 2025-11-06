-- Run this SQL in Azure Portal Query Editor or your PostgreSQL client
-- This creates the table needed for push notification subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
    bruker_id INT PRIMARY KEY,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (bruker_id) REFERENCES bruker(bruker_id) ON DELETE CASCADE
);

-- Verify the table was created
SELECT * FROM push_subscriptions LIMIT 5;
