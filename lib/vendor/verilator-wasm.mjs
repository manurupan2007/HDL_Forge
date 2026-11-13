// Vendored from verilator-wasm@1.0.0 (https://github.com/wavedrom/verilator-wasm),
// dist/index.mjs, lightly patched for browser bundling:
//   - readUrl() no longer reaches into node:fs (Node-only file reads);
//   - loadWasmBytes() only uses an explicit wasmUrl (no relative .wasm discovery);
//   - the in-memory VFS provides /dev/null, /dev/zero, /dev/stdout and
//     /dev/stderr as discard sinks so Verilator's --lint-only output stage
//     (which writes to /dev/null) succeeds in the browser.
// License: MIT AND (LGPL-3.0-only OR Artistic-2.0).
// lib/vfs.mjs
var FILETYPE_UNKNOWN = 0;
var FILETYPE_DIRECTORY = 3;
var FILETYPE_REGULAR_FILE = 4;
var ERRNO = {
  SUCCESS: 0,
  EACCES: 2,
  EBADF: 8,
  EEXIST: 20,
  EFAULT: 21,
  EINVAL: 28,
  EISDIR: 31,
  ENOENT: 44,
  ENOSYS: 52,
  ENOTDIR: 54,
  ENOTEMPTY: 55,
  ENOTCAPABLE: 76,
  EPERM: 63,
  ESPIPE: 70
};
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var decodeText = (bytes) => decoder.decode(bytes);
var encodeText = (text) => encoder.encode(text);
var vfsError = (errno, message) => Object.assign(new Error(message || "vfs errno " + errno), { errno, isVfsError: true });
var isVfsError = (err) => Boolean(err && err.isVfsError);
var nowNs = () => BigInt(Date.now()) * 1000000n;
var splitPath = (pathStr) => pathStr.split("/").filter((part) => part.length > 0);
var createVfs = () => {
  let nextIno = 1n;
  const makeDir = (parent, name) => ({
    type: "dir",
    ino: nextIno++,
    name,
    parent,
    entries: /* @__PURE__ */ new Map(),
    atim: nowNs(),
    mtim: nowNs(),
    ctim: nowNs()
  });
  const makeFile = (parent, name) => ({
    type: "file",
    ino: nextIno++,
    name,
    parent,
    data: new Uint8Array(0),
    size: 0,
    atim: nowNs(),
    mtim: nowNs(),
    ctim: nowNs()
  });
  const root = makeDir(null, "");
  const dirty = /* @__PURE__ */ new Set();
  const dev = makeDir(root, "dev");
  root.entries.set("dev", dev);
  for (const devName of ["null", "zero", "stdout", "stderr"]) {
    const devNode = makeFile(dev, devName);
    devNode.nullDev = true;
    dev.entries.set(devName, devNode);
  }
  const pathOf = (node, base = root) => {
    const parts = [];
    for (let cursor = node; cursor && cursor !== base; cursor = cursor.parent) {
      parts.unshift(cursor.name);
    }
    return parts.join("/");
  };
  const lookup = (base, pathStr) => {
    let node = pathStr.startsWith("/") ? root : base;
    for (const part of splitPath(pathStr)) {
      if (part === ".") {
        continue;
      }
      if (part === "..") {
        node = node.parent || root;
        continue;
      }
      if (node.type !== "dir") {
        throw vfsError(ERRNO.ENOTDIR, "not a directory: " + pathStr);
      }
      const next = node.entries.get(part);
      if (next === void 0) {
        throw vfsError(ERRNO.ENOENT, "no such file or directory: " + pathStr);
      }
      node = next;
    }
    return node;
  };
  const resolveParent = (base, pathStr) => {
    const parts = splitPath(pathStr);
    if (parts.length === 0) {
      throw vfsError(ERRNO.EINVAL, "empty path");
    }
    const name = parts[parts.length - 1];
    const dirPath = (pathStr.startsWith("/") ? "/" : "") + parts.slice(0, -1).join("/");
    const dir = lookup(base, dirPath || ".");
    if (dir.type !== "dir") {
      throw vfsError(ERRNO.ENOTDIR, "not a directory: " + dirPath);
    }
    if (name === "." || name === "..") {
      throw vfsError(ERRNO.EINVAL, "invalid final component: " + pathStr);
    }
    return { dir, name };
  };
  const mkdir = (base, pathStr) => {
    const { dir, name } = resolveParent(base, pathStr);
    if (dir.entries.has(name)) {
      throw vfsError(ERRNO.EEXIST, "exists: " + pathStr);
    }
    const node = makeDir(dir, name);
    dir.entries.set(name, node);
    dir.mtim = nowNs();
    return node;
  };
  const mkdirp = (base, pathStr) => {
    let node = pathStr.startsWith("/") ? root : base;
    for (const part of splitPath(pathStr)) {
      if (part === ".") {
        continue;
      }
      if (part === "..") {
        node = node.parent || root;
        continue;
      }
      const existing = node.entries.get(part);
      if (existing === void 0) {
        const created = makeDir(node, part);
        node.entries.set(part, created);
        node = created;
      } else if (existing.type === "dir") {
        node = existing;
      } else {
        throw vfsError(ERRNO.ENOTDIR, "not a directory: " + pathStr);
      }
    }
    return node;
  };
  const createFile = (base, pathStr, { exclusive = false } = {}) => {
    const { dir, name } = resolveParent(base, pathStr);
    const existing = dir.entries.get(name);
    if (existing !== void 0) {
      if (exclusive) {
        throw vfsError(ERRNO.EEXIST, "exists: " + pathStr);
      }
      if (existing.type !== "file") {
        throw vfsError(ERRNO.EISDIR, "is a directory: " + pathStr);
      }
      return existing;
    }
    const node = makeFile(dir, name);
    dir.entries.set(name, node);
    dir.mtim = nowNs();
    dirty.add(node);
    return node;
  };
  const unlink = (base, pathStr) => {
    const { dir, name } = resolveParent(base, pathStr);
    const node = dir.entries.get(name);
    if (node === void 0) {
      throw vfsError(ERRNO.ENOENT, "no such file: " + pathStr);
    }
    if (node.type === "dir" && node.entries.size > 0) {
      throw vfsError(ERRNO.ENOTEMPTY, "not empty: " + pathStr);
    }
    dir.entries.delete(name);
    dir.mtim = nowNs();
    dirty.delete(node);
  };
  const truncate = (node) => {
    if (node.nullDev) {
      return;
    }
    node.data = new Uint8Array(0);
    node.size = 0;
    node.mtim = nowNs();
    dirty.add(node);
  };
  const write = (node, offset, bytes) => {
    if (node.nullDev) {
      return bytes.length;
    }
    const end = offset + bytes.length;
    if (end > node.data.length) {
      const capacity = Math.max(end, node.data.length * 2, 1024);
      const grown = new Uint8Array(capacity);
      grown.set(node.data.subarray(0, node.size));
      node.data = grown;
    }
    node.data.set(bytes, offset);
    node.size = Math.max(node.size, end);
    node.mtim = nowNs();
    dirty.add(node);
    return bytes.length;
  };
  const read = (node, offset, length) => {
    if (offset >= node.size) {
      return new Uint8Array(0);
    }
    return node.data.subarray(offset, Math.min(node.size, offset + length));
  };
  const setTimes = (node, atim, mtim) => {
    if (atim !== null) {
      node.atim = atim;
    }
    if (mtim !== null) {
      node.mtim = mtim;
    }
  };
  const filetype = (node) => {
    if (node.type === "dir") {
      return FILETYPE_DIRECTORY;
    }
    if (node.type === "file") {
      return FILETYPE_REGULAR_FILE;
    }
    return FILETYPE_UNKNOWN;
  };
  const readdir = (node) => {
    if (node.type !== "dir") {
      throw vfsError(ERRNO.ENOTDIR, "not a directory");
    }
    const entries = [
      { name: ".", node },
      { name: "..", node: node.parent || node }
    ];
    for (const [name, child] of node.entries) {
      entries.push({ name, node: child });
    }
    return entries;
  };
  const writeFile = (base, pathStr, contents) => {
    const parts = splitPath(pathStr);
    if (parts.length > 1) {
      mkdirp(base, parts.slice(0, -1).join("/"));
    }
    const node = createFile(base, pathStr);
    const bytes = typeof contents === "string" ? encodeText(contents) : new Uint8Array(contents);
    node.data = bytes;
    node.size = bytes.length;
    node.mtim = nowNs();
    dirty.add(node);
    return node;
  };
  const readFile = (base, pathStr) => {
    const node = lookup(base, pathStr);
    if (node.type !== "file") {
      throw vfsError(ERRNO.EISDIR, "is a directory: " + pathStr);
    }
    return node.data.subarray(0, node.size);
  };
  const markClean = () => dirty.clear();
  const dirtyFiles = (base = root, { exclude = [] } = {}) => {
    const out = {};
    for (const node of dirty) {
      if (node.type !== "file") {
        continue;
      }
      const key = pathOf(node, base);
      if (key === "" || exclude.some((prefix) => key === prefix || key.startsWith(prefix + "/"))) {
        continue;
      }
      out[key] = node.data.subarray(0, node.size);
    }
    return out;
  };
  return {
    root,
    pathOf,
    lookup,
    resolveParent,
    mkdir,
    mkdirp,
    createFile,
    unlink,
    truncate,
    write,
    read,
    setTimes,
    filetype,
    readdir,
    writeFile,
    readFile,
    markClean,
    dirtyFiles
  };
};

