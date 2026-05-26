type Listener<Args extends unknown[] = []> = (...args: Args) => void;

type BookmarkNode = {
  children?: BookmarkNode[];
  id: string;
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
};

interface StorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

interface StorageAreaMock {
  clear: () => Promise<void>;
  get: (keys?: string | string[] | Record<string, unknown>) => Promise<Record<string, unknown>>;
  remove: (keys: string | string[]) => Promise<void>;
  set: (items: Record<string, unknown>) => Promise<void>;
}

interface BrowserMock {
  bookmarks: {
    create: (details: { index?: number; parentId?: string; title: string; url?: string }) => Promise<BookmarkNode>;
    getSubTree: (id: string) => Promise<BookmarkNode[]>;
    getTree: () => Promise<BookmarkNode[]>;
    move: (id: string, destination: { index?: number; parentId?: string }) => Promise<BookmarkNode>;
    onChanged: EventMock<[BookmarkNode] | [BookmarkNode, BookmarkNode]>;
    onChildrenReordered: EventMock<[BookmarkNode]>;
    onCreated: EventMock<[BookmarkNode]>;
    onImportBegan: EventMock<[]>;
    onImportEnded: EventMock<[]>;
    onMoved: EventMock<[BookmarkNode, BookmarkNode] | [BookmarkNode]>;
    onRemoved: EventMock<[string, BookmarkNode | undefined] | [string]>;
    remove: (id: string) => Promise<void>;
    removeTree: (id: string) => Promise<void>;
    update: (id: string, changes: { title?: string; url?: string }) => Promise<BookmarkNode>;
  };
  runtime: {
    getURL: (path: string) => string;
    id: string;
  };
  storage: {
    local: StorageAreaMock;
    onChanged: EventMock<[Record<string, StorageChange>, string]>;
  };
}

interface EventMock<Args extends unknown[] = []> {
  addListener: (listener: Listener<Args>) => void;
  emit: (...args: Args) => void;
  hasListener: (listener: Listener<Args>) => boolean;
  removeListener: (listener: Listener<Args>) => void;
}

const E2E_STORAGE_STATE_KEY = "vtab.e2e.storage.local";

