import * as functions from 'firebase-functions';
import { auth } from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const cors = require('cors')({ origin: true });

export default functions.region('asia-northeast1').https.onRequest((request, response) => {
    const db = getFirestore();
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
                if (isAdmin) {
                    const userRef = db.collection('user').where('group', '==', group).where('uid', '==', uidToMigration);
                    userRef.get()
                        .then(docUser => {
                            const userSnapshot = docUser.docs[0];
                            db.collection('log').add({
                                'operator': uid,
                                'operatorName': name,
                                'type': 'migrateGroupAccount',
                                'uid': uidToMigration,
                                'name': userSnapshot.get('name'),
                                'age': userSnapshot.get('age'),
                                'grade': userSnapshot.get('grade'),
                                'group': userSnapshot.get('group'),
                                'groupToMigration': groupIdToMigration
                            }).then(function () {
                                db.collection('migration').add({
                                    'operator': uid,
                                    'operatorName': name,
                                    'time': Timestamp.now(),
                                    'phase': 'wait',
                                    'uid': uidToMigration,
                                    'name': userSnapshot.get('name'),
                                    'age': userSnapshot.get('age'),
                                    'grade': userSnapshot.get('grade'),
                                    'group': groupIdToMigration,
                                    'group_from': group,
                                    'groupName_from': userSnapshot.get('groupName'),
                                }).then(function () {
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