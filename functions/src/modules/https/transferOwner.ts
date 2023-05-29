import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

export default functions.region("asia-northeast1").https.onRequest(async (request, response) => {

    const idToken = request.body.idToken;
    const uid = request.body.uid;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const isOwner = decodedToken.owner;
    const group = decodedToken.group;
    const operatorUid = decodedToken.uid;

    if(isOwner){
        const userRef = fireStore.collection("user").where("group", "==", group).where("uid", "==", uid);
        const userQuerySnapshot = await userRef.get();
        const snapshot = userQuerySnapshot.docs[0];
        const userGroup = snapshot.get("group");
        if(group === userGroup){
            const setUserRef = fireStore.collection("user").doc(snapshot.id);
            await setUserRef.update({
                owner: true,
                admin: true,
                age_turn: 1000,
            });
            await admin.auth().setCustomUserClaims(uid, {
                owner: true,
                admin: true,
                name: snapshot.get("name"),
                family: snapshot.get("family"),
                first: snapshot.get("first"),
                call: snapshot.get("call"),
                team: snapshot.get("team"),
                teamPosition: snapshot.get("teamPosition"),
                age: snapshot.get("age"),
                age_turn: 1000,
                position: snapshot.get("position"),
                group: snapshot.get("group"),
                grade: snapshot.get("grade"),
              })
              const operatorUserRef = fireStore.collection("user").where("uid", "==", operatorUid);
              const operatorUserQuerySnapshot = await operatorUserRef.get();
              const operatorSnapshot = operatorUserQuerySnapshot.docs[0];
              const setOperatorUserRef = fireStore.collection("user").doc(operatorSnapshot.id);
              await setOperatorUserRef.update({
                  owner: false,
                  admin: true,
                  age_turn: 1000,
              });
              await admin.auth().setCustomUserClaims(uid, {
                  owner: false,
                  admin: true,
                  name: snapshot.get("name"),
                  family: snapshot.get("family"),
                  first: snapshot.get("first"),
                  call: snapshot.get("call"),
                  team: snapshot.get("team"),
                  teamPosition: snapshot.get("teamPosition"),
                  age: snapshot.get("age"),
                  age_turn: 1000,
                  position: snapshot.get("position"),
                  group: snapshot.get("group"),
                  grade: snapshot.get("grade"),
                })
              
            response.send("success");
        } else {
            response.send("error");
        }
    } else {
        response.send("error");
    }
  });