export function installE2eBrowserMock(): BrowserMock {
  const storageState = loadPersistedStorageState();
  const onStorageChanged = createEventMock<[Record<string, StorageChange>, string]>();
  const bookmarkEvents = {
    onChanged: createEventMock<[BookmarkNode] | [BookmarkNode, BookmarkNode]>(),
    onChildrenReordered: createEventMock<[BookmarkNode]>(),
    onCreated: createEventMock<[BookmarkNode]>(),
    onImportBegan: createEventMock<[]>(),
    onImportEnded: createEventMock<[]>(),
    onMoved: createEventMock<[BookmarkNode, BookmarkNode] | [BookmarkNode]>(),
    onRemoved: createEventMock<[string, BookmarkNode | undefined] | [string]>()
  };
  const tree = createInitialTree();
  let nextBookmarkId = 20;

  const storageArea: StorageAreaMock = {
    async clear() {
      const changes: Record<string, StorageChange> = {};

      for (const [key, oldValue] of storageState.entries()) {
        changes[key] = { oldValue, newValue: undefined };
      }

      storageState.clear();
      persistStorageState(storageState);

      if (Object.keys(changes).length) {
        onStorageChanged.emit(changes, "local");
      }
    },
    async get(keys) {
      if (typeof keys === "string") {
        return { [keys]: cloneValue(storageState.get(keys)) };
      }

      if (Array.isArray(keys)) {
        return Object.fromEntries(
          keys.map((key) => [key, cloneValue(storageState.get(key))]).filter(([, value]) => typeof value !== "undefined")
        );
      }

      if (keys && typeof keys === "object") {
        const result: Record<string, unknown> = {};

        for (const [key, defaultValue] of Object.entries(keys)) {
          result[key] = cloneValue(storageState.has(key) ? storageState.get(key) : defaultValue);
        }

        return result;
      }

      return Object.fromEntries(Array.from(storageState.entries()).map(([key, value]) => [key, cloneValue(value)]));
    },
    async remove(keys) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      const changes: Record<string, StorageChange> = {};

      for (const key of keyList) {
        if (!storageState.has(key)) {
          continue;
        }

        changes[key] = { oldValue: storageState.get(key), newValue: undefined };
        storageState.delete(key);
      }

      persistStorageState(storageState);

      if (Object.keys(changes).length) {
        onStorageChanged.emit(changes, "local");
      }
    },
    async set(items) {
      const changes: Record<string, StorageChange> = {};

      for (const [key, value] of Object.entries(items)) {
        const oldValue = storageState.get(key);
        storageState.set(key, cloneValue(value));
        changes[key] = { oldValue, newValue: cloneValue(value) };
      }

      persistStorageState(storageState);

      onStorageChanged.emit(changes, "local");
    }
  };

  const mock: BrowserMock = {
    bookmarks: {
      async create(details) {
        const parentId = details.parentId ?? "1";
        const parent = findNode(tree, parentId);
        const createdNode: BookmarkNode = {
          id: String(nextBookmarkId++),
          index: typeof details.index === "number" ? details.index : undefined,
          parentId,
          title: details.title,
          url: details.url
        };

        if (!parent) {
          throw new Error(`Parent folder ${parentId} not found`);
        }

        if (!parent.children) {
          parent.children = [];
        }

        insertNode(parent.children, createdNode, details.index);
        normalizeIndexes(parent.children, parent.id);
        bookmarkEvents.onCreated.emit(cloneNode(createdNode));
        bookmarkEvents.onChildrenReordered.emit(cloneNode(parent));
        return cloneNode(createdNode);
      },
      async getSubTree(id) {
        const node = findNode(tree, id);
        return node ? [cloneNode(node)] : [];
      },
      async getTree() {
        return cloneValue(tree);
      },
      async move(id, destination) {
        const node = findNode(tree, id);

        if (!node) {
          throw new Error(`Bookmark node ${id} not found`);
        }

        const sourceParent = findParent(tree, id);
        const destinationParentId = destination.parentId ?? "1";
        const destinationParent = findNode(tree, destinationParentId);

        if (!destinationParent) {
          throw new Error(`Destination folder ${destinationParentId} not found`);
        }

        detachNode(sourceParent ? sourceParent.children ?? [] : tree, id);

        if (!destinationParent.children) {
          destinationParent.children = [];
        }

        node.parentId = destinationParentId;
        insertNode(destinationParent.children, node, destination.index);
        normalizeIndexes(destinationParent.children, destinationParent.id);
        bookmarkEvents.onMoved.emit(cloneNode(node), cloneNode(destinationParent));
        bookmarkEvents.onChildrenReordered.emit(cloneNode(destinationParent));
        return cloneNode(node);
      },
      ...bookmarkEvents,
      async remove(id) {
        const parent = findParent(tree, id);
        const removedNode = detachNode(parent ? parent.children ?? [] : tree, id);

        if (!removedNode) {
          return;
        }

        bookmarkEvents.onRemoved.emit(id, cloneNode(removedNode));
        if (parent) {
          bookmarkEvents.onChildrenReordered.emit(cloneNode(parent));
        }
      },
      async removeTree(id) {
        await mock.bookmarks.remove(id);
      },
      async update(id, changes) {
        const node = findNode(tree, id);

        if (!node) {
          throw new Error(`Bookmark node ${id} not found`);
        }

        if (typeof changes.title === "string") {
          node.title = changes.title;
        }

        if (typeof changes.url === "string") {
          node.url = changes.url;
        }

        bookmarkEvents.onChanged.emit(cloneNode(node));
        return cloneNode(node);
      }
    },
    runtime: {
      getURL(path) {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        return new URL(normalizedPath, window.location.origin).href;
      },
      id: "vtab-e2e"
    },
    storage: {
      local: storageArea,
      onChanged: onStorageChanged
    }
  };

  Object.defineProperty(globalThis, "browser", {
    configurable: true,
    value: mock,
    writable: true
  });
  Object.defineProperty(globalThis, "chrome", {
    configurable: true,
    value: mock,
    writable: true
  });

  return mock;

  function findNode(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      const child = findNode(node.children ?? [], id);

      if (child) {
        return child;
      }
    }

    return undefined;
  }

  function findParent(nodes: BookmarkNode[], id: string, parent: BookmarkNode | null = null): BookmarkNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return parent;
      }

      const childParent = findParent(node.children ?? [], id, node);

      if (childParent) {
        return childParent;
      }
    }

    return null;
  }

  function detachNode(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
    const index = nodes.findIndex((node) => node.id === id);

    if (index >= 0) {
      const [removed] = nodes.splice(index, 1);
      normalizeIndexes(nodes, nodes.length ? nodes[0]?.parentId : undefined);
      return removed;
    }

    for (const node of nodes) {
      const removed = detachNode(node.children ?? [], id);

      if (removed) {
        if (node.children?.length === 0) {
          delete node.children;
        }

        return removed;
      }
    }

    return undefined;
  }

  function insertNode(nodes: BookmarkNode[], node: BookmarkNode, index?: number) {
    if (typeof index === "number" && index >= 0 && index < nodes.length) {
      nodes.splice(index, 0, node);
      return;
    }

    nodes.push(node);
  }

  function normalizeIndexes(nodes: BookmarkNode[], parentId?: string) {
    nodes.forEach((node, index) => {
      node.index = index;
      node.parentId = parentId;
      if (node.children?.length) {
        normalizeIndexes(node.children, node.id);
      }
    });
  }
}

