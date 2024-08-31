- [ ] Update the dummy frontend after changes (easy)
  - If the unit tests are good, might want to get rid of it.

- [X] Unit test (easy but tricky?)
  - Note that `routes` export from `routes.ts` is callable, so the idea
  is to in beginning of tests cleaning out whole DB and then making tests
  that are "user stories".
  - Make changes to `db.ts` and functionalize it so that you can import app vs test version it.
  - Need to look into `doc.ts` file to see how to use proper version of it during app vs test.

- [X] Do route validation. I think we should *not* generate this from TS
      schemas since it's rather a security feature happening in HTTP parsing piece.
      The functions in concepts should only expect valid values.
  - Not sure how yet, but one idea is to add it to decorator as Zod object.

- [ ] Find out a way to export route funciton types (for frontend).