import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

const runtimeOpts = {
    timeoutSeconds: 540,
}

export default functions.runWith(runtimeOpts).region('asia-northeast1').https.onRequest((request, response) => {
    const serchRef = fireStore.collection("task").where('group','==',' j27DETWHGYEfpyp2Y292').orderBy('date', "desc").limit(2);
    serchRef.get()
    .then(doc => {
      const documents = doc.docs;
        for(let i=0; i<documents.length; i++){
          const snapshot = documents[i];
          const challengeRef = fireStore.collection(snapshot.get('type')).where('group', '==', snapshot.get('group')).where('uid', '==', snapshot.get('uid')).where('page', '==', snapshot.get('page'));
          challengeRef.get()
          .then(doc_challenge => {
            const documents_challenge = doc_challenge.docs;
            let signData = documents_challenge[0].get('signed');
            signData[snapshot.get('number').toString()]['data'] = snapshot.get('data');
            const setUserRef = fireStore.collection(snapshot.get('type')).doc(documents_challenge[0].id);
            setUserRef.update({
              'signed': signData
            }).then().catch();
          }).catch()
        }
        response.send('success');
    }).catch();
  });