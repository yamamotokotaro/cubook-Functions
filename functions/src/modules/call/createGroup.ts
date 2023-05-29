import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

export default functions.region("asia-northeast1").https.onCall(async (data, context) => {
  let res;
  const uid = context.auth!.uid;
  const first = data.first;
  const family = data.family;
  const groupName = data.groupName;
  let grade = data.grade;
  const createRef = fireStore.collection("group").doc();
  if (grade === null) {
    grade = "cub";
  }
  await createRef.set({
    name: groupName,
    grade: grade
  })
  const group = createRef.id;
  const call = "さん";
  const age = "leader";
  const position = "leader";
  await admin.auth().setCustomUserClaims(uid, {
    name: family + first,
    group: group,
    family: family,
    first: first,
    call: call,
    age: age,
    position: position,
    admin: true,
    owner: true,
    grade: grade,
    groupName: groupName
  });
  const citiesRef = fireStore.collection("user");
  await citiesRef.doc().set({
    name: family + first,
    group: group,
    family: family,
    first: first,
    call: call,
    age: age,
    position: position,
    uid: uid,
    admin: true,
    owner: true,
    grade: grade,
    groupName: groupName
  });
  res = "success";
  return res;
});