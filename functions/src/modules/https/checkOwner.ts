import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const fireStore = admin.firestore();

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "256MB" as const,
};

export default functions.region("asia-northeast1").runWith(runtimeOpts).https.onRequest(async (request, response) => {
    const userRef = fireStore.collection("user").where("position", "==", "leader");
    const userQuerySnapshot = await userRef.get();
    const userDocuments = userQuerySnapshot.docs;
    let batch = fireStore.batch();
    let count = 0;
    for(const userDocumentSnapshot of userDocuments){
        const isAdmin = userDocumentSnapshot.get("admin");
        if(!isAdmin){
            batch.update(
                userDocumentSnapshot.ref,
                {
                    owner:false
                }
            )
        }
        count++;
        if(count === 500){
          await batch.commit();
          batch = fireStore.batch();
          count = 0;
        }
    }

    if (count >0){
      await batch.commit();
    }
    response.send("success");
});
