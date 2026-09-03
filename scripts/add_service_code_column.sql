-- Add service_code column to service_masters table
-- This column is needed for the mobile app filtering logic
-- Date: August 31, 2026

-- Step 1: Add the column
ALTER TABLE service_masters 
ADD COLUMN service_code VARCHAR(100) AFTER slug;

-- Step 2: Update existing records with appropriate service codes
UPDATE service_masters SET service_code = 'PRESS' WHERE name LIKE '%Iron Only%' OR name LIKE '%Steam Press%';
UPDATE service_masters SET service_code = 'WASH_IRON' WHERE name LIKE '%Wash%Iron%' OR name LIKE '%Wash%Fold%';
UPDATE service_masters SET service_code = 'DRY_CLEAN' WHERE name LIKE '%Dry Clean%';
UPDATE service_masters SET service_code = 'SAREE_POLISH' WHERE name LIKE '%Saree%Polish%' OR name LIKE '%Charak%';
UPDATE service_masters SET service_code = 'STARCH' WHERE name LIKE '%Starch%';
UPDATE service_masters SET service_code = 'SHOE_SPA' WHERE name LIKE '%Shoe%' OR name LIKE '%Leather%';
UPDATE service_masters SET service_code = 'EXPRESS' WHERE name LIKE '%Express%' OR name LIKE '%Emergency%';

-- Step 3: Verify the updates
SELECT id, name, slug, service_code FROM service_masters ORDER BY service_code;

-- Step 4: Add index for better query performance
CREATE INDEX idx_service_code ON service_masters(service_code);

-- Expected output:
-- All records should now have service_code values
-- Common codes: PRESS, WASH_IRON, DRY_CLEAN, SAREE_POLISH, STARCH, SHOE_SPA, EXPRESS
