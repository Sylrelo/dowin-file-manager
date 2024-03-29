<div align="center">

![GitHub last commit (release)](https://img.shields.io/github/last-commit/Sylrelo/dowin-file-manager/release?label=last%20release%20commit&style=for-the-badge)
![GitHub last commit (dev)](https://img.shields.io/github/last-commit/Sylrelo/dowin-file-manager/dev?label=last%20dev%20commit&style=for-the-badge)

</div>

<div align="center">

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Sylrelo/dowin-file-manager)
![Docker Pulls](https://img.shields.io/docker/pulls/sylrelo/dowin-file-manager)
![Docker Image Size (tag)](https://img.shields.io/docker/image-size/sylrelo/dowin-file-manager/latest)

</div>

# Dowin File Manager

Dowin File Manager is a web-based file and server manager written in Node and Svelte

## Screenshots

![screenshot](_git-resources/screen.png)
![screenshot](_git-resources/screen-2.png)

## Current and planned features

Don't hesitate to create a new issue if you encounter any problems or want to request a specific feature.

This list is non-exhaustive and will grow larger during the developpement :

- ✅ Multi-window file browsing
- ✅ File action
  - ✅ Rename
  - ✅ Delete
- ✅ File drag
  - ✅ Copy (with progress)
  - ✅ Move (with progress)
- ⚪ File and folder upload (drop)
  - ✅ Firefox
  - ⚪ Chromium based browser (folders not working yet)
- ⚪ User managing
  - ✅ Login
  - 🔴 Two Factor Authentication
  - ✅ Creation
  - ✅ Edition / Deletion
- ⚪ Compatibility
  - ⚪ MacOS
  - ⚪ Linux
  - 🔴 Windows
- 🔴 Theme customization
- 🔴 Public sharing
- 🔴 Thumbnail
- 🔴 File viewer
  - 🔴 Image + Basic Editor
  - 🔴 Video + Basic Editor
  - 🔴 Sound
  - 🔴 Documents
  - 🔴 3D Objects
  - 🔴 Code Editor
- 🔴 Group authorization
  - 🔴 read/write access per directory
- 🔴 Mobile UI
- 🔴 Real database instead of json
  - 🔴 MySQL ?
  - 🔴 PostgreSQL ?
  - 🔴 SQLite ?

| ✅ - Done | ⚪ - Partially done | 🔵 - Working on it | 🔴 - Not yet implemented |
| --------- | ------------------- | ------------------ | ------------------------ |

## Try it with Docker !

### Quick run

https://hub.docker.com/r/sylrelo/dowin-file-manager

Tags :

- `latest` for the latest release
- `dev-latest` for the latest development version
- `bYYMMDD` for a specific dev version

```bash
docker run \
-p 3000:3000 \
-v /Users/user/Downloads:/manager/downloads \
-v ./database:/backend/database \
sylrelo/dowin-file-manager:latest
```

```yml
version: "3.0"

services:
  dowin-file-manager:
    image: sylrelo/dowin-file-manager:latest
    volumes:
      - /Users/:/manager/Users
      - database:/backend/database
    environment:
      - FM_PATH_PREFIX=/
    ports:
      - 3000:3000
volumes:
  database:
```

ℹ️ Volumes mounted inside /manager directory will automatically be visible in the leftbar.

ℹ️ Don't forget to bind the database folder to keep your data.

**⚠️ At first launch, a random password for the Admin account will be generated and printed in the console.**

```
info Start Using "/" path prefix.
info Default account Default "Admin" account created with password "4tynah". Don't forget to change it.
```

### Available environment variables

| Variable           | Description                                             | Default |
| ------------------ | ------------------------------------------------------- | ------- |
| **FM_PATH_PREFIX** | Path prefix for all queries, usefull for reverse proxy. | `/`     |

## Build it !

### Dependencies

- NodeJS 19.0 min, 20.10 recommended.

### Executing program

#### Backend

```sh
cd backend
npm install
npm run watch
```

### Front

```sh
cd front
npm install
npm run dev
```
