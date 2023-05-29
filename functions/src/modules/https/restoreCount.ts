import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "2GB" as const,
};

export default functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onRequest((request, response) => {
    const serchRef = fireStore
      .collection("user")
      .where("position", "==", "scout");
    let batch = fireStore.batch();
    let batchCounter = 0;
    let user_length = 0;
    let user_count = 0;
    serchRef
      .get()
      .then(async (doc) => {
        const documents = doc.docs;
        user_length = documents.length;
        for (const snapshot of documents) {
          const types = [
            "risu",
            "usagi",
            "sika",
            "kuma",
            "challenge",
            "syokyu",
            "nikyu",
            "ikkyu",
            "kiku",
            "hayabusa",
            "fuji",
            "gino",
          ];
          for (const type of types) {
            const restoreRef = fireStore
              .collection(type)
              .where("uid", "==", snapshot.get("uid"));
            const doc_restore = restoreRef.get();
            const documents_restore = (await doc_restore).docs;
            const signCount: { [index: string]: any } = {};
            for (const snapshot_restore of documents_restore) {
              let count_part = 0;
              const page = snapshot_restore.get("page");
              const signed = snapshot_restore.get("signed");
              if (signed !== undefined) {
                for (const key of Object.keys(signed)) {
                  const element = signed[key];
                  if (element["phaze"] === "signed") {
                    count_part++;
                  }
                }
              }
              if (count_part !== 0 && page !== undefined) {
                signCount[page.toString()] = count_part;
              }
            }
            const setUserRef = fireStore.collection("user").doc(snapshot.id);
            batch.update(setUserRef, { [type]: signCount });
            batchCounter++;
            if (batchCounter >= 490) {
              await batch.commit();
              batch = fireStore.batch();
              batchCounter = 0;
            }
          }
          user_count++;
          if (user_count % 20 === 0) {
            console.log(
              String(user_count) + "/" + String(user_length) + " completed"
            );
          }
        }
        if (batchCounter !== 0) {
          await batch.commit();
        }
        response.send("success");
      })
      .catch();
  });
