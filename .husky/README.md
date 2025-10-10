# Husky pre-commit hook

This project uses Husky to enforce code quality checks before each commit.

## What the pre-commit hook does

- Runs ESLint with auto-fix via the project script:
  - `yarn lint` → `eslint . --ext .js,.ts,.jsx,.tsx --fix`
- Re-stages files after fixes (`git add .`) so fixes are included in the commit.
- Prevents empty commits:
  - If there are no staged changes after linting/fixes, the commit is aborted unless explicitly allowed.

## Install / setup

Husky is installed automatically on `postinstall` and `prepare`:

```json
{
  "scripts": {
    "postinstall": "husky install",
    "prepare": "husky install"
  }
}
```

## Usage

- Commit as usual:

```bash
git add <files>
git commit -m "feat: update component"
```

- The hook will:
  - run ESLint with fixes
  - re-stage fixed files
  - abort if nothing is staged (unless overridden)

## Skipping / overrides

- Skip Husky for a single commit (not recommended):

```bash
HUSKY=0 git commit -m "wip: bypass hooks"
```

- Allow an intentional empty commit:

```bash
ALLOW_EMPTY_COMMIT=1 git commit --allow-empty -m "chore: bump build id"
```

## Running lint locally

- Run the same lint command manually:

```bash
yarn lint
```