function createEventMock<Args extends unknown[] = []>(): EventMock<Args> {
  const listeners = new Set<Listener<Args>>();

  return {
    addListener(listener) {
      listeners.add(listener);
    },
    emit(...args) {
      for (const listener of listeners) {
        listener(...args);
      }
    },
    hasListener(listener) {
      return listeners.has(listener);
    },
    removeListener(listener) {
      listeners.delete(listener);
    }
  };
}

function cloneNode(node: BookmarkNode): BookmarkNode {
  return cloneValue(node);
}

function cloneValue<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function loadPersistedStorageState(): Map<string, unknown> {
  try {
    const persistedState = window.localStorage.getItem(E2E_STORAGE_STATE_KEY);

    if (!persistedState) {
      return new Map<string, unknown>();
    }

    const parsedState = JSON.parse(persistedState) as Array<[string, unknown]>;

    if (!Array.isArray(parsedState)) {
      return new Map<string, unknown>();
    }

    return new Map(parsedState);
  } catch {
    return new Map<string, unknown>();
  }
}

function persistStorageState(storageState: Map<string, unknown>): void {
  try {
    window.localStorage.setItem(E2E_STORAGE_STATE_KEY, JSON.stringify(Array.from(storageState.entries())));
  } catch {
    // Ignore storage persistence failures in the e2e harness.
  }
}

function createInitialTree(): BookmarkNode[] {
  return [
    {
      id: "0",
      title: "",
      children: [
        {
          id: "1",
          parentId: "0",
          index: 0,
          title: "Bookmarks Bar",
          children: [
            {
              id: "3",
              parentId: "1",
              index: 0,
              title: "Work",
              children: [
                {
                  id: "10",
                  parentId: "3",
                  index: 0,
                  title: "OpenAI Platform",
                  url: "https://platform.openai.com"
                },
                {
                  id: "11",
                  parentId: "3",
                  index: 1,
                  title: "Raycast",
                  url: "https://www.raycast.com"
                }
              ]
            },
            {
              id: "4",
              parentId: "1",
              index: 1,
              title: "Design",
              children: []
            },
            {
              id: "5",
              parentId: "1",
              index: 2,
              title: "Inspiration",
              children: [
                {
                  id: "12",
                  parentId: "5",
                  index: 0,
                  title: "Dribbble",
                  url: "https://dribbble.com"
                }
              ]
            },
            {
              id: "6",
              parentId: "1",
              index: 3,
              title: "Development",
              children: [
                {
                  id: "7",
                  parentId: "6",
                  index: 0,
                  title: "React Components",
                  children: [
                    {
                      id: "13",
                      parentId: "7",
                      index: 0,
                      title: "Tailwind Docs",
                      url: "https://tailwindcss.com"
                    }
                  ]
                },
                {
                  id: "8",
                  parentId: "6",
                  index: 1,
                  title: "Infrastructure",
                  children: [
                    {
                      id: "14",
                      parentId: "8",
                      index: 0,
                      title: "Vercel",
                      url: "https://vercel.com"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "2",
          parentId: "0",
          index: 1,
          title: "Other Bookmarks",
          children: [
            {
              id: "15",
              parentId: "2",
              index: 0,
              title: "GitHub",
              url: "https://github.com"
            }
          ]
        }
      ]
    }
  ];
}
