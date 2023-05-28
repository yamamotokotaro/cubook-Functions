import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export default functions.region('asia-northeast1').https.onCall(async (data, context) => {
    let res;
    const documentID = data.documentID;
    const isAdmin = context.auth?.token.admin;
    const group = context.auth?.token.group;
    if (isAdmin) {
        const migrationRef = firestore().collection('migration').doc(documentID);
        const docMigration = await migrationRef.get()
        if (docMigration.get('group') === group) {
            await migrationRef.update({ 'phase': 'reject' });
            return 'success';
        } else {
            return 'error';
        }
    } else {
        res = 'you are not admin';
        return res;
    }
});