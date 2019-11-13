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
| [css](#css)                       | `string`   | Optional     | No       | (this schema)                              |
| [procedure_name](#procedure_name) | `string`   | **Required** | No       | (this schema)                              |
| [tasks](#tasks)                   | `object[]` | **Required** | No       | (this schema)                              |
| `*`                               | any        | Additional   | Yes      | this schema _allows_ additional properties |

## actors

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

`name`

- is optional
- type: `string`

##### name Type

`string`

## css

`css`

- is optional
- type: `string`
- defined in this schema

### css Type

`string`

## procedure_name

`procedure_name`

- is **required**
- type: `string`
- defined in this schema

### procedure_name Type

`string`

## tasks

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

`file`

- is optional
- type: `string`

##### file Type

`string`

#### roles

`roles`

- is optional
- type: `object`

##### roles Type

`object` with following properties:

| Property | Type | Required |
| -------- | ---- | -------- |

