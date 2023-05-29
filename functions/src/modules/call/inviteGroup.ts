import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

export default functions.region("asia-northeast1").https.onCall(async (data, context) => {
  let res;
  const first = data.first;
  const family = data.family;
  const call = data.call;
  const age = data.age;
  const position = data.position;
  const address = data.address;
  const team = data.team;

  const group = context.auth?.token.group;
  const groupRef = fireStore.collection("group").doc(group)
  const docGroup = await groupRef.get();
  const groupName = docGroup.get("name");
  if (team !== null) {
    const createRef = fireStore.collection("join").doc();
    await createRef.set({
      age: age,
      call: call,
      family: family,
      first: first,
      group: group,
      groupName: groupName,
      position: position,
      team: team ?? ""
    })
    const inviteCode = createRef.id;
    const citiesRef = fireStore.collection("mail");
    const text = family + first + "様\n\nあなたはcubookのグループ「" + groupName + "」へ招待されました\nグループへの参加に必要な登録コードはこちらです\n\n" + inviteCode + "\n\nこのコードはアカウント作成後に入力します\n手順についてはcubookのホームページをご確認ください\nhttps://sites.google.com/view/cubookinfo/%E4%BD%BF%E3%81%84%E6%96%B9/%E6%8B%9B%E5%BE%85%E3%82%92%E5%8F%97%E3%81%91%E3%81%9F%E6%96%B9\n\nAppStore\nhttps://apps.apple.com/us/app/cubook/id1507520804?l=ja&ls=1\n\nGooglePlay\nhttps://play.google.com/store/apps/details?id=app.kotakota.cubook&hl=ja\n\ncubook";
    await citiesRef.doc().set({
      to: address,
      message: {
        subject: "cubookグループ「" + groupName + "」への招待が届いています",
        text: text
      }
    })
    res = "success";
    return res;
  } else {
    return "error";
  }
});