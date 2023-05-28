import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const fireStore = admin.firestore();

export default functions.region('asia-northeast1').https.onRequest((request, response) => {
    const serchRef = fireStore.collection('effort');
    let count_part:number = 0;
    serchRef.get()
    .then(doc => {
      const documents = doc.docs;
      for(let i=0; i<documents.length; i++){
        const snapshot = documents[i];
        count_part += snapshot.get('congrats');
      }
      response.send(count_part.toString());
    }).catch(error => {
      response.send('error');
    });
  });