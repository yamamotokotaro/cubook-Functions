import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const fireStore = admin.firestore();
const cors = require("cors")({origin: true});

export default functions.region("asia-northeast1").https.onRequest((request, response) => {
  cors(request, response, () => {
    console.log(request.body);
      let res;
      const idToken = request.body.idToken;
      const uid = request.body.uid;
      const family = request.body.family;
      const first = request.body.first;
      const team = request.body.team;
      const teamPosition = request.body.teamPosition;
      const grade = request.body.grade;
      const age = request.body.age;
      const age_turn = request.body.age_turn;
      const call = request.body.call;
      admin.auth().verifyIdToken(idToken)
          .then(function (decodedToken) {
          const userRef = fireStore.collection("user").where("group", "==", decodedToken.group).where("uid", "==", uid);
          userRef.get().then(doc => {
              if (doc === null) {
                  response.send("No such document!");
              } else if (doc !== null) {
                if(team !== null && grade !== null && teamPosition !== null){
                  const setUserRef = fireStore.collection("user").doc(doc.docs[0].id);
                  setUserRef.update({
                    name: family + first,
                    family: family,
                    first: first,
                    call: call,
                    team: team,
                    teamPosition: teamPosition,
                    age: age,
                    age_turn: age_turn,
                    grade: grade
                  }).then(function(){
                    admin.auth().setCustomUserClaims(uid, {
                      name: family + first,
                      family: family,
                      first: first,
                      call: call,
                      team: team,
                      teamPosition: teamPosition,
                      age: age,
                      age_turn: age_turn,
                      position: "scout",
                      group: decodedToken.group,
                      grade: grade
                    }).then(function() {
                      res = "success";
                      response.send(res);
                    }).catch(function(){
                      res = "error";
                      response.send(res);
                    })}
                  ).catch();
                } else if (team !== null && grade !== null){
                  const setUserRef = fireStore.collection("user").doc(doc.docs[0].id);
                  setUserRef.update({
                    name: family + first,
                    family: family,
                    first: first,
                    call: call,
                    team: team,
                    age: age,
                    age_turn: age_turn,
                    grade: grade
                  }).then(function(){
                    admin.auth().setCustomUserClaims(uid, {
                      name: family + first,
                      family: family,
                      first: first,
                      call: call,
                      team: team,
                      age: age,
                      age_turn: age_turn,
                      position: "scout",
                      group: decodedToken.group,
                      grade: grade
                    }).then(function() {
                      res = "success";
                      response.send(res);
                    }).catch(function(){
                      res = "error";
                      response.send(res);
                    })}
                  ).catch();
                } else {
                  const setUserRef = fireStore.collection("user").doc(doc.docs[0].id);
                    setUserRef.update({
                      name: family + first,
                      family: family,
                      first: first,
                      call: call,
                      age: age,
                    }).then(function(){
                      admin.auth().setCustomUserClaims(uid, {
                        name: family + first,
                        family: family,
                        first: first,
                        call: call,
                        age: age,
                        position: "scout",
                        group: decodedToken.group
                      }).then(function() {
                        res = "success";
                        response.send(res);
                      }).catch(function(){
                        res = "error";
                        response.send(res);
                      })}
                    ).catch();
                }
              }
          })
              .catch(err => {
              res = "error";
              response.send(res);
          });
      }).catch(function (error) {
          // Handle error
          res = "error";
          response.send(res);
      });
  });
});