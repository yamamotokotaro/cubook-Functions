import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

export default functions.region('asia-northeast1').https.onCall((data, context) => {
    const idToken = data.idToken;
    const uid = data.uid;
    const family = data.family;
    const first = data.first;
    const team = data.team;
    const teamPosition = data.teamPosition;
    const grade = data.grade;
    const age = data.age;
    const age_turn = data.age_turn;
    const call = data.call;
    console.log('kita1');
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          console.log('kita2');
        const userRef = fireStore.collection('user').where('group', '==', decodedToken.group).where('uid', '==', uid);
        userRef.get().then(doc => {
          console.log('kita3');
          const setUserRef = fireStore.collection('user').doc(doc.docs[0].id);
          console.log({
            name: family + first,
            family: family,
            first: first,
            call: call,
            team: team,
            teamPosition: teamPosition,
            age: age,
            age_turn: age_turn,
            grade: grade
          });
          setUserRef.update({
            name: family + first,
            family: family,
            first: first,
            call: call,
            team: team,
            teamPosition: teamPosition,
            age: age,
            age_turn: age_turn,
            grade: grade
          }).then(function(){
            admin.auth().setCustomUserClaims(uid, {
              name: family + first,
              family: family,
              first: first,
              call: call,
              team: team,
              teamPosition: teamPosition,
              age: age,
              age_turn: age_turn,
              position: 'scout',
              group: decodedToken.group,
              grade: grade
            }).then(function() {
              return { msg: 'sucess' };
            }).catch(function(){
              return { msg: 'error' };
            });
          }).catch(function(){
            return { msg: 'error' };
          });
        }).catch(err => {
          return { msg: 'error' };
        });
    }).catch(function (error) {
      return { msg: 'error' };
    });
    return 'sucess';
  });