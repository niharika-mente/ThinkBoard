# Contributing to ThinkBoard 🧠

Thank you for your interest in contributing to **ThinkBoard**!

ThinkBoard is a modern full-stack brainstorming and idea-tracking platform built using the MERN stack. It helps users organize, manage, and develop ideas through a clean interface backed by a scalable API architecture.

Whether you're improving the frontend experience, optimizing backend performance, enhancing security, fixing bugs, or improving documentation, your contributions are highly appreciated.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Fork & Clone the Repository](#fork--clone-the-repository)
  - [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contribution Areas](#contribution-areas)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Good First Contributions](#good-first-contributions)
- [Need Help?](#need-help)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive.
- Provide constructive feedback.
- Collaborate professionally.
- Welcome contributors of all skill levels.
- Help maintain a positive open-source environment.

---

## Getting Started

### Fork & Clone the Repository

#### 1. Fork the repository

Click the **Fork** button on GitHub.

#### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/ThinkBoard.git
cd ThinkBoard
```

#### 3. Add the upstream remote

```bash
git remote add upstream https://github.com/niharika-mente/ThinkBoard.git
```

#### 4. Verify remotes

```bash
git remote -v
```

#### 5. Keep your fork updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Development Setup

### Prerequisites

| Tool | Version |
|--------|----------|
| Node.js | 16+ |
| npm / yarn | Latest |
| MongoDB | Latest |
| Git | Latest |
| Upstash Redis | Required |

---

### Install Dependencies

Install all dependencies from the project root:

```bash
npm run build
```

This installs both frontend and backend dependencies.

---

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

UPSTASH_REDIS_REST_URL=your_upstash_redis_url

UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

---

### Run the Backend

```bash
cd backend
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

---

### Run the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Project Structure

```text
ThinkBoard/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── package.json
```

---

## Contribution Areas

We welcome contributions in:

### Frontend

- UI/UX improvements
- Responsive design enhancements
- Accessibility improvements
- DaisyUI component optimization
- Tailwind styling improvements

### Backend

- API optimization
- Validation improvements
- Error handling enhancements
- Database query optimization
- Security improvements

### Database

- MongoDB schema improvements
- Index optimization
- Data validation enhancements

### Redis & Rate Limiting

- Upstash Redis optimization
- Rate limiting improvements
- Request management enhancements

### Documentation

- README improvements
- API documentation
- Setup guides
- Developer onboarding guides

---

## Branch Naming Conventions

Never commit directly to `main`.

Create a dedicated branch:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```text
feature/idea-search

feature/dark-mode

feature/idea-categories

bugfix/rate-limit-error

bugfix/mobile-layout

docs/update-readme

refactor/api-structure

style/dashboard-redesign
```

---

## Coding Standards

### Backend (Node.js & Express)

- Follow REST API conventions.
- Keep controllers modular.
- Handle errors appropriately.
- Use meaningful variable and function names.

### Frontend (React)

- Use functional components.
- Keep components reusable.
- Avoid duplicate logic.
- Follow React best practices.

### Tailwind & DaisyUI

- Maintain consistency with existing design patterns.
- Ensure responsive layouts.
- Avoid excessive custom styling when existing utilities are available.

### Database

- Validate inputs before database operations.
- Use efficient queries whenever possible.

---

## Commit Message Guidelines

Follow Conventional Commits:

```text
type(scope): short description
```

Examples:

```text
feat(ideas): add idea category filtering

feat(ui): implement dark mode support

fix(api): resolve duplicate idea creation

fix(redis): improve rate limiting logic

docs(readme): update setup instructions

refactor(routes): simplify idea routes
```

---

## Pull Request Process

### Before Submitting

Ensure:

- [ ] Backend runs successfully
- [ ] Frontend builds successfully
- [ ] No console errors
- [ ] No linting issues
- [ ] Changes tested locally
- [ ] Documentation updated if necessary
- [ ] Related issue linked

---

### Push Your Branch

```bash
git push origin your-branch-name
```

---

### Open a Pull Request

Create a Pull Request against the `main` branch.

Include:

- What changed
- Why it changed
- Screenshots (for UI changes)
- Related issue number

Example:

```text
feat(ideas): add idea search functionality

Fixes #18
```

---

## Pull Request Checklist

Before submitting:

- [ ] Code follows project standards
- [ ] No unused dependencies added
- [ ] Responsive design verified
- [ ] No console warnings/errors
- [ ] Environment variables documented
- [ ] Documentation updated
- [ ] Issue linked

---

## Reporting Issues

When reporting a bug, include:

- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser information
- Screenshots (if applicable)
- Error logs

---

## Feature Requests

Please include:

- Problem statement
- Proposed solution
- Expected benefits
- Alternative approaches considered

---

## Good First Contributions

New contributors can start with:

- Documentation improvements
- Responsive design fixes
- Accessibility enhancements
- UI polishing
- Error handling improvements
- Component refactoring
- Loading states
- Form validation enhancements

---

## Need Help?

If you have questions:

- Review existing issues first.
- Read the project documentation.
- Open a discussion or issue.
- Ask maintainers before making large architectural changes.

---

## Maintainer

**Niharika Mente**

Project Vision:

- Modern brainstorming platform
- Collaborative idea organization
- Scalable MERN architecture
- Developer-friendly contribution ecosystem

---

Thank you for contributing to **ThinkBoard**! 🎉

Every contribution helps improve the platform and makes idea management more accessible, organized, and efficient for users everywhere.

Happy Coding! 🚀
