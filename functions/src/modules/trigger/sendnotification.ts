import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

export default functions.region('asia-northeast1').firestore.document('notification/{notification}').onCreate((data, context) => {
    const uid = data.get('uid');
    const group = data.get('group');
    const body = data.get('body');
    // const type = data.get('type');
    // const page = data.get('page');
    // const number = data.get('number');
    const searchUidRef = fireStore.collection('user').where('group','==',group).where('uid', '==', uid);
    searchUidRef.get()
    .then(doc => {
      const userData = doc.docs[0];
      if(userData.get('token_notification') !== null){
        if(userData.get('token_notification').length != 0){
          const message = {
            notification: {
              title: body,
              body: 'フィードバックを確認しよう！'
            },
            tokens: userData.get('token_notification')
          };
        
          admin.messaging().sendMulticast(message)
            .then((response_FCM) => {
              return 0;
          }).catch();
        }
      }
    }).then().catch();
    return 0;
  });