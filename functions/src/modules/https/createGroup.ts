import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const fireStore = admin.firestore();
const cors = require("cors")({origin: true});

export default functions.region("asia-northeast1").https.onRequest((request, response) => {
  cors(request, response, () => {
    let res;
    const idToken = request.body.idToken;
    const groupName = request.body.groupName;
    let grade = request.body.grade;
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
        const createRef = fireStore.collection("group").doc();
        if(grade === null){
          grade = "cub";
        }
        createRef.set({
            name: groupName,
            grade: grade
        }).then(doc => {
            createRef.id;
            if (doc === null) {
                response.send("No such document!");
            } else if (doc !== null) {
                const group = createRef.id;
                const uid = decodedToken.uid;
                const first = request.body.first;
                const family = request.body.family;
                const call = "さん";
                const age = "leader";
                const position = "leader";
                admin.auth().setCustomUserClaims(uid, {
                  name: family + first,
                  group: group,
                  family: family,
                  first: first,
                  call: call,
                  age: age,
                  position: position,
                  admin: true,
                  owner: true,
                  grade: grade,
                  groupName: groupName
                }).then(function() {
                  const citiesRef = fireStore.collection("user");
                  citiesRef.doc().set({
                    name: family + first,
                    group: group,
                    family: family,
                    first: first,
                    call: call,
                    age: age,
                    position: position,
                    uid: uid,
                    admin: true,
                    owner: true,
                    grade: grade,
                    groupName: groupName
                  }).then(function(){
                    res = "success";
                    response.send(res);}
                  ).catch();
                  // Tell client to refresh token on user.
                }).catch(function(error) {
                  res = "error";    
                  response.send(res);    // Handle error
                });
            }
        })
            .catch(err => {
            res = "not found";
            response.send(res);
        });
    }).catch(function (error) {
        // Handle error
        res = "not found";
        response.send(res);
    });
  });
});