- [ ] Update the dummy frontend after changes (easy)
  - If the unit tests are good, might want to get rid of it.

- [ ] Unit test (easy but tricky?)
  - Note that `routes` export from `routes.ts` is callable, so the idea
  is to in beginning of tests cleaning out whole DB and then making tests
  that are "user stories".
  - Make changes to `db.ts` and functionalize it so that you can import app vs test version it.
  - Need to look into `doc.ts` file to see how to use proper version of it during app vs test.