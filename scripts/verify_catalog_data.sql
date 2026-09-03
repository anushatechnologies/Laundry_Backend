-- Catalog Data Verification Script
-- Run this to diagnose why "Wash & Fold" shows 0 items
-- Date: August 31, 2026

-- =====================================================
-- CHECK 1: Verify Men's Clothes Exist
-- =====================================================
SELECT 
  '=== CHECK 1: Men\'s Clothes ===' as check_name,
  COUNT(*) as total_mens_items
FROM cloth_types 
WHERE UPPER(categoryTag) = 'MENS';

SELECT 
  id, 
  name, 
  categoryTag, 
  subcategory,
  description
FROM cloth_types 
WHERE UPPER(categoryTag) = 'MENS'
ORDER BY subcategory, name
LIMIT 20;

-- =====================================================
-- CHECK 2: Verify All Service Masters
-- =====================================================
SELECT 
  '=== CHECK 2: Service Masters ===' as check_name,
  COUNT(*) as total_services
FROM service_masters;

SELECT 
  id, 
  name, 
  serviceCode,
  description
FROM service_masters 
ORDER BY serviceCode;

-- =====================================================
-- CHECK 3: Verify "Wash & Iron" Service Exists
-- =====================================================
SELECT 
  '=== CHECK 3: Wash & Iron Service ===' as check_name,
  id,
  name,
  serviceCode
FROM service_masters 
WHERE serviceCode = 'WASH_IRON' 
   OR UPPER(name) LIKE '%WASH%IRON%'
   OR UPPER(name) LIKE '%WASH%FOLD%';

-- =====================================================
-- CHECK 4: Verify Price Matrix for Men's + Wash & Iron
-- =====================================================
SELECT 
  '=== CHECK 4: Men\'s + Wash & Iron Pricing ===' as check_name,
  COUNT(*) as total_price_entries
FROM price_matrix pm
JOIN cloth_types ct ON pm.clothTypeId = ct.id
JOIN service_masters sm ON pm.serviceId = sm.id
WHERE UPPER(ct.categoryTag) = 'MENS'
  AND sm.serviceCode = 'WASH_IRON';

SELECT 
  pm.id as price_id,
  ct.name as garment_name,
  ct.categoryTag,
  ct.subcategory,
  sm.name as service_name,
  sm.serviceCode,
  pm.price,
  pm.unit
FROM price_matrix pm
JOIN cloth_types ct ON pm.clothTypeId = ct.id
JOIN service_masters sm ON pm.serviceId = sm.id
WHERE UPPER(ct.categoryTag) = 'MENS'
  AND sm.serviceCode = 'WASH_IRON'
ORDER BY pm.price DESC
LIMIT 20;

-- =====================================================
-- CHECK 5: Find Men's Items with NO Wash & Iron Pricing
-- =====================================================
SELECT 
  '=== CHECK 5: Men\'s Items Missing Wash & Iron ===' as check_name,
  COUNT(*) as missing_wash_iron_pricing
FROM cloth_types ct
WHERE UPPER(ct.categoryTag) = 'MENS'
  AND ct.id NOT IN (
    SELECT DISTINCT pm.clothTypeId
    FROM price_matrix pm
    JOIN service_masters sm ON pm.serviceId = sm.id
    WHERE sm.serviceCode = 'WASH_IRON'
  );

-- Show specific items missing pricing
SELECT 
  ct.id,
  ct.name,
  ct.categoryTag,
  ct.subcategory,
  'MISSING WASH_IRON PRICING' as issue
FROM cloth_types ct
WHERE UPPER(ct.categoryTag) = 'MENS'
  AND ct.id NOT IN (
    SELECT DISTINCT pm.clothTypeId
    FROM price_matrix pm
    JOIN service_masters sm ON pm.serviceId = sm.id
    WHERE sm.serviceCode = 'WASH_IRON'
  )
LIMIT 20;

-- =====================================================
-- CHECK 6: Verify All Services for Sample Men's Items
-- =====================================================
SELECT 
  '=== CHECK 6: Services Available for Sample Men\'s Items ===' as check_name;

SELECT 
  ct.name as garment_name,
  sm.name as service_name,
  sm.serviceCode,
  pm.price
FROM cloth_types ct
JOIN price_matrix pm ON ct.id = pm.clothTypeId
JOIN service_masters sm ON pm.serviceId = sm.id
WHERE UPPER(ct.categoryTag) = 'MENS'
ORDER BY ct.name, sm.serviceCode
LIMIT 50;

-- =====================================================
-- CHECK 7: Check for Incorrect Service Codes
-- =====================================================
SELECT 
  '=== CHECK 7: Service Code Issues ===' as check_name;

-- Find any non-standard service codes
SELECT DISTINCT
  serviceCode,
  COUNT(*) as usage_count
FROM service_masters
GROUP BY serviceCode
ORDER BY serviceCode;

-- =====================================================
-- CHECK 8: Verify Women's Items (Control Group)
-- =====================================================
SELECT 
  '=== CHECK 8: Women\'s Items (Control Group) ===' as check_name,
  COUNT(*) as total_womens_items
FROM cloth_types 
WHERE UPPER(categoryTag) IN ('WOMENS', 'WOMEN');

SELECT 
  ct.name as garment_name,
  sm.name as service_name,
  sm.serviceCode,
  pm.price
FROM cloth_types ct
JOIN price_matrix pm ON ct.id = pm.clothTypeId
JOIN service_masters sm ON pm.serviceId = sm.id
WHERE UPPER(ct.categoryTag) IN ('WOMENS', 'WOMEN')
  AND sm.serviceCode = 'WASH_IRON'
ORDER BY pm.price DESC
LIMIT 10;

-- =====================================================
-- CHECK 9: Summary Statistics
-- =====================================================
SELECT 
  '=== CHECK 9: Summary Statistics ===' as check_name;

SELECT 
  'Total Cloth Types' as metric,
  COUNT(*) as value
FROM cloth_types
UNION ALL
SELECT 
  'Total Service Masters' as metric,
  COUNT(*) as value
FROM service_masters
UNION ALL
SELECT 
  'Total Price Matrix Entries' as metric,
  COUNT(*) as value
FROM price_matrix
UNION ALL
SELECT 
  'Men\'s Cloth Types' as metric,
  COUNT(*) as value
FROM cloth_types WHERE UPPER(categoryTag) = 'MENS'
UNION ALL
SELECT 
  'Men\'s Items with Wash & Iron' as metric,
  COUNT(DISTINCT pm.clothTypeId) as value
FROM price_matrix pm
JOIN cloth_types ct ON pm.clothTypeId = ct.id
JOIN service_masters sm ON pm.serviceId = sm.id
WHERE UPPER(ct.categoryTag) = 'MENS'
  AND sm.serviceCode = 'WASH_IRON';

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
/*
IF CHECK 1 returns 0 rows:
  → No Men's items in database at all
  → Need to seed cloth_types with Men's garments

IF CHECK 3 returns 0 rows:
  → "Wash & Iron" service doesn't exist
  → Need to add service_masters entry with serviceCode='WASH_IRON'

IF CHECK 4 returns 0 rows:
  → No pricing for Men's + Wash & Iron combination
  → Need to add price_matrix entries linking Men's cloths to Wash & Iron service

IF CHECK 5 returns many rows:
  → Many Men's items missing Wash & Iron pricing
  → Need bulk price_matrix inserts

SOLUTION: If any checks fail, run the data seeding scripts:
  - backend/scripts/seed_cloth_types.sql
  - backend/scripts/seed_service_masters.sql
  - backend/scripts/seed_price_matrix.sql
*/
