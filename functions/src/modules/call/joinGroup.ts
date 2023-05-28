import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

export default functions.region('asia-northeast1').https.onCall(async (data, context) => {
    let res;
  
    const joinCode = data.joinCode;
    const uid: string = context.auth!.uid!;
    let grade: string = '';

    const joinRef = fireStore.collection('join').doc(joinCode)
    const doc = await joinRef.get()
    if(!doc.exists){
      return 'not found';
    } else {
      let ageTurn;
      switch (doc.get('age')) {
        case 'risu':
          ageTurn = 4;
          grade = 'cub';
          break;
        case 'usagi':
          ageTurn = 7;
          grade = 'cub';
          break;
        case 'sika':
          ageTurn = 8;
          grade = 'cub';
          break;
        case 'kuma':
          ageTurn = 9;
          grade = 'cub';
          break;
        case 'syokyu':
          ageTurn = 12;
          grade = 'boy';
          break;
        case 'nikyu':
          ageTurn = 13;
          grade = 'boy';
          break;
        case 'ikkyu':
          ageTurn = 14;
          grade = 'boy';
          break;
        case 'kiku':
          ageTurn = 15;
          grade = 'boy';
          break;
        case 'hayabusa':
          ageTurn = 16;
          grade = 'venture';
          break;
        case 'fuji':
          ageTurn = 17;
          grade = 'venture';
          break;
        case 'leader':
          ageTurn = 100;
          grade = 'cub';
          break;
    }
    const group = doc.get('group');
    const family = doc.get('family');
    const first = doc.get('first');
    const call = doc.get('call');
    const age = doc.get('age');
    const age_turn = ageTurn;
    const position = doc.get('position');
    const team = doc.get('team');
    const groupRef = fireStore.collection('group').doc(group)

    const docGroup = await groupRef.get();
    const groupName = docGroup.get('name');
    await admin.auth().setCustomUserClaims(uid, {
      name: family + first,
      group: group,
      family: family,
      first: first,
      call: call,
      age: age,
      admin: false,
      owner: false,
      age_turn: age_turn,
      position: position,
      team: team ?? "",
      grade: grade,
      groupName: groupName
    });

    const citiesRef = fireStore.collection('user');
    await citiesRef.doc().set({
      name: family + first,
      group: group,
      family: family,
      first: first,
      call: call,
      age: age,
      admin: false,
      owner: false,
      age_turn: age_turn,
      position: position,
      team: team ?? "",
      uid: uid,
      grade: grade,
      groupName: groupName
    })
    const deleteRef = fireStore.collection('join').doc(joinCode)
    await deleteRef.delete()
    res = 'success';
    return res;
  }
})