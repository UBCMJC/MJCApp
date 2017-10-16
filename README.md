# MJCApp
Website for recording MJC league games and recording the resulting statistics and ranking of players.

## Set Up

### Prerequisites

Start by installing [meteor](https://www.meteor.com/install) in your environment.

```
curl https://install.meteor.com | sh
```

You will also need to install the `babel-runtime` package.

```
meteor npm install --save babel-runtime
```

### Deployment

In the root directory of the repository, run `meteor` to begin.

Then, you may go to `http://localhost:3000` to view the application.

#### Utilising */admin

In order to use the MJCApp/admin page for user management, it is required to manually configure an additional database collection for admin credentials.

To access the database of a deployed instance of MJCApp, you must use the Meteor MongoDB interface.

```
meteor mongo
```

Once the interface loads, you must add an admin credentials collection.

```
db.createCollection("admin")
```

Once this collection is created, you must add in the admin login token.

```
db.admin.insert({"token": "{PASSWORD}"})
```

`{PASSWORD}` here denotes what you would like the password to be.

Once this is done, you should be able to access the */admin subdirectory of the site.