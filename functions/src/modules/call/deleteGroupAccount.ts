import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const { Storage } = require("@google-cloud/storage");
const fireStore = admin.firestore();
const storage = new Storage();

const runtimeOpts = {
    timeoutSeconds: 180,
    memory: "256MB" as const
}

export default functions.runWith(runtimeOpts).region("asia-northeast1").https.onCall(async (data, context) => {
    let res;
    const uid = context.auth?.uid;
    const decodedToken = context.auth?.token;
    const group = decodedToken!.group;
    const operatorUid = decodedToken!.uid;
    const operatorName = decodedToken!.name;
    const userRef = fireStore.collection("user").where("group", "==", group).where("uid", "==", uid);
    const docsGroup = await userRef.get();
    const userSnapshot = docsGroup.docs[0];
    const listCollection = ["risu", "usagi", "sika", "kuma", "tukinowa", "challenge", "syokyu", "nikyu", "ikkyu", "kiku", "hayabusa", "fuji", "task", "effort"];
    for (const category of listCollection) {
        const collectionRef = fireStore.collection(category).where("group", "==", group).where("uid", "==", uid);
        const collectionDocs = await collectionRef.get();
        const docs = collectionDocs.docs;
        for (const collectionSnapshot of docs) {
            fireStore.collection(category).doc(collectionSnapshot.id).delete().then().catch();
        }
    }
    await fireStore.collection("log").add({
        "operator": operatorUid,
        "operatorName": operatorName,
        "type": "deleteGroupAccount",
        "uid": uid,
        "name": userSnapshot.get("name"),
        "age": userSnapshot.get("age"),
        "grade": userSnapshot.get("grade"),
        "group": userSnapshot.get("group")
    });
    await storage.bucket("cubook-3c960.appspot.com").deleteFiles({ prefix: group + "/" + uid + "/" });
    await fireStore.collection("user").doc(userSnapshot.id).delete();
    res = "sucess";
    return res;
});