import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
const {Storage} = require('@google-cloud/storage');
const fireStore = admin.firestore();
const storage = new Storage();
const cors = require('cors')({origin: true});

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "256MB" as "256MB"
}

export default functions.runWith(runtimeOpts).region('asia-northeast1').https.onRequest((request, response) => {
    cors(request, response, () => {
        let res;
        const idToken = request.body.idToken;
        const uid = request.body.uid;
    
        admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
            const group = decodedToken.group;
            const operatorUid = decodedToken.uid;
            const operatorName = decodedToken.name;
            const userRef = fireStore.collection('user').where('group', '==', group).where('uid', '==', uid);
            userRef.get()
            .then(docGroup => {
                const userSnapshot = docGroup.docs[0];
                const listCollection = ['risu', 'usagi', 'sika', 'kuma', 'tukinowa', 'challenge', 'syokyu', 'nikyu', 'ikkyu', 'kiku', 'hayabusa', 'fuji','task','effort'];
                for(const category of listCollection){
                    const collectionRef = fireStore.collection(category).where('group', '==', group).where('uid', '==', uid);
                    collectionRef.get()
                    .then(query => {
                        const docs = query.docs;
                        for(const collectionSnapshot of docs){
                            fireStore.collection(category).doc(collectionSnapshot.id).delete().then().catch();
                        }
                    }).catch();
                }
                fireStore.collection('log').add({
                    'operator':operatorUid,
                    'operatorName': operatorName,
                    'type':'deleteGroupAccount',
                    'uid':uid,
                    'name':userSnapshot.get('name'),
                    'age':userSnapshot.get('age'),
                    'grade':userSnapshot.get('grade'),
                    'group':userSnapshot.get('group')
                }).then(function() {
                    storage.bucket('cubook-3c960.appspot.com').deleteFiles({ prefix: group + '/' + uid + '/' }, function() {
                        fireStore.collection('user').doc(userSnapshot.id).delete().then(function(){
                            res = 'sucess';
                            response.send(res);
                        }).catch();
                    })
                    // storage.bucket('cubook-dev.appspot.com').file(uid).delete().then(function(){
                    //     fireStore.collection('user').doc(userSnapshot.id).delete().then(function(){
                    //         res = 'not found';
                    //         response.send(res);
                    //     }).catch();
                    // }).catch();
                }).catch();
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