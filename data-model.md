# Data Model

> Define the entities, attributes, and relationships that make up your
> system's data layer. This document helps you think through your schema
> before writing any code.

## 1. Entities

<!-- List every "thing" your system stores. For each entity, describe what it
     represents and why it exists. -->

### Entity: bearing_specs

- **Description:** Canonical bearing geometry reference. For MVP this contains one 6205 record but keeps the model extensible.
- **Attributes:**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Primary document id |
| code | string | Yes | Bearing code, e.g. `6205` |
| inner_diameter_mm | number | Yes | Bore diameter (25 for 6205) |
| outer_diameter_mm | number | Yes | Outer diameter (52 for 6205) |
| width_mm | number | Yes | Bearing width (15 for 6205) |
| ball_count | integer | Yes | Number of balls used in visualization |
| ball_diameter_mm | number | Yes | Visual ball diameter |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

### Entity: spin_presets

- **Description:** Named animation configurations users save and reload.
- **Attributes:**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Primary document id |
| name | string | Yes | Human-readable unique preset name |
| bearing_spec_id | string (UUID) | Yes | Reference to `bearing_specs.id` |
| rpm | number | Yes | Target rotation speed |
| direction | string enum | Yes | `cw` or `ccw` |
| camera_zoom | number | No | Optional UI preference |
| is_default | boolean | Yes | Indicates default preset in UI |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

### Entity: spin_runs

- **Description:** Historical records for completed or stopped spin sessions.
- **Attributes:**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Primary document id |
| preset_id | string (UUID) | Yes | Reference to `spin_presets.id` |
| bearing_spec_id | string (UUID) | Yes | Reference to `bearing_specs.id` |
| run_started_at | datetime | Yes | Session start time |
| run_ended_at | datetime | Yes | Session end time |
| duration_ms | integer | Yes | Derived run duration |
| avg_rpm | number | Yes | Average effective RPM during run |
| max_rpm | number | Yes | Peak RPM during run |
| direction | string enum | Yes | Direction used in run |
| notes | string | No | Optional run note |
| created_at | datetime | Yes | Creation timestamp |

## 2. Relationships

<!-- How do entities relate to each other? Specify cardinality (1:1, 1:N, M:N)
     and which side owns the foreign key. -->

| From | To | Type | Description |
|------|----|------|-------------|
| spin_presets.bearing_spec_id | bearing_specs.id | N:1 | Many presets can target one bearing spec |
| spin_runs.preset_id | spin_presets.id | N:1 | Many runs can reference one preset |
| spin_runs.bearing_spec_id | bearing_specs.id | N:1 | Run stores explicit spec reference for denormalized read simplicity |

## 3. Constraints

<!-- Business rules and data integrity constraints that the schema must enforce.
     Think about uniqueness, referential integrity, and valid value ranges. -->

- `bearing_specs.code` must be unique; MVP must include `6205`.
- 6205 dimensions must remain consistent: inner 25, outer 52, width 15 (mm).
- `spin_presets.name` must be unique.
- `spin_presets.rpm` must be within allowed range (for example 0 <= rpm <= 6000).
- `spin_presets.direction` and `spin_runs.direction` must be one of `cw`, `ccw`.
- `spin_runs.run_ended_at` must be greater than or equal to `spin_runs.run_started_at`.
- `spin_runs.duration_ms` must equal or match derived duration from start/end timestamps.

## 4. Visualization

```id
erDiagram
    bearing_specs {
        string id PK "UUID"
        string code UK "e.g. 6205"
        number inner_diameter_mm "25 mm"
        number outer_diameter_mm "52 mm"
        number width_mm "15 mm"
        int ball_count "number of balls"
        number ball_diameter_mm "visual ball size"
        datetime created_at
        datetime updated_at
    }

    spin_presets {
        string id PK "UUID"
        string name UK "unique preset name"
        string bearing_spec_id FK "-> bearing_specs.id"
        number rpm "0-6000"
        string direction "cw | ccw"
        number camera_zoom "optional"
        boolean is_default
        datetime created_at
        datetime updated_at
    }

    spin_runs {
        string id PK "UUID"
        string preset_id FK "-> spin_presets.id"
        string bearing_spec_id FK "-> bearing_specs.id"
        datetime run_started_at
        datetime run_ended_at
        int duration_ms
        number avg_rpm
        number max_rpm
        string direction "cw | ccw"
        string notes "optional"
        datetime created_at
    }

    bearing_specs ||--o{ spin_presets : "has many"
    bearing_specs ||--o{ spin_runs : "referenced by"
    spin_presets ||--o{ spin_runs : "has many"
```
