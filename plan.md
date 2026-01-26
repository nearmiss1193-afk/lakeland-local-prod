# Database Schema Plan

## Table: `businesses`

This table stores the core information for each local business listed in the directory.

| Column Name      | Data Type | Constraints             | Description                                                                 |
| :--------------- | :-------- | :---------------------- | :-------------------------------------------------------------------------- |
| `id`             | UUID      | Primary Key, Default: `gen_random_uuid()` | Unique identifier for the business.                                         |
| `name`           | Text      | Not Null                | The official name of the business.                                          |
| `address`        | Text      | Not Null                | Full physical address.                                                      |
| `category`       | Text      |                         | Primary category (e.g., "Cafe", "Mechanic").                                |
| `vibe_summary`   | Text      |                         | AI-generated summary of the business "vibe" and offerings.                  |
| `claimed_status` | Boolean   | Default: `false`        | content: whether the business page has been claimed by the owner.           |
| `contact_info`   | JSONB     |                         | Flexible field for phone, email, website, social links. e.g., `{"phone": "...", "website": "..."}` |
| `created_at`     | Timestamp | Default: `now()`        | Record creation timestamp.                                                  |
| `updated_at`     | Timestamp | Default: `now()`        | Record last update timestamp.                                               |

## Notes

- **RLS Policies**: We will need to enforce Row Level Security.
    - Public read access for confirmed businesses.
    - Write access restricted to service roles or authenticated business owners (future).
- **Indexing**: Index `category` and `name` for faster search functionality.
