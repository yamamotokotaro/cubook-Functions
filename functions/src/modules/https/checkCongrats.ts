import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

export default functions.region("asia-northeast1").https.onRequest((request, response) => {
  const serchRef = fireStore.collection("effort");
  let count_part = 0;
  serchRef.get()
    .then(doc => {
      const documents = doc.docs;
      for (const snapshot of documents) {
        count_part += snapshot.get("congrats");
      }
      response.send(count_part.toString());
    }).catch(error => {
      response.send("error");
    });
});