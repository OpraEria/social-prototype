-- Create push_subscriptions table for storing user notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    bruker_id INT PRIMARY KEY REFERENCES bruker(bruker_id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
