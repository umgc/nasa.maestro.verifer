# Schema

```

```

| Abstract            | Extensible | Status       | Identifiable | Custom Properties | Additional Properties | Defined In |
| ------------------- | ---------- | ------------ | ------------ | ----------------- | --------------------- | ---------- |
| Can be instantiated | Yes        | Experimental | No           | Forbidden         | Permitted             |            |

# Properties

| Property        | Type       | Required     | Nullable | Defined by                                 |
| --------------- | ---------- | ------------ | -------- | ------------------------------------------ |
| [roles](#roles) | `object[]` | **Required** | No       | (this schema)                              |
| [steps](#steps) | `object[]` | **Required** | No       | (this schema)                              |
| [title](#title) | `string`   | **Required** | No       | (this schema)                              |
| `*`             | any        | Additional   | Yes      | this schema _allows_ additional properties |

## roles

`roles`

- is **required**
- type: `object[]`
- defined in this schema

### roles Type

Array type: `object[]`

All items must be of the type: `object` with following properties:

| Property      | Type   | Required     |
| ------------- | ------ | ------------ |
| `description` | string | Optional     |
| `duration`    | object | **Required** |
| `name`        | string | **Required** |

#### description

`description`

- is optional
- type: `string`

##### description Type

`string`

#### duration

`duration`

- is **required**
- type: `object`

##### duration Type

`object` with following properties:

| Property  | Type   | Required |
| --------- | ------ | -------- |
| `hours`   | number | Optional |
| `minutes` | number | Optional |
| `offset`  | object | Optional |

#### hours

`hours`

- is optional
- type: `number`

##### hours Type

`number`

#### minutes

`minutes`

- is optional
- type: `number`

##### minutes Type

`number`

#### offset

`offset`

- is optional
- type: `object`

##### offset Type

`object` with following properties:

| Property  | Type   | Required |
| --------- | ------ | -------- |
| `hours`   | number | Optional |
| `minutes` | number | Optional |

#### hours

`hours`

- is optional
- type: `number`

##### hours Type

`number`

#### minutes

`minutes`

- is optional
- type: `number`

##### minutes Type

`number`

#### name

`name`

- is **required**
- type: `string`

##### name Type

`string`

## steps

An array of steps that make up the task. Each step is either a single actor, or a "simo", which represents multiple
actors which perform a step simultaneously. Each entry in the array can be visualized as a row (consisting of multiple
steps) in the output table.

`steps`

- is **required**
- type: `object[]`
- defined in this schema

### steps Type

Array type: `object[]`

All items must be of the type: `object` with following properties:

| Property | Type   | Required |
| -------- | ------ | -------- |
| `simo`   | object | Optional |

#### simo

An array of actors. A simo represents multiple actors whom preform steps simultaneously. This is rendered in the table
as aligning the first step for each actor in the array of steps. This can be visualized in the table as a single row
(consisting of multiple steps), with entries for each column associated with the actors identified in the array. Each
simo consists of an array of actors that perform steps simultaneously.

`simo`

- is optional
- type: `object`

##### simo Type

`object` with following properties:

| Property | Type | Required |
| -------- | ---- | -------- |


## title

`title`

- is **required**
- type: `string`
- defined in this schema

### title Type

`string`
