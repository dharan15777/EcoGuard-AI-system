#!/usr/bin/env bash
echo "🚀 Building EcoGuard Production Docker Containers..."
docker-compose -f docker/docker-compose.yml up -d --build
