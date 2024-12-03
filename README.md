# Trackify Library README

## Overview

The `Trackify` class provides a simple and powerful way to track changes between two states of an object in TypeScript. It can detect changes to properties, including collections, and classify them as `added`, `removed`, or `modified`.

This library is particularly useful for detecting differences in objects, implementing change-detection systems, or auditing data changes.

---

## Features

- Track property-level changes between two object states.
- Handle collections (`Array` types) with `added` and `removed` detection.
- Add custom comparers for property-specific comparison logic.
- Include or exclude specific properties from change tracking.
- Lightweight and easy-to-use API.

---

## Installation

```bash
npm install @techie-development/trackify.ts
```

## Usage

### Basic Example

```typescript
import { Trackify, ChangeType } from "@techie-development/trackify.ts";

interface Person {
  name: string;
  age: number;
  hobbies: string[];
}

const original: Person = { name: "John", age: 30, hobbies: ["reading", "swimming"] };
const modified: Person = { name: "John", age: 35, hobbies: ["reading", "cycling"] };

const tracker = new Trackify<Person>(original);
tracker.update(modified);

const changes = tracker.changes;
console.log(changes);
```

Output:

```json
[
  {
    "property": "age",
    "previous": 30,
    "current": 35,
    "type": "modified"
  },
  {
    "property": "hobbies",
    "previous": null,
    "current": "cycling",
    "type": "added"
  },
  {
    "property": "hobbies",
    "previous": "swimming",
    "current": null,
    "type": "removed"
  }
]

```
