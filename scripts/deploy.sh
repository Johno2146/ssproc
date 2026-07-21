#!/bin/bash
cd /home/team/shared/backend
echo "=== SEEDING DATABASE ==="
npx prisma db seed 2>&1
echo "=== SEED DONE ==="
echo "=== BUILDING ==="
sudo rm -rf .next
npm run build 2>&1 | tail -30
echo "=== BUILD DONE ==="
