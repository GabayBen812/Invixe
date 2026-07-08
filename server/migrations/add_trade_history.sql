-- Trade history for buy/sell actions (portfolio-first cash economy)

CREATE TABLE IF NOT EXISTS "TradeHistory" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid UUID REFERENCES "User"(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  symbol TEXT NOT NULL,
  shares INTEGER NOT NULL CHECK (shares > 0),
  price DECIMAL NOT NULL CHECK (price > 0),
  total DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_history_userid_created
  ON "TradeHistory"(userid, created_at DESC);

ALTER TABLE "TradeHistory" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'TradeHistory'
      AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users"
      ON "TradeHistory" FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'TradeHistory'
      AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users"
      ON "TradeHistory" FOR INSERT WITH CHECK (true);
  END IF;
END $$;
