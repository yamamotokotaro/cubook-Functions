import * as functions from 'firebase-functions';
import { firestore, auth } from 'firebase-admin';
const cors = require('cors')({origin: true});

export default functions.region('asia-northeast1').https.onRequest((request, response) => {
    cors(request, response, () => {
        let res;
        const idToken = request.body.idToken;
        const uidToMigration = request.body.uid;
        const groupIdToMigration = request.body.groupID;
        auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
            const isAdmin = decodedToken.admin;
            const group = decodedToken.group;
            const uid = decodedToken.uid;
            const name = decodedToken.name;
            if(isAdmin){
                const userRef = firestore().collection('user').where('group', '==', group).where('uid', '==', uidToMigration);
                userRef.get()
            .then(docUser => {
                const userSnapshot = docUser.docs[0];
                firestore().collection('log').add({
                    'operator':uid,
                    'operatorName': name,
                    'type':'migrateGroupAccount',
                    'uid':uidToMigration,
                    'name':userSnapshot.get('name'),
                    'age':userSnapshot.get('age'),
                    'grade':userSnapshot.get('grade'),
                    'group':userSnapshot.get('group'),
                    'groupToMigration': groupIdToMigration
                }).then(function() {
                    firestore().collection('migration').add({
                        'operator':uid,
                        'operatorName': name,
                        'time': firestore.Timestamp.now(),
                        'phase': 'wait',
                        'uid':uidToMigration,
                        'name':userSnapshot.get('name'),
                        'age':userSnapshot.get('age'),
                        'grade':userSnapshot.get('grade'),
                        'group':groupIdToMigration,
                        'group_from':group,
                        'groupName_from':userSnapshot.get('groupName'),
                    }).then(function() {
                        res = 'success';
                        response.send(res);
                    }).catch();
                }).catch();
            }).catch();
            }
        }).catch(function (error) {
            // Handle error
            res = 'not found';
            response.send(res);
        });
    });
  });