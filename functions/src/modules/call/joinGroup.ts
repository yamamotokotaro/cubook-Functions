import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();
const cors = require('cors')({origin: true});

export default functions.region('asia-northeast1').https.onRequest((request, response) => {
  cors(request, response, () => {
    let res;
  
    const idToken = request.body.idToken;
    const joinCode = request.body.joinCode;
    let grade: String;
  
   admin.auth().verifyIdToken(idToken)
     .then(function(decodedToken) {
      const joinRef = fireStore.collection('join').doc(joinCode)
      joinRef.get()
      .then(doc => {
        const myData = doc.data();
        if (!doc.exists) {
          response.send('No such document!')
        } else if(myData !== null) {
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
          const uid = decodedToken.uid;
          const groupRef = fireStore.collection('group').doc(group)
          groupRef.get()
            .then(docGroup => {
              const groupName = docGroup.get('name');
              if(team !== null){
                admin.auth().setCustomUserClaims(uid, {
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
                  team: team,
                  grade: grade,
                  groupName: groupName
                }).then(function() {
                  const citiesRef = fireStore.collection('user');
                  citiesRef.doc().set({
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
                    team: team,
                    uid: uid,
                    grade: grade,
                    groupName: groupName
                  }).then(function(){
                    const deleteRef = fireStore.collection('join').doc(joinCode)
                    deleteRef.delete()
                    .then(function() {
                      res = 'success';
                      response.send(res);
                    }).catch();
                  }).catch();
                  // Tell client to refresh token on user.
                }).catch(function(error) {
                  res = 'error';    
                  response.send(res);    // Handle error
                });
              } else {
                admin.auth().setCustomUserClaims(uid, {
                  name: family + first,
                  group: group,
                  family: family,
                  first: first,
                  call: call,
                  age: age,
                  position: position,
                  grade: grade,
                  groupName: groupName
                }).then(function() {
                  const citiesRef = fireStore.collection('user');
                  citiesRef.doc().set({
                    name: family + first,
                    group: group,
                    family: family,
                    first: first,
                    call: call,
                    age: age,
                    position: position,
                    uid: uid,
                    grade: grade,
                    groupName: groupName
                  }).then(function(){
                    const deleteRef = fireStore.collection('join').doc(joinCode)
                    deleteRef.delete()
                    .then(function() {
                      res = 'success';
                      response.send(res);
                    }).catch();
                  }).catch();
                  // Tell client to refresh token on user.
                }).catch(function(error) {
                  res = 'error';    
                  response.send(res);    // Handle error
                });
              }
          }).catch(err => {
            res = 'not found';
            response.send(res);
          })
        }
      }).catch(err => {
        res = 'not found';
        response.send(res);
      })
    }).catch(function(error) {
            // Handle error
        res = 'not found';
        response.send(res);
    });
  });
})