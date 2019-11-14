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
