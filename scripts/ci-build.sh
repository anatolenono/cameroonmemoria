#!/bin/bash

# CI build: generate Prisma client and build Next.js (no DB migrations)

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js..."
next build
