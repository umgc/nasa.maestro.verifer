# Schema

```

```

| Abstract            | Extensible | Status       | Identifiable | Custom Properties | Additional Properties | Defined In |
| ------------------- | ---------- | ------------ | ------------ | ----------------- | --------------------- | ---------- |
| Can be instantiated | No         | Experimental | No           | Forbidden         | Permitted             |            |

# Properties

| Property                          | Type       | Required     | Nullable | Defined by                                 |
| --------------------------------- | ---------- | ------------ | -------- | ------------------------------------------ |
| [actors](#actors)                 | `object[]` | Optional     | No       | (this schema)                              |
| [procedure_name](#procedure_name) | `string`   | **Required** | No       | (this schema)                              |
| [tasks](#tasks)                   | `object[]` | **Required** | No       | (this schema)                              |
| `*`                               | any        | Additional   | Yes      | this schema _allows_ additional properties |

## actors

Array of actors that will be participating in the spacewalk. Actors are rendered as columns in the outputted table.
Each entry in the array consists of a role, and an optional name.

`actors`

- is optional
- type: `object[]`
- defined in this schema

### actors Type

Array type: `object[]`

All items must be of the type: `object` with following properties:

| Property | Type   | Required     |
| -------- | ------ | ------------ |
| `id`     | string | **Required** |
| `name`   | string | Optional     |

#### id

`id`

- is **required**
- type: `string`

##### id Type

`string`

#### name

(POSSIBLY INACCURATE: This is likely moved into the 'columns' array) The actor's name. If present, the name is placed
in parentheses and appended to the role as the column header.

`name`

- is optional
- type: `string`

##### name Type

`string`

## procedure_name

`procedure_name`

- is **required**
- type: `string`
- defined in this schema

### procedure_name Type

`string`

## tasks

An array of tasks that make up the EVA/spacewalk. Each entry in the array is a file.

`tasks`

- is **required**
- type: `object[]`
- defined in this schema

### tasks Type

Array type: `object[]`

All items must be of the type: `object` with following properties:

| Property | Type   | Required |
| -------- | ------ | -------- |
| `file`   | string | Optional |
| `roles`  | object | Optional |

#### file

Relative path from this file to a file which represents a tasks to be completed during the procedure. Used for
re-usability.

`file`

- is optional
- type: `string`

##### file Type

`string`

#### roles

The roles required to be filled for the task. This will map to the roles in the task file.

`roles`

- is optional
- type: `object`

##### roles Type

`object` with following properties:

| Property | Type | Required |
| -------- | ---- | -------- |