// lib/wasi.mjs
var FILETYPE_CHARACTER_DEVICE = 2;
var O_CREAT = 1;
var O_DIRECTORY = 2;
var O_EXCL = 4;
var O_TRUNC = 8;
var FILESTAT_SET_ATIM = 1;
var FILESTAT_SET_ATIM_NOW = 2;
var FILESTAT_SET_MTIM = 4;
var FILESTAT_SET_MTIM_NOW = 8;
var WHENCE_SET = 0;
var WHENCE_CUR = 1;
var WHENCE_END = 2;
var RIGHTS_ALL = (1n << 64n) - 1n;
var FD_STDIN = 0;
var FD_STDOUT = 1;
var FD_STDERR = 2;
var FD_PREOPEN = 3;
var DIRENT_SIZE = 24;
var exitSentinel = (code) => Object.assign(new Error("wasi proc_exit(" + code + ")"), { exitCode: code, isExitSentinel: true });
var isExitSentinel = (err) => Boolean(err && err.isExitSentinel);
var concat = (chunks) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
};
var defaultRandom = (target) => {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    for (let offset = 0; offset < target.length; offset += 65536) {
      globalThis.crypto.getRandomValues(target.subarray(offset, Math.min(target.length, offset + 65536)));
    }
    return;
  }
  for (let i = 0; i < target.length; i++) {
    target[i] = Math.floor(Math.random() * 256);
  }
};
var createWasi = ({
  vfs,
  mountNode,
  mountName = "/",
  args = [],
  env = {},
  onStdout = null,
  onStderr = null,
  now = () => Date.now(),
  random = defaultRandom
}) => {
  const mount = mountNode || vfs.root;
  const stdoutChunks = [];
  const stderrChunks = [];
  const fds = /* @__PURE__ */ new Map([
    [FD_STDIN, { kind: "stdin" }],
    [FD_STDOUT, { kind: "stdout" }],
    [FD_STDERR, { kind: "stderr" }],
    [FD_PREOPEN, { kind: "dir", node: mount, preopen: mountName, offset: 0 }]
  ]);
  let nextFd = FD_PREOPEN + 1;
  let memory = null;
  let exitCode = null;
  const view = () => new DataView(memory.buffer);
  const bytes = () => new Uint8Array(memory.buffer);
  const readString = (ptr, len) => decodeText(bytes().subarray(ptr, ptr + len));
  const getFd = (fd) => {
    const entry = fds.get(fd);
    if (entry === void 0) {
      throw Object.assign(new Error("bad fd " + fd), { errno: ERRNO.EBADF, isVfsError: true });
    }
    return entry;
  };
  const getDirNode = (fd) => {
    const entry = getFd(fd);
    if (entry.kind !== "dir") {
      throw Object.assign(
        new Error("fd " + fd + " is not a directory"),
        { errno: ERRNO.ENOTDIR, isVfsError: true }
      );
    }
    return entry.node;
  };
  const readIovs = (ptr, count) => {
    const dv = view();
    const mem = bytes();
    const out = [];
    for (let i = 0; i < count; i++) {
      const base = dv.getUint32(ptr + i * 8, true);
      const len = dv.getUint32(ptr + i * 8 + 4, true);
      out.push(mem.subarray(base, base + len));
    }
    return out;
  };
  const writeStd = (kind, iovs, nwrittenPtr) => {
    let total = 0;
    for (const chunk of iovs) {
      if (chunk.length === 0) {
        continue;
      }
      const copy = chunk.slice();
      total += copy.length;
      if (kind === "stdout") {
        stdoutChunks.push(copy);
        if (onStdout) {
          onStdout(decodeText(copy));
        }
      } else {
        stderrChunks.push(copy);
        if (onStderr) {
          onStderr(decodeText(copy));
        }
      }
    }
    view().setUint32(nwrittenPtr, total, true);
    return ERRNO.SUCCESS;
  };
  const wrap = (fn) => (...callArgs) => {
    try {
      return fn(...callArgs);
    } catch (err) {
      if (isExitSentinel(err)) {
        throw err;
      }
      if (isVfsError(err)) {
        return err.errno;
      }
      if (err instanceof RangeError || err instanceof TypeError) {
        return ERRNO.EFAULT;
      }
      throw err;
    }
  };
  const encodeStrings = (list) => {
    const encoded = list.map((s) => encodeText(s + "\0"));
    return { encoded, bufSize: encoded.reduce((sum, b) => sum + b.length, 0) };
  };
  const putStrings = (list, ptrArrayPtr, bufPtr) => {
    const dv = view();
    const mem = bytes();
    let cursor = bufPtr;
    encodeStrings(list).encoded.forEach((entry, index) => {
      dv.setUint32(ptrArrayPtr + index * 4, cursor, true);
      mem.set(entry, cursor);
      cursor += entry.length;
    });
    return ERRNO.SUCCESS;
  };
  const putSizes = (list, countPtr, bufSizePtr) => {
    const { encoded, bufSize } = encodeStrings(list);
    const dv = view();
    dv.setUint32(countPtr, encoded.length, true);
    dv.setUint32(bufSizePtr, bufSize, true);
    return ERRNO.SUCCESS;
  };
  const envStrings = () => Object.entries(env).map(([key, value]) => key + "=" + value);
  const writeFilestat = (ptr, node) => {
    const dv = view();
    dv.setBigUint64(ptr, 0n, true);
    dv.setBigUint64(ptr + 8, node.ino, true);
    dv.setUint8(ptr + 16, vfs.filetype(node));
    dv.setBigUint64(ptr + 24, 1n, true);
    dv.setBigUint64(ptr + 32, BigInt(node.type === "file" ? node.size : 0), true);
    dv.setBigUint64(ptr + 40, node.atim, true);
    dv.setBigUint64(ptr + 48, node.mtim, true);
    dv.setBigUint64(ptr + 56, node.ctim, true);
  };
  const writeFdstat = (ptr, filetype, fdflags) => {
    const dv = view();
    dv.setUint8(ptr, filetype);
    dv.setUint16(ptr + 2, fdflags, true);
    dv.setBigUint64(ptr + 8, RIGHTS_ALL, true);
    dv.setBigUint64(ptr + 16, RIGHTS_ALL, true);
  };
  const importObject = {
    wasi_snapshot_preview1: {
      args_sizes_get: wrap((countPtr, bufSizePtr) => putSizes(args, countPtr, bufSizePtr)),
      args_get: wrap((ptrArrayPtr, bufPtr) => putStrings(args, ptrArrayPtr, bufPtr)),
      environ_sizes_get: wrap((countPtr, bufSizePtr) => putSizes(envStrings(), countPtr, bufSizePtr)),
      environ_get: wrap((ptrArrayPtr, bufPtr) => putStrings(envStrings(), ptrArrayPtr, bufPtr)),
      clock_time_get: wrap((id, precision, timePtr) => {
        view().setBigUint64(timePtr, BigInt(Math.round(now() * 1e6)), true);
        return ERRNO.SUCCESS;
      }),
      poll_oneoff: wrap(() => ERRNO.ENOSYS),
      sched_yield: wrap(() => ERRNO.SUCCESS),
      fd_fdstat_set_flags: wrap((fd, flags) => {
        getFd(fd).fdflags = flags;
        return ERRNO.SUCCESS;
      }),
      random_get: wrap((bufPtr, len) => {
        random(bytes().subarray(bufPtr, bufPtr + len));
        return ERRNO.SUCCESS;
      }),
      proc_exit: (code) => {
        throw exitSentinel(code);
      },
      fd_close: wrap((fd) => {
        if (fd <= FD_PREOPEN) {
          return ERRNO.SUCCESS;
        }
        getFd(fd);
        fds.delete(fd);
        return ERRNO.SUCCESS;
      }),
      fd_fdstat_get: wrap((fd, statPtr) => {
        const entry = getFd(fd);
        if (entry.kind === "stdin" || entry.kind === "stdout" || entry.kind === "stderr") {
          writeFdstat(statPtr, FILETYPE_CHARACTER_DEVICE, 0);
          return ERRNO.SUCCESS;
        }
        writeFdstat(statPtr, vfs.filetype(entry.node), entry.fdflags || 0);
        return ERRNO.SUCCESS;
      }),
      fd_prestat_get: wrap((fd, prestatPtr) => {
        const entry = getFd(fd);
        if (entry.preopen === void 0) {
          return ERRNO.EBADF;
        }
        const dv = view();
        dv.setUint32(prestatPtr, 0, true);
        dv.setUint32(prestatPtr + 4, encodeText(entry.preopen).length, true);
        return ERRNO.SUCCESS;
      }),
      fd_prestat_dir_name: wrap((fd, pathPtr, pathLen) => {
        const entry = getFd(fd);
        if (entry.preopen === void 0) {
          return ERRNO.EBADF;
        }
        const name = encodeText(entry.preopen);
        if (name.length > pathLen) {
          return ERRNO.ENOTCAPABLE;
        }
        bytes().set(name, pathPtr);
        return ERRNO.SUCCESS;
      }),
      fd_write: wrap((fd, iovsPtr, iovsLen, nwrittenPtr) => {
        const entry = getFd(fd);
        const iovs = readIovs(iovsPtr, iovsLen);
        if (entry.kind === "stdout" || entry.kind === "stderr") {
          return writeStd(entry.kind, iovs, nwrittenPtr);
        }
        if (entry.kind !== "file") {
          return ERRNO.EISDIR;
        }
        let written = 0;
        for (const chunk of iovs) {
          written += vfs.write(entry.node, entry.offset + written, chunk);
        }
        entry.offset += written;
        view().setUint32(nwrittenPtr, written, true);
        return ERRNO.SUCCESS;
      }),
      fd_read: wrap((fd, iovsPtr, iovsLen, nreadPtr) => {
        const entry = getFd(fd);
        if (entry.kind === "stdin") {
          view().setUint32(nreadPtr, 0, true);
          return ERRNO.SUCCESS;
        }
        if (entry.kind !== "file") {
          return ERRNO.EISDIR;
        }
        let read = 0;
        for (const target of readIovs(iovsPtr, iovsLen)) {
          const chunk = vfs.read(entry.node, entry.offset + read, target.length);
          if (chunk.length === 0) {
            break;
          }
          target.set(chunk);
          read += chunk.length;
        }
        entry.offset += read;
        view().setUint32(nreadPtr, read, true);
        return ERRNO.SUCCESS;
      }),
      fd_seek: wrap((fd, offset, whence, newOffsetPtr) => {
        const entry = getFd(fd);
        if (entry.kind !== "file") {
          return ERRNO.ESPIPE;
        }
        const delta = Number(offset);
        let next;
        switch (whence) {
          case WHENCE_SET:
            next = delta;
            break;
          case WHENCE_CUR:
            next = entry.offset + delta;
            break;
          case WHENCE_END:
            next = entry.node.size + delta;
            break;
          default:
            return ERRNO.EINVAL;
        }
        if (next < 0) {
          return ERRNO.EINVAL;
        }
        entry.offset = next;
        view().setBigUint64(newOffsetPtr, BigInt(next), true);
        return ERRNO.SUCCESS;
      }),
      fd_readdir: wrap((fd, bufPtr, bufLen, cookie, bufUsedPtr) => {
        const entries = vfs.readdir(getDirNode(fd));
        const dv = view();
        const mem = bytes();
        let used = 0;
        for (let index = Number(cookie); index < entries.length; index++) {
          const entry = entries[index];
          const name = encodeText(entry.name);
          if (used + DIRENT_SIZE > bufLen) {
            break;
          }
          dv.setBigUint64(bufPtr + used, BigInt(index + 1), true);
          dv.setBigUint64(bufPtr + used + 8, entry.node.ino, true);
          dv.setUint32(bufPtr + used + 16, name.length, true);
          dv.setUint8(bufPtr + used + 20, vfs.filetype(entry.node));
          used += DIRENT_SIZE;
          const room = Math.min(name.length, bufLen - used);
          mem.set(name.subarray(0, room), bufPtr + used);
          used += room;
          if (room < name.length) {
            break;
          }
        }
        dv.setUint32(bufUsedPtr, used, true);
        return ERRNO.SUCCESS;
      }),
      path_open: wrap((dirFd, dirFlags, pathPtr, pathLen, oflags, rightsBase, rightsInheriting, fdflags, openedFdPtr) => {
        const base = getDirNode(dirFd);
        const pathStr = readString(pathPtr, pathLen);
        const node = oflags & O_CREAT ? vfs.createFile(base, pathStr, { exclusive: Boolean(oflags & O_EXCL) }) : vfs.lookup(base, pathStr);
        if (oflags & O_DIRECTORY && node.type !== "dir") {
          return ERRNO.ENOTDIR;
        }
        if (node.type === "file" && oflags & O_TRUNC) {
          vfs.truncate(node);
        }
        const fd = nextFd++;
        fds.set(fd, {
          kind: node.type === "dir" ? "dir" : "file",
          node,
          offset: 0,
          fdflags
        });
        view().setUint32(openedFdPtr, fd, true);
        return ERRNO.SUCCESS;
      }),
      path_create_directory: wrap((dirFd, pathPtr, pathLen) => {
        vfs.mkdir(getDirNode(dirFd), readString(pathPtr, pathLen));
        return ERRNO.SUCCESS;
      }),
      path_unlink_file: wrap((dirFd, pathPtr, pathLen) => {
        vfs.unlink(getDirNode(dirFd), readString(pathPtr, pathLen));
        return ERRNO.SUCCESS;
      }),
      path_filestat_get: wrap((dirFd, flags, pathPtr, pathLen, statPtr) => {
        const node = vfs.lookup(getDirNode(dirFd), readString(pathPtr, pathLen));
        writeFilestat(statPtr, node);
        return ERRNO.SUCCESS;
      }),
      path_filestat_set_times: wrap((dirFd, flags, pathPtr, pathLen, atim, mtim, fstFlags) => {
        const node = vfs.lookup(getDirNode(dirFd), readString(pathPtr, pathLen));
        const nowValue = BigInt(Math.round(now() * 1e6));
        vfs.setTimes(
          node,
          fstFlags & FILESTAT_SET_ATIM ? atim : fstFlags & FILESTAT_SET_ATIM_NOW ? nowValue : null,
          fstFlags & FILESTAT_SET_MTIM ? mtim : fstFlags & FILESTAT_SET_MTIM_NOW ? nowValue : null
        );
        return ERRNO.SUCCESS;
      }),
      // The VFS has no symlinks. realpath() degrades to the input path, which is
      // already the observed behaviour of the proven build: meta.json differs
      // from native only in its realpath strings.
      path_readlink: wrap(() => ERRNO.EINVAL)
    }
  };
  const start = (instance) => {
    memory = instance.exports.memory;
    if (!memory) {
      throw new Error("wasi: module exports no memory");
    }
    try {
      instance.exports._start();
      exitCode = 0;
    } catch (err) {
      if (isExitSentinel(err)) {
        exitCode = err.exitCode;
      } else {
        throw err;
      }
    }
    return exitCode;
  };
  return {
    importObject,
    start,
    stdout: () => decodeText(concat(stdoutChunks)),
    stderr: () => decodeText(concat(stderrChunks))
  };
};

