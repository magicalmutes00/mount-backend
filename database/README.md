# Database Deployment Guide

## Database Structure
This folder contains all database-related files for the Devasahayam Mount Shrine website.

### Files:
- `schema.sql` - Complete database schema with all tables
- `sample_data.sql` - Sample data for testing (optional)
- `backup_restore.md` - Instructions for backup and restore
- `environment_setup.md` - Environment configuration guide

### Database Name: `shrine_db`

### Required PostgreSQL Version: 12+

## Quick Setup:
1. Create database: `createdb shrine_db`
2. Run schema: `psql -U postgres shrine_db < schema.sql`
3. (Optional) Load sample data: `psql -U postgres shrine_db < sample_data.sql`

## For Production Deployment:
See `backup_restore.md` for detailed instructions.