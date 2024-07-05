## Project Introduction

Trix is a custom version control system designed to manage and track changes to files within a repository. It offers functionality similar to Git, allowing users to initialize repositories, add files, create commits, and view commit histories and differences between commits. This project demonstrates the core concepts of version control using Node.js.

## Dependencies

1. **dns**: Provides functions for DNS lookups and name resolution.
2. **path**: Used for handling and transforming file paths.
3. **fs/promises**: Offers promise-based versions of the file system (fs) methods.
4. **crypto**: Used for generating SHA-1 hashes for file contents and commits.
5. **diff**: Provides tools for comparing differences between file contents.
6. **chalk**: Enables coloring and styling of terminal output.
7. **commander**: Facilitates the creation of command-line interfaces.

## Key Features

1. **Repository Initialization**: Creates a new `.trix` directory with subdirectories and essential files.
2. **File Addition**: Adds files to the staging area by reading file contents, generating hashes, and storing them.
3. **Commit Creation**: Commits changes with a message, timestamp, and references to parent commits.
4. **Commit History Log**: Displays the log of commits with details including commit hash, timestamp, and message.
5. **Commit Differences**: Shows differences between files in the current and parent commits, with color-coded outputs.

## Example Usage

- Initialize a repository: `./trix.mjs init`
- Add a file: `./trix.mjs add <file>`
- Commit changes: `./trix.mjs commit <message>`
- View commit log: `./trix.mjs log`
- Show commit differences: `./trix.mjs show <commitHash>`

## How to Run

1. Ensure you have Node.js installed.
2. Clone the repository.
3. Install dependencies using `npm install`.
4. Use the command-line interface to interact with Trix as shown in the example usage.

By following these steps, users can leverage Trix for version control in their projects, gaining a deeper understanding of how version control systems work under the hood.
