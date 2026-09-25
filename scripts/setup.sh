#!/usr/bin/env bash
echo "🌱 Setting up EcoGuard AI System Environment..."
npm install
cd frontend && npm install && cd ..
echo "✅ Setup Complete! Run 'npm start' or 'node scripts/simulator.js'"