// gen/vroot-data.mjs
var vrootFilesBase64 = {
  "include/verilated_std.sv": "Ly8gREVTQ1JJUFRJT046IFZlcmlsYXRvcjogYnVpbHQtaW4gcGFja2FnZXMgYW5kIGNsYXNzZXMKLy8KLy8gQ29kZSBhdmFpbGFibGUgZnJvbTogaHR0cHM6Ly92ZXJpbGF0b3Iub3JnCi8vCi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKgovLwovLyBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdAovLyB1bmRlciB0aGUgdGVybXMgb2YgZWl0aGVyIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgVmVyc2lvbiAzCi8vIG9yIHRoZSBQZXJsIEFydGlzdGljIExpY2Vuc2UgVmVyc2lvbiAyLjAuCi8vIFNQRFgtRmlsZUNvcHlyaWdodFRleHQ6IDIwMjItMjAyNiBXaWxzb24gU255ZGVyCi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBMR1BMLTMuMC1vbmx5IE9SIEFydGlzdGljLTIuMAovLwovLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioKLy8vCi8vLyBcZmlsZQovLy8gXGJyaWVmIFZlcmlsYXRlZCBJRUVFIHN0ZDo6IGhlYWRlcgovLy8KLy8vIFRoaXMgZmlsZSBpcyBpbmNsdWRlZCBhdXRvbWF0aWNhbGx5IGJ5IFZlcmlsYXRvciwgdW5sZXNzICctLW5vLXN0ZC1wYWNrYWdlJwovLy8gaXMgdXNlZC4KLy8vCi8vLyBUaGlzIGZpbGUgaXMgbm90IHBhcnQgb2YgdGhlIFZlcmlsYXRlZCBwdWJsaWMtZmFjaW5nIEFQSS4KLy8vIEl0IGlzIG9ubHkgZm9yIGludGVybmFsIHVzZS4KLy8vCi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKgovLwovLyBUaGUgZm9sbG93aW5nIGtleXdvcmRzIGZyb20gdGhpcyBmaWxlIGFyZSBoYXJkY29kZWQgZm9yIGRldGVjdGlvbiBpbiB0aGUgcGFyc2VyOgovLyAibWFpbGJveCIsICJwcm9jZXNzIiwgInJhbmRvbWl6ZSIsICJzZW1hcGhvcmUiLCAic3RkIgoKYGlmbmRlZiBWRVJJTEFUT1JfU1REX1NWXwpgZGVmaW5lIFZFUklMQVRPUl9TVERfU1ZfCgovLyB2ZXJpbGF0b3IgbGludF9vZmYgREVDTEZJTEVOQU1FCi8vIHZlcmlsYXRvciBsaW50X29mZiBUSU1FU0NBTEVNT0QKLy8gdmVyaWxhdG9yIGxpbnRfb2ZmIFVOVVNFRFNJR05BTApwYWNrYWdlIHN0ZDsKICAvLyBJRUVFIDE4MDAtc3BlY2lmaWVkIHN0YW5kYXJkICJtYWlsYm94IgogIGNsYXNzIG1haWxib3ggIygKICAgICAgdHlwZSBUCiAgKTsKICAgIHByb3RlY3RlZCBpbnQgbV9ib3VuZDsKICAgIHByb3RlY3RlZCBUIG1fcXVldWVbJF07CgogICAgZnVuY3Rpb24gbmV3KGludCBib3VuZCA9IDApOwogICAgICBtX2JvdW5kID0gYm91bmQ7CiAgICBlbmRmdW5jdGlvbgoKICAgIGZ1bmN0aW9uIGludCBudW0oKTsKICAgICAgcmV0dXJuIG1fcXVldWUuc2l6ZSgpOwogICAgZW5kZnVuY3Rpb24KCiAgICB0YXNrIHB1dChUIG1lc3NhZ2UpOwpgaWZkZWYgVkVSSUxBVE9SX1RJTUlORwogICAgICB3aGlsZSAobV9ib3VuZCAhPSAwICYmIG1fcXVldWUuc2l6ZSgpID49IG1fYm91bmQpICAvLwogICAgICAgIHdhaXQgKG1fcXVldWUuc2l6ZSgpIDwgbV9ib3VuZCk7CiAgICAgIG1fcXVldWUucHVzaF9iYWNrKG1lc3NhZ2UpOwpgZW5kaWYKICAgIGVuZHRhc2sKCiAgICBmdW5jdGlvbiBpbnQgdHJ5X3B1dChUIG1lc3NhZ2UpOwogICAgICBpZiAobV9ib3VuZCA9PSAwIHx8IG51bSgpIDwgbV9ib3VuZCkgYmVnaW4KICAgICAgICBtX3F1ZXVlLnB1c2hfYmFjayhtZXNzYWdlKTsKICAgICAgICByZXR1cm4gMTsKICAgICAgZW5kCiAgICAgIHJldHVybiAwOwogICAgZW5kZnVuY3Rpb24KCiAgICB0YXNrIGdldChyZWYgVCBtZXNzYWdlKTsKYGlmZGVmIFZFUklMQVRPUl9USU1JTkcKICAgICAgd2hpbGUgKG1fcXVldWUuc2l6ZSgpID09IDApIGJlZ2luCiAgICAgICAgd2FpdCAobV9xdWV1ZS5zaXplKCkgPiAwKTsKICAgICAgZW5kCiAgICAgIG1lc3NhZ2UgPSBtX3F1ZXVlLnBvcF9mcm9udCgpOwpgZW5kaWYKICAgIGVuZHRhc2sKCiAgICBmdW5jdGlvbiBpbnQgdHJ5X2dldChyZWYgVCBtZXNzYWdlKTsKICAgICAgaWYgKG51bSgpID4gMCkgYmVnaW4KICAgICAgICBtZXNzYWdlID0gbV9xdWV1ZS5wb3BfZnJvbnQoKTsKICAgICAgICByZXR1cm4gMTsKICAgICAgZW5kCiAgICAgIHJldHVybiAwOwogICAgZW5kZnVuY3Rpb24KCiAgICB0YXNrIHBlZWsocmVmIFQgbWVzc2FnZSk7CmBpZmRlZiBWRVJJTEFUT1JfVElNSU5HCiAgICAgIHdoaWxlIChtX3F1ZXVlLnNpemUoKSA9PSAwKSBiZWdpbgogICAgICAgIHdhaXQgKG1fcXVldWUuc2l6ZSgpID4gMCk7CiAgICAgIGVuZAogICAgICBtZXNzYWdlID0gbV9xdWV1ZVswXTsKYGVuZGlmCiAgICBlbmR0YXNrCgogICAgZnVuY3Rpb24gaW50IHRyeV9wZWVrKHJlZiBUIG1lc3NhZ2UpOwogICAgICBpZiAobnVtKCkgPiAwKSBiZWdpbgogICAgICAgIG1lc3NhZ2UgPSBtX3F1ZXVlWzBdOwogICAgICAgIHJldHVybiAxOwogICAgICBlbmQKICAgICAgcmV0dXJuIDA7CiAgICBlbmRmdW5jdGlvbgogIGVuZGNsYXNzCgogIC8vIElFRUUgMTgwMC1zcGVjaWZpZWQgc3RhbmRhcmQgInNlbWFwaG9yZSIKICBjbGFzcyBzZW1hcGhvcmU7CiAgICBwcm90ZWN0ZWQgaW50IG1fa2V5Q291bnQ7CiAgICBwcm90ZWN0ZWQgaW50IG1fbmV4dEtleUNvdW50ID0gJzE7CiAgICBwcm90ZWN0ZWQgbG9uZ2ludCB1bnNpZ25lZCBtX3RpY2tldCA9IDA7CiAgICBwcm90ZWN0ZWQgbG9uZ2ludCB1bnNpZ25lZCBtX25leHRUaWNrZXQgPSAwOwoKICAgIGZ1bmN0aW9uIG5ldyhpbnQga2V5Q291bnQgPSAwKTsKICAgICAgbV9rZXlDb3VudCA9IGtleUNvdW50OwogICAgZW5kZnVuY3Rpb24KCiAgICBmdW5jdGlvbiB2b2lkIHB1dChpbnQga2V5Q291bnQgPSAxKTsKICAgICAgbV9rZXlDb3VudCArPSBrZXlDb3VudDsKICAgIGVuZGZ1bmN0aW9uCgogICAgdGFzayBnZXQoaW50IGtleUNvdW50ID0gMSk7CmBpZmRlZiBWRVJJTEFUT1JfVElNSU5HCiAgICAgIGxvbmdpbnQgdW5zaWduZWQgdGlja2V0OwogICAgICAvLyBGYXN0IHBhdGg6IHRha2UgaWYga2V5cyBmaXQgQU5EIGVpdGhlciBubyBvbmUgaXMgcXVldWVkLCBvcgogICAgICAvLyB0aGUgaGVhZCBzdGlsbCBkb2Vzbid0IGZpdCAoc28gd2UncmUgbm90IHN0ZWFsaW5nIGl0cyBrZXlzKS4KICAgICAgaWYgKG1fa2V5Q291bnQgPj0ga2V5Q291bnQgJiYgbV9uZXh0S2V5Q291bnQgPiBtX2tleUNvdW50KSBiZWdpbgogICAgICAgIG1fa2V5Q291bnQgLT0ga2V5Q291bnQ7CiAgICAgICAgcmV0dXJuOwogICAgICBlbmQKICAgICAgdGlja2V0ID0gbV9uZXh0VGlja2V0Kys7CiAgICAgIHdhaXQgKG1fdGlja2V0ID09IHRpY2tldCk7CiAgICAgIG1fbmV4dEtleUNvdW50ID0ga2V5Q291bnQ7CiAgICAgIHdhaXQgKG1fa2V5Q291bnQgPj0ga2V5Q291bnQpOwogICAgICBtX2tleUNvdW50IC09IGtleUNvdW50OwogICAgICBtX3RpY2tldCsrOwpgZW5kaWYKICAgIGVuZHRhc2sKCiAgICBmdW5jdGlvbiBpbnQgdHJ5X2dldChpbnQga2V5Q291bnQgPSAxKTsKICAgICAgaWYgKG1fa2V5Q291bnQgPCBrZXlDb3VudCkgcmV0dXJuIDA7CiAgICAgIG1fa2V5Q291bnQgLT0ga2V5Q291bnQ7CiAgICAgIHJldHVybiAxOwogICAgZW5kZnVuY3Rpb24KICBlbmRjbGFzcwoKICAvLyBJRUVFIDE4MDAtc3BlY2lmaWVkIHN0YW5kYXJkICJwcm9jZXNzIgogIGNsYXNzIHByb2Nlc3M7CiAgICB0eXBlZGVmIGVudW0gewogICAgICBGSU5JU0hFRCA9IDAsCiAgICAgIFJVTk5JTkcgPSAxLAogICAgICBXQUlUSU5HID0gMiwKICAgICAgU1VTUEVOREVEID0gMywKICAgICAgS0lMTEVEID0gNAogICAgfSBzdGF0ZTsKCiAgICAvLyBXaWR0aCB2aXNpdG9yIGNoYW5nZXMgaXQgdG8gVmxQcm9jZXNzUmVmCiAgICAvLyBWM05hbWUgaXMgaGFyZGNvZGVkIG5vdCB0byByZW5hbWUgdGhpcyB2YXJpYWJsZQogICAgcHJvdGVjdGVkIGNoYW5kbGUgbV9wcm9jZXNzOwoKICAgIHN0YXRpYyBmdW5jdGlvbiBwcm9jZXNzIHNlbGYoKTsKICAgICAgcHJvY2VzcyBwID0gbmV3OwpgaWZkZWYgVkVSSUxBVE9SX1RJTUlORwogICAgICAkYyhwLm1fcHJvY2VzcywgIiA9IHZsUHJvY2VzczsiKTsKYGVuZGlmCiAgICAgIHJldHVybiBwOwogICAgZW5kZnVuY3Rpb24KCiAgICBwcm90ZWN0ZWQgZnVuY3Rpb24gdm9pZCBzZXRfc3RhdHVzKHN0YXRlIHMpOwpgaWZkZWYgVkVSSUxBVE9SX1RJTUlORwogICAgICAkYyhtX3Byb2Nlc3MsICItPnN0YXRlKCIsIHMsICIpOyIpOwpgZW5kaWYKICAgIGVuZGZ1bmN0aW9uCgogICAgZnVuY3Rpb24gc3RhdGUgc3RhdHVzKCk7CmBpZmRlZiBWRVJJTEFUT1JfVElNSU5HCiAgICAgIHJldHVybiBzdGF0ZScoJGNwdXJlKG1fcHJvY2VzcywgIi0+c3RhdGUoKSIpKTsKYGVsc2UKICAgICAgcmV0dXJuIFJVTk5JTkc7CmBlbmRpZgogICAgZW5kZnVuY3Rpb24KCiAgICBmdW5jdGlvbiB2b2lkIGtpbGwoKTsKICAgICAgc2V0X3N0YXR1cyhLSUxMRUQpOwogICAgZW5kZnVuY3Rpb24KCiAgICBmdW5jdGlvbiB2b2lkIHN1c3BlbmQoKTsKICAgICAgJGVycm9yKCJzdGQ6OnByb2Nlc3M6OnN1c3BlbmQoKSBub3Qgc3VwcG9ydGVkIik7CiAgICBlbmRmdW5jdGlvbgoKICAgIGZ1bmN0aW9uIHZvaWQgcmVzdW1lKCk7CiAgICAgIHNldF9zdGF0dXMoUlVOTklORyk7CiAgICBlbmRmdW5jdGlvbgoKICAgIHRhc2sgYXdhaXQoKTsKYGlmZGVmIFZFUklMQVRPUl9USU1JTkcKICAgICAgd2FpdCAoc3RhdHVzKCkgPT0gRklOSVNIRUQgfHwgc3RhdHVzKCkgPT0gS0lMTEVEKTsKYGVuZGlmCiAgICBlbmR0YXNrCgogICAgc3RhdGljIHRhc2sga2lsbFF1ZXVlKHJlZiBwcm9jZXNzIHByb2Nlc3NRdWV1ZVskXSk7CmBpZmRlZiBWRVJJTEFUT1JfVElNSU5HCiAgICAgIHJlcGVhdCAocHJvY2Vzc1F1ZXVlLnNpemUoKSkgYmVnaW4KICAgICAgICBwcm9jZXNzIHAgPSBwcm9jZXNzUXVldWUucG9wX2Zyb250KCk7CiAgICAgICAgaWYgKHApIHAua2lsbCgpOwogICAgICBlbmQKYGVuZGlmCiAgICBlbmR0YXNrCgogICAgLy8gVHdvIHByb2Nlc3MgcmVmZXJlbmNlcyBhcmUgZXF1YWwgaWYgdGhlIGRpZmZlcmVudCBjbGFzc2VzJyBjb250YWluaW5nCiAgICAvLyBtX3Byb2Nlc3MgYXJlIGVxdWFsLiBDYW4ndCB5ZXQgdXNlIDw9PiBhcyB0aGUgYmFzZSBjbGFzcyB0ZW1wbGF0ZQogICAgLy8gY29tcGFyaXNvbnMgZG9lc24ndCBkZWZpbmUgPD0+IGFzIHRoZXkgZG9uJ3QgeWV0IHJlcXVpcmUgLS10aW1pbmcgYW5kIEMrKzIwLgogICAgLy8gdmVyaWxvZ19mb3JtYXQ6IG9mZgpgaWZkZWYgVkVSSUxBVE9SX1RJTUlORwpgc3lzdGVtY19oZWFkZXJfcG9zdAp0ZW1wbGF0ZTw+IHRlbXBsYXRlPD4KaW5saW5lIGJvb2wgVmxDbGFzc1JlZjxgc3lzdGVtY19jbGFzc19uYW1lPjo6b3BlcmF0b3I9PShjb25zdCBWbENsYXNzUmVmPGBzeXN0ZW1jX2NsYXNzX25hbWU+JiByaHMpIGNvbnN0IHsKICAgIGlmICghbV9vYmpwICYmICFyaHMubV9vYmpwKSByZXR1cm4gdHJ1ZTsKICAgIGlmICghbV9vYmpwIHx8ICFyaHMubV9vYmpwKSByZXR1cm4gZmFsc2U7CiAgICByZXR1cm4gbV9vYmpwLT5tX3Byb2Nlc3MgPT0gcmhzLm1fb2JqcC0+bV9wcm9jZXNzOwp9Owp0ZW1wbGF0ZTw+IHRlbXBsYXRlPD4KaW5saW5lIGJvb2wgVmxDbGFzc1JlZjxgc3lzdGVtY19jbGFzc19uYW1lPjo6b3BlcmF0b3IhPShjb25zdCBWbENsYXNzUmVmPGBzeXN0ZW1jX2NsYXNzX25hbWU+JiByaHMpIGNvbnN0IHsKICAgIGlmICghbV9vYmpwICYmICFyaHMubV9vYmpwKSByZXR1cm4gZmFsc2U7CiAgICBpZiAoIW1fb2JqcCB8fCAhcmhzLm1fb2JqcCkgcmV0dXJuIHRydWU7CiAgICByZXR1cm4gbV9vYmpwLT5tX3Byb2Nlc3MgIT0gcmhzLm1fb2JqcC0+bV9wcm9jZXNzOwp9Owp0ZW1wbGF0ZTw+IHRlbXBsYXRlPD4KaW5saW5lIGJvb2wgVmxDbGFzc1JlZjxgc3lzdGVtY19jbGFzc19uYW1lPjo6b3BlcmF0b3I8KGNvbnN0IFZsQ2xhc3NSZWY8YHN5c3RlbWNfY2xhc3NfbmFtZT4mIHJocykgY29uc3QgewogICAgaWYgKCFtX29ianAgJiYgIXJocy5tX29ianApIHJldHVybiBmYWxzZTsKICAgIGlmICghbV9vYmpwIHx8ICFyaHMubV9vYmpwKSByZXR1cm4gZmFsc2U7CiAgICByZXR1cm4gbV9vYmpwLT5tX3Byb2Nlc3MgPCByaHMubV9vYmpwLT5tX3Byb2Nlc3M7Cn07CmB2ZXJpbG9nCmBlbmRpZgogICAgLy8gdmVyaWxvZ19mb3JtYXQ6IG9uCgogICAgZnVuY3Rpb24gc3RyaW5nIGdldF9yYW5kc3RhdGUoKTsKICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoICRjIHRvIGVuc3VyZSBpdCB3b24ndCBiZSBjb25zdGlmaWVkCiAgICAgIHN0cmluZyBzID0gc3RyaW5nJygkYygiMCIpKTsKCiAgICAgICRjKHMsICIgPSAiLCBtX3Byb2Nlc3MsICItPnJhbmRzdGF0ZSgpOyIpOwogICAgICByZXR1cm4gczsKICAgIGVuZGZ1bmN0aW9uCgogICAgZnVuY3Rpb24gdm9pZCBzZXRfcmFuZHN0YXRlKHN0cmluZyBzKTsKICAgICAgJGMobV9wcm9jZXNzLCAiLT5yYW5kc3RhdGUoIiwgcywgIik7Iik7CiAgICBlbmRmdW5jdGlvbgogIGVuZGNsYXNzCgogIC8vIElFRUUgMTgwMC1zcGVjaWZpZWQgc3RhbmRhcmQgInN0ZDo6cmFuZG9taXplIgogIGZ1bmN0aW9uIGludCByYW5kb21pemUoKTsKICAgIHJhbmRvbWl6ZSA9IDA7CiAgZW5kZnVuY3Rpb24KCiAgLy8gSUVFRSAxODAwLTIwMjMgMTkuMTAgY292ZXJhZ2Ugb3B0aW9uIGFuZCB0eXBlX29wdGlvbnMKICAvLyBJRUVFIGRvZXMgbm90IGRlZmluZSB0aGVzZSBhcyBzdGQ6OiBzdHJ1Y3R1cmVzIGJ1dCBWZXJpbGF0b3IgdXNlcwogIC8vIHRoZW0gYXMgc3VjaCBjdXJyZW50bHksIHNvIG5hbWVkIHdpdGggYSB1bmlxdWUgcHJlZml4CiAgdHlwZWRlZiBzdHJ1Y3QgewogICAgc3RyaW5nIG5hbWU7CiAgICBpbnQgd2VpZ2h0OwogICAgaW50IGdvYWw7CiAgICBzdHJpbmcgY29tbWVudDsKICAgIGludCBhdF9sZWFzdDsKICAgIGludCBhdXRvX2Jpbl9tYXg7CiAgICBpbnQgY3Jvc3NfbnVtX3ByaW50X21pc3Npbmc7CiAgICBiaXQgY3Jvc3NfcmV0YWluX2F1dG9fYmluczsKICAgIGJpdCBkZXRlY3Rfb3ZlcmxhcDsKICAgIGJpdCBwZXJfaW5zdGFuY2U7CiAgICBiaXQgZ2V0X2luc3RfY292ZXJhZ2U7CiAgfSB2bF9jb3Zlcmdyb3VwX29wdGlvbnNfdDsKCiAgdHlwZWRlZiBzdHJ1Y3QgewogICAgaW50IHdlaWdodDsKICAgIGludCBnb2FsOwogICAgc3RyaW5nIGNvbW1lbnQ7CiAgICBpbnQgYXRfbGVhc3Q7CiAgICBpbnQgYXV0b19iaW5fbWF4OwogICAgYml0IGRldGVjdF9vdmVybGFwOwogIH0gdmxfY292ZXJwb2ludF9vcHRpb25zX3Q7CgogIHR5cGVkZWYgc3RydWN0IHsKICAgIGludCB3ZWlnaHQ7CiAgICBpbnQgZ29hbDsKICAgIHN0cmluZyBjb21tZW50OwogICAgaW50IGF0X2xlYXN0OwogICAgaW50IGNyb3NzX251bV9wcmludF9taXNzaW5nOwogICAgYml0IGNyb3NzX3JldGFpbl9hdXRvX2JpbnM7CiAgfSB2bF9jcm9zc19vcHRpb25zX3Q7CgogIHR5cGVkZWYgc3RydWN0IHsKICAgIGludCB3ZWlnaHQ7CiAgICBpbnQgZ29hbDsKICAgIHN0cmluZyBjb21tZW50OwogICAgYml0IHN0cm9iZTsKICAgIGJpdCBtZXJnZV9pbnN0YW5jZXM7CiAgICBiaXQgZGlzdHJpYnV0ZV9maXJzdDsKICAgIHJlYWwgcmVhbF9pbnRlcnZhbDsKICB9IHZsX2NvdmVyZ3JvdXBfdHlwZV9vcHRpb25zX3Q7CgogIHR5cGVkZWYgc3RydWN0IHsKICAgIGludCB3ZWlnaHQ7CiAgICBpbnQgZ29hbDsKICAgIHN0cmluZyBjb21tZW50OwogICAgcmVhbCByZWFsX2ludGVydmFsOwogIH0gdmxfY292ZXJwb2ludF90eXBlX29wdGlvbnNfdDsKCiAgdHlwZWRlZiBzdHJ1Y3QgewogICAgaW50IHdlaWdodDsKICAgIGludCBnb2FsOwogICAgc3RyaW5nIGNvbW1lbnQ7CiAgfSB2bF9jcm9zc190eXBlX29wdGlvbnNfdDsKCmVuZHBhY2thZ2UKCmBlbmRpZiAgLy8gR3VhcmQK",
  "include/verilated_std_waiver.vlt": "Ly8gREVTQ1JJUFRJT046IFZlcmlsYXRvcjogYnVpbHQtaW4gc3RhbmRhcmQgbGludCB3YWl2ZXJzCi8vCi8vIENvZGUgYXZhaWxhYmxlIGZyb206IGh0dHBzOi8vdmVyaWxhdG9yLm9yZwovLwovLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioKLy8KLy8gVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQKLy8gdW5kZXIgdGhlIHRlcm1zIG9mIGVpdGhlciB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIFZlcnNpb24gMwovLyBvciB0aGUgUGVybCBBcnRpc3RpYyBMaWNlbnNlIFZlcnNpb24gMi4wLgovLyBTUERYLUZpbGVDb3B5cmlnaHRUZXh0OiAyMDAxLTIwMjYgV2lsc29uIFNueWRlcgovLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTEdQTC0zLjAtb25seSBPUiBBcnRpc3RpYy0yLjAKLy8KLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqCi8vLwovLy8gXGZpbGUKLy8vIFxicmllZiBWZXJpbGF0ZWQgYnVpbHQtaW4gc3RhbmRhcmQgbGludCB3YWl2ZXJzCi8vLwovLy8gVGhpcyBmaWxlIGlzIGluY2x1ZGVkIGF1dG9tYXRpY2FsbHkgYnkgVmVyaWxhdG9yLCB1bmxlc3MgJy0tbm8tc3RkLXdhaXZlcicKLy8vIGlzIHVzZWQuCi8vLwovLy8gVG8gYXNzaXN0IGluIGJ1aWxkaW5nIG5ldyBydWxlcywgdXNlOgovLy8gICAgICAndmVyaWxhdG9yIC0td2FpdmVyLW11bHRpbGluZSAtLXdhaXZlci1vdXRwdXQgPGZpbGVuYW1lPicKLy8vCi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKgoKYGlmbmRlZiBfVkVSSUxBVEVEX1NURF9XQUlWRVJfVkxUXwpgZGVmaW5lIF9WRVJJTEFURURfU1REX1dBSVZFUl9WTFRfCgpgdmVyaWxhdG9yX2NvbmZpZwoKLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci8vIFVWTQoKLy8gQXBwbHkgdGhlc2UgcnVsZXMgdG8gb25seSBVVk0gYmFzZSBmaWxlcwpgZGVmaW5lIFZMVF9VVk1fRklMRVMgLWZpbGUgIiovdXZtXyouc3ZoIiAtY29udGVudHMgIipVVk1fVkVSU0lPTl9TVFJJTkcqIgoKLy8gV2hvbGUtcGFja2FnZSBmaWxlIHdhaXZlcnMKbGludF9vZmYgLXJ1bGUgREVDTEZJTEVOQU1FIGBWTFRfVVZNX0ZJTEVTCmxpbnRfb2ZmIC1ydWxlIFVORFJJVkVOIGBWTFRfVVZNX0ZJTEVTCmxpbnRfb2ZmIC1ydWxlIFVOVVNFRCBgVkxUX1VWTV9GSUxFUwpsaW50X29mZiAtcnVsZSBWQVJISURERU4gYFZMVF9VVk1fRklMRVMKbGludF9vZmYgLXJ1bGUgV0lEVEhFWFBBTkQgYFZMVF9VVk1fRklMRVMKbGludF9vZmYgLXJ1bGUgV0lEVEhUUlVOQyBgVkxUX1VWTV9GSUxFUwoKLy8gQ29udGV4dC1zZW5zaXRpdmUgd2FpdmVycwpsaW50X29mZiAtcnVsZSBDQVNFSU5DT01QTEVURSBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogY2FzZSAoe2lzX1IsIGlzX1d9KSoiCmxpbnRfb2ZmIC1ydWxlIENBU0VJTkNPTVBMRVRFIGBWTFRfVVZNX0ZJTEVTIC1tYXRjaCAiKiBjYXNlKG9yaWdfc2V2ZXJpdHkpKiIKbGludF9vZmYgLXJ1bGUgQ0FTVENPTlNUIGBWTFRfVVZNX0ZJTEVTIC1tYXRjaCAiKmNsYXNze311dm1fY2FsbGJhY2sqIgpsaW50X29mZiAtcnVsZSBDQVNUQ09OU1QgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqY2xhc3N7fXV2bV9jb21wb25lbnQqIgpsaW50X29mZiAtcnVsZSBDQVNUQ09OU1QgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqY2xhc3N7fXV2bV9ldmVudCoiCmxpbnRfb2ZmIC1ydWxlIENBU1RDT05TVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIipjbGFzc3t9dXZtX3JlcG9ydF9vYmplY3QqIgpsaW50X29mZiAtcnVsZSBDQVNUQ09OU1QgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqY2xhc3N7fXV2bV9zZXF1ZW5jZV9pdGVtKiIKbGludF9vZmYgLXJ1bGUgSUdOT1JFRFJFVFVSTiBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogdXZtX2NvcmVfc3RhdGVfY2FsbGJhY2s6OmFkZCoiCmxpbnRfb2ZmIC1ydWxlIE1JU0lOREVOVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogZm9yZWFjaCAoYWJzdHJhY3Rpb25zW2ldKSoiCmxpbnRfb2ZmIC1ydWxlIE1JU0lOREVOVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogZm9yZWFjaCAobG9ja19saXN0W2ldKSoiCmxpbnRfb2ZmIC1ydWxlIE1JU0lOREVOVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogZm9yZWFjaCAobV9maWVsZHNbaV0pKiIgIC8vIDIwMTctMS4xCmxpbnRfb2ZmIC1ydWxlIE1JU0lOREVOVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogaWYgKHJ3LmdldF9zdGF0dXMoKSoiICAvLyAyMDE3LTEuMQpsaW50X29mZiAtcnVsZSBNSVNJTkRFTlQgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqIHJ3X2FjY2Vzcy5kYXRhPSoiCmxpbnRfb2ZmIC1ydWxlIE1JU0lOREVOVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogdXZtX2NtZGxpbmVfcHJvYyA9KiIKbGludF9vZmYgLXJ1bGUgUkVBTENWVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIiogbV90aW1lICoiCmxpbnRfb2ZmIC1ydWxlIFJFQUxDVlQgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqJHJlYWx0aW1lKiIKbGludF9vZmYgLXJ1bGUgU0lERUVGRkVDVCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIipmb3JlYWNoIChibGtzW2Jsa19dLnJlZ19maWxlc1tibGtfcmZdKSoiCmxpbnRfb2ZmIC1ydWxlIFNZTVJTVkRXT1JEIGBWTFRfVVZNX0ZJTEVTIC1tYXRjaCAiKidkZWxldGUnKiIKbGludF9vZmYgLXJ1bGUgU1lNUlNWRFdPUkQgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqJ2xpc3QnKiIKbGludF9vZmYgLXJ1bGUgU1lNUlNWRFdPUkQgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqJ21hcCcqIgpsaW50X29mZiAtcnVsZSBTWU1SU1ZEV09SRCBgVkxUX1VWTV9GSUxFUyAtbWF0Y2ggIionb3ZlcnJpZGUnKiIKbGludF9vZmYgLXJ1bGUgU1lNUlNWRFdPUkQgYFZMVF9VVk1fRklMRVMgLW1hdGNoICIqJ3ZvbGF0aWxlJyoiCgovLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KYHVuZGVmIFZMVF9VVk1fRklMRVMKYGVuZGlmICAvLyBHdWFyZAo="
};

