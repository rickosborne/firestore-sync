# firestore-sync

A very basic tool to facilitate synchronizing local JSON seed files with a Firestore.
_Probably_ not production quality, but it does what I need it to.

## Basic Operation

Install as a dev dependency:

```bash
npm i -D firestore-sync
```

Create a config file named `.firestore-sync.json`:

```json5
{
  "profiles": {
    // default profile -- all you really need to set is the `directory`
    "default": {
      "directory": "../path/to/seed/directory/",  // relative to the config file
      "log": "",  // empty or missing means STDOUT
      "pull": {  // strategy options for pull operations
        // these defaults reflect a "trust firestore, merge new stuff" strategy
        "createValues": true,
        "createDocuments": true,
        "createCollections": true,
        "updateValues": true,  // assume firestore is more recent
        "updateDocuments": true,
        "updateCollections": true,
        "deleteValues": false,
        "deleteDocuments": false,
        "deleteCollections": false,
        "logCreates": false,
        "logUpdates": false,
        "logDeletes": false,
        "onTypeMismatch": "log"
      },
      "push": {
        // these defaults reflect a "trust firestore, merge new stuff" strategy
        "createValues": true,
        "createDocuments": true,
        "createCollections": true,
        "updateValues": false,  // assume firestore is more recent
        "updateDocuments": true,
        "updateCollections": true,
        "deleteValues": false,
        "deleteDocuments": false,
        "deleteCollections": false,
        "logCreates": true,
        "logUpdates": true,
        "logDeletes": true,
        "onTypeMismatch": "fail"  // paranoia
      },
      "sync": "pull-then-push"  // order of operations
    },
    // example user-defined profile -- you don't need this!
    "nuke-local": {
      // every profile extends the default, so you don't need to duplicate settings
      // but be careful changing default settings, as they will ripple to other profiles!
      "pull": {
        "deleteValues": true,  // could be annoying
        "deleteDocuments": true,  // could be bad
        "deleteCollections": true  // could be catastrophic!
      }
    }
  }
}
```

Add scripts to your `package.json`:

```json5
{
  "scripts": {
    "firestore:pull": "firestore-sync pull",
    "firestore:push": "firestore-sync push",
    // example of using a profile
    "firestore:nuke": "firestore-sync pull --profile nuke-local",
  }
}
```

Run like any other script:

```bash
npm run firestore:pull
```

Or skip npm and run it with node:

```bash
node node_modules/.bin/firestore-sync pull
```

## Config Options

For now, see the above examples and interfaces in `FirestoreSyncConfig.ts`.

## Local Format

Inside your data directory, each collection is a directory and each document is a file.
File names are punycoded Document IDs plus a JSON extension.

In-document references are stored as stringified links by the `pull` operation:

```json5
{
  "user": "$firestore:collection$abc123"
}
```

These are restored to real documents and collections by the `push` operation.
Be careful if you use the JSON files with anything else, as this reference format is **not** official, canonical, or in any way sanctioned by anyone else.
I made it up!

You can set per-profile overrides to the reference and type prefixes in the config file:

```json5
{
  "collectionReferencePrefix": "$firestore:collection$",
  "documentReferencePrefix": "$firestore:document$",
  "geopointPrefix": "$firestore:geopoint$",
  "timestampPrefix": "$firestore:timestamp$",
}
```

Be careful to choose prefixes unique enough that they won't collide with _any_ of your data values!
