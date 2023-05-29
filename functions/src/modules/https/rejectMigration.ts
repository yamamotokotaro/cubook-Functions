import * as functions from "firebase-functions";
import { firestore, auth } from "firebase-admin";
const cors = require("cors")({origin: true});

export default functions.region("asia-northeast1").https.onRequest((request, response) => {
    cors(request, response, () => {
        let res;
        const idToken = request.body.idToken;
        const documentID = request.body.documentID;
        auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
            const isAdmin = decodedToken.admin;
            const group = decodedToken.group;
            if(isAdmin){
                const migrationRef = firestore().collection("migration").doc(documentID);
                migrationRef.get()
            .then(docMigration => {
                if(docMigration.get("group") === group){
                    migrationRef.update({"phase":"reject"}).then(function(){response.send("success")}).catch();
                }
            }).catch();
            } else {
                res = "you are not admin";
                response.send(res);
            }
        }).catch(function (error) {
            // Handle error
            res = "not found";
            response.send(res);
        });
    });
  });