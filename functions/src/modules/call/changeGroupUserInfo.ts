import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export default functions.region("asia-northeast1").https.onCall(async (data, context) => {
  const db = getFirestore();
  let res;
  const uid = data.uid;
  const family = data.family;
  const first = data.first;
  const team = data.team;
  const teamPosition = data.teamPosition;
  const grade = data.grade;
  const age = data.age;
  const age_turn = data.age_turn;
  const call = data.call;
  const group = context.auth?.token.group;
  const userRef = db.collection("user").where("group", "==", group).where("uid", "==", uid);
  const userDoc = await userRef.get()
  if (userDoc === null) {
    return "No such document!";
  } else if (userDoc !== null) {
    if (team !== null && grade !== null && teamPosition !== null) {
      const setUserRef = db.collection("user").doc(userDoc.docs[0].id);
      await setUserRef.update({
        name: family + first,
        family: family,
        first: first,
        call: call,
        team: team,
        teamPosition: teamPosition,
        age: age,
        age_turn: age_turn,
        grade: grade
      })
      await admin.auth().setCustomUserClaims(uid, {
        name: family + first,
        family: family,
        first: first,
        call: call,
        team: team,
        teamPosition: teamPosition,
        age: age,
        age_turn: age_turn,
        position: "scout",
        group: group,
        grade: grade
      })
      res = "success";
      return res;
    }
    else if (team !== null && grade !== null) {
      const setUserRef = db.collection("user").doc(userDoc.docs[0].id);
      await setUserRef.update({
        name: family + first,
        family: family,
        first: first,
        call: call,
        team: team,
        age: age,
        age_turn: age_turn,
        grade: grade
      });
      await admin.auth().setCustomUserClaims(uid, {
        name: family + first,
        family: family,
        first: first,
        call: call,
        team: team,
        age: age,
        age_turn: age_turn,
        position: "scout",
        group: group,
        grade: grade
      })
      res = "success";
      return res;
    } else {
      const setUserRef = db.collection("user").doc(userDoc.docs[0].id);
      await setUserRef.update({
        name: family + first,
        family: family,
        first: first,
        call: call,
        age: age,
      });
      await admin.auth().setCustomUserClaims(uid, {
        name: family + first,
        family: family,
        first: first,
        call: call,
        age: age,
        position: "scout",
        group: group
      });
      res = "success";
      return res;

    }
  } else {
    return "error";
  }
});