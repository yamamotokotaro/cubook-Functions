import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const axios = require("axios");
const fireStore = admin.firestore();

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "1GB" as "1GB",
};
export default functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onRequest(async (request, response) => {
    const searchRef = fireStore.collection("group");
    const searchDocs = (await searchRef.get()).docs;
    for (const searchDoc of searchDocs) {
      const url = encodeURI(
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?&inputtype=textquery&fields=geometry&key=AIzaSyCGzUSIoJhpSwCzC7m2bK8pmQHblVxwKTw&input=" +
          searchDoc.get("name")
      );
      console.log(url);
      const resp = await axios.get(url);
      if (resp.data.candidates.length !== 0) {
        await fireStore.collection("group").doc(searchDoc.id).update({
          location: resp.data.candidates[0]["geometry"]["location"],
        });
      }
    }
    response.send("finished");
  });