// lib/index.mjs
var VROOT_DIR = ".verilator-root";
var isNode = () => Boolean(globalThis.process && globalThis.process.versions && globalThis.process.versions.node);
var fromBase64 = (text) => {
  if (isNode()) {
    return new Uint8Array(globalThis.Buffer.from(text, "base64"));
  }
  const binary = globalThis.atob(text);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
};
var readUrl = async (url) => {
  if (isNode()) {
    throw new Error("verilator-wasm: Node.js file reads are not supported in the bundled build");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("verilator-wasm: fetch " + url + " failed with " + response.status);
  }
  return new Uint8Array(await response.arrayBuffer());
};
var loadWasmBytes = async (options) => {
  if (options.wasmBinary) {
    return options.wasmBinary instanceof Uint8Array ? options.wasmBinary : new Uint8Array(options.wasmBinary);
  }
  const candidates = options.wasmUrl ? [options.wasmUrl] : [];
  const failures = [];
  for (const candidate of candidates) {
    try {
      return await readUrl(candidate);
    } catch (err) {
      failures.push(String(candidate) + ": " + err.message);
    }
  }
  throw new Error("verilator-wasm: could not load verilator.wasm\n  " + failures.join("\n  "));
};
var seedVroot = (vfs, mount) => {
  for (const [name, base64] of Object.entries(vrootFilesBase64)) {
    vfs.writeFile(mount, VROOT_DIR + "/" + name, fromBase64(base64));
  }
};
var createVerilator = async (options = {}) => {
  const wasmModule = options.wasmModule || await WebAssembly.compile(await loadWasmBytes(options));
  const run = async ({
    args = [],
    files = {},
    cwd = "/",
    env = {},
    onStdout = null,
    onStderr = null,
    now,
    random
  } = {}) => {
    const vfs = createVfs();
    const mount = vfs.mkdirp(vfs.root, cwd);
    seedVroot(vfs, mount);
    for (const [name, contents] of Object.entries(files)) {
      vfs.writeFile(mount, name, contents);
    }
    vfs.markClean();
    const wasi = createWasi({
      vfs,
      mountNode: mount,
      mountName: "/",
      args: ["verilator", ...args],
      env: {
        // Must be set or the built-in std:: and lint-waiver lookups fail; the
        // native run needs it too.
        VERILATOR_ROOT: "/" + VROOT_DIR,
        ...env
      },
      onStdout,
      onStderr,
      ...now ? { now } : {},
      ...random ? { random } : {}
    });
    const instance = await WebAssembly.instantiate(wasmModule, wasi.importObject);
    const harvest = () => {
      const raw = vfs.dirtyFiles(mount, { exclude: [VROOT_DIR] });
      const text = {};
      for (const [name, bytes] of Object.entries(raw)) {
        text[name] = decodeText(bytes);
      }
      return { filesBytes: raw, files: text };
    };
    let exitCode;
    try {
      exitCode = wasi.start(instance);
    } catch (err) {
      throw Object.assign(err, {
        stdout: wasi.stdout(),
        stderr: wasi.stderr(),
        ...harvest()
      });
    }
    return {
      exitCode,
      stdout: wasi.stdout(),
      stderr: wasi.stderr(),
      ...harvest()
    };
  };
  return { run, module: wasmModule };
};
var index_default = createVerilator;
export {
  createVerilator,
  index_default as default
};
