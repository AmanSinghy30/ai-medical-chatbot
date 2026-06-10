# AI Medical Chatbot

A full-stack medical consultation platform built with React, Node.js, and MongoDB.

## Architecture
Vertical slice architecture ensuring each feature (Auth, Chat, Appointments) is self-contained from DB models up to the UI components.

## Database Schema
- **User**: Authentication, roles, preferences.
- **Message/ChatSession**: Chat history with AI.
- **Appointments**: Scheduling data with Doctors.
- **Reports**: Uploaded medical PDFs.

## API Contracts
RESTful endpoints documented via vertical slices (e.g., `/api/auth`, `/api/chat`, `/api/doctors`).
