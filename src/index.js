const app = require("express")();

const faunadb = require("faunadb");
const client = new faunadb.Client({
  secret: "YOUR-SECRET-KEY",
});

// FQL Functions
const {
  Get,
  Ref,
  Paginate,
  Match,
  Index,
  Create,
  Collection,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

app.get("/tweet", async (req, res) => {
  try {
    const docs = await client.query(
      Paginate(
        Match(Index("tweets_by_user"), Call(Fn("getUser"), "@mosqueradvd"))
      )
    );

    res.send(docs);
  } catch (e) {
    res.send(e);
  }
});

app.get("/tweet/:tweet_id", async (req, res) => {
  try {
    const document = await client.query(
      Get(Ref(Collection("tweets"), req.params.tweet_id))
    );
    res.send(document);
  } catch (e) {
    res.send(e);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const docs = await client.query(
      Paginate(
        Join(
          Match(
            Index("followees_by_follower"),
            Call(Fn("getUser"), "@mosqueradvd")
          ),
          Index("tweets_by_user")
        )
      )
    );
    res.send(docs);
  } catch (e) {
    res.send(e);
  }
});

app.post("/tweet", async (req, res) => {
  try {
    const data = {
      user: Call(Fn("getUser"), "@mphoenix"),
      text: "MY 2nd TWEET...",
    };

    const doc = await client.query(Create(Collection("tweets"), { data }));

    res.send(doc);
  } catch (e) {
    res.send(e);
  }
});

app.post("/relationships", async (req, res) => {
  try {
    const data = {
      follower: Call(Fn("getUser"), "@mphoenix"),
      followee: Call(Fn("getUser"), "@mosqueradvd"),
    };

    const doc = await client.query(
      Create(Collection("relationships"), { data })
    );

    res.send(doc);
  } catch (e) {
    res.send(e);
  }
});

app.listen(5000, console.log("API on http://localhost:5000"));
