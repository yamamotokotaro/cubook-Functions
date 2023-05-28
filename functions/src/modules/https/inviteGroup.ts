import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();
const cors = require('cors')({origin: true});

export default functions.region('asia-northeast1').https.onRequest((request, response) => {
  cors(request, response, () => {
    let res;
    const idToken = request.body.idToken;
    const first = request.body.first;
    const family = request.body.family;
    const call = request.body.call;
    const age = request.body.age;
    const position = request.body.position;
    const address = request.body.address;
    const team = request.body.team;
  
    admin.auth().verifyIdToken(idToken)
    .then(function (decodedToken) {
      const group = decodedToken.group;
    const groupRef = fireStore.collection('group').doc(group)
    groupRef.get()
      .then(docGroup => {
        const groupName = docGroup.get('name');
        if(team !== null){
          const createRef = fireStore.collection('join').doc();
          createRef.set({
            age: age,
            call: call,
            family: family,
            first: first,
            group: group,
            groupName: groupName,
            position: position,
            team: team
          }).then(doc => {
            createRef.id;
            if (doc === null) {
                response.send('No such document!');
            } else if (doc !== null) {
              const inviteCode = createRef.id;
              const citiesRef = fireStore.collection('mail');
              const text = family + first + '様\n\nあなたはcubookのグループ「'+ groupName +'」へ招待されました\nグループへの参加に必要な登録コードはこちらです\n\n' + inviteCode + '\n\nこのコードはアカウント作成後に入力します\n手順についてはcubookのホームページをご確認ください\nhttps://sites.google.com/view/cubookinfo/%E4%BD%BF%E3%81%84%E6%96%B9/%E6%8B%9B%E5%BE%85%E3%82%92%E5%8F%97%E3%81%91%E3%81%9F%E6%96%B9\n\nAppStore\nhttps://apps.apple.com/us/app/cubook/id1507520804?l=ja&ls=1\n\nGooglePlay\nhttps://play.google.com/store/apps/details?id=app.kotakota.cubook&hl=ja\n\ncubook';
              citiesRef.doc().set({
                to: address,
                message: {
                  subject:  'cubookグループ「'+ groupName + '」への招待が届いています',
                  text: text
                }
              }).then(function () {
                  res = 'success';
                  response.send(res);
              }).catch();
            }
          })
              .catch(err => {
              res = 'not found';
              response.send(res);
          });
        } else {
          const createRef = fireStore.collection('join').doc();
          createRef.set({
            age: age,
            call: call,
            family: family,
            first: first,
            group: group,
            groupName: groupName,
            position: position
          }).then(doc => {
            createRef.id;
            if (doc === null) {
                response.send('No such document!');
            } else if (doc !== null) {
              const inviteCode = createRef.id;
              const citiesRef = fireStore.collection('mail');
              const text = family + first + '様\n\nあなたはcubookのグループ「'+ groupName +'」へ招待されました\nグループへの参加に必要な登録コードはこちらです\n\n' + inviteCode + '\n\nこのコードはアカウント作成後に入力します\n手順についてはcubookのホームページをご確認ください\nhttps://sites.google.com/view/cubookinfo/%E4%BD%BF%E3%81%84%E6%96%B9/%E6%8B%9B%E5%BE%85%E3%82%92%E5%8F%97%E3%81%91%E3%81%9F%E6%96%B9\n\nAppStore\nhttps://apps.apple.com/us/app/cubook/id1507520804?l=ja&ls=1\n\nGooglePlay\nhttps://play.google.com/store/apps/details?id=app.kotakota.cubook&hl=ja\n\ncubook';
              citiesRef.doc().set({
                to: address,
                message: {
                  subject: 'cubookグループ「'+ groupName + '」への招待が届いています',
                  text: text
                }
              }).then(function () {
                  res = 'success';
                  response.send(res);
              }).catch();
            }
          }).catch(err => {
            res = 'not found';
            response.send(res);
          });
        }
      }).catch(function (error) {
        // Handle error
        res = 'not found';
        response.send(res);
      });
    }).catch(function (error) {
      // Handle error
      res = 'not found';
      response.send(res);
    });
  });
});