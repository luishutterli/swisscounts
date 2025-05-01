# swisscounts

# API Endpunkte

| **Method** | **Path**                  | **Purpose**                             |
|------------|---------------------------|-----------------------------------------|
| GET        | /:org/customers           | Alle Kunden auflisten                   |
| POST       | /:org/customers           | Einen neuen Kunden anlegen              |
| PATCH      | /:org/customers/:id       | Einen Kunden ändern                     |
| GET        | /:org/inventory/items     | Inventar einer Organisation auflisten   |
| POST       | /:org/inventory/items     | Ein neues Objekt im Inventar anlegen    |
| PATCH      | /:org/inventory/items/:id | Ein Objekt im Inventar ändern           |
| GET        | /:org/invoices            | Alle Rechnungen auflisten               |
| GET        | /:org/invoices/:id        | Alle Informationen zur Rechnung abrufen |
| POST       | /:org/invoices            | Eine neue Rechnung erstellen            |
| PATCH      | /:org/invoices/:id        | Eine Rechnung ändern                    |
| GET        | /:org/coupons             | Alle Gutscheine auflisten               |
| POST       | /:org/coupons             | Einen neuen Gutschein anlegen           |
| PATCH      | /:org/coupons/:id         | Einen Gutschein ändern                  |
| GET        | /:org/expenses            | Alle Ausgaben auflisten                 |
| POST       | /:org/expenses            | Eine neue Ausgabe erstellen             |
| PATCH      | /:org/expenses/:id        | Eine Ausgabe ändern                     |