import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
var async = require("async");
const fireStore = admin.firestore();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
var bucket = storage.bucket("cubook-3c960.appspot.com");
const cors = require("cors")({ origin: true });

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "1GB" as "1GB",
};

bucket.renameFolder = function (
  source: any,
  dest: any,
  callback: (arg0: any) => any
) {
  bucket.getFiles({ prefix: source }, function (err: any, files: any) {
    if (err) return callback(err);

    async.eachLimit(
      files,
      5,
      function (
        file: { move: (arg0: any, arg1: any) => void; name: string },
        next: any
      ) {
        file.move(file.name.replace(source, dest), next);
      },
      callback
    );
  });
};

export default functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onRequest((request, response) => {
    cors(request, response, () => {
      let res;
      let batch = fireStore.batch();
      let count_category = 0;

      const uid_from = ""; //移行元のuid
      const uid = ""; //移行先のuid
      const group = ""; //移行先のgroup
      const group_from = ""; //移行元のgroup

      const userRef = fireStore
        .collection("user")
        .where("group", "==", group)
        .where("uid", "==", uid_from);
      userRef
        .get()
        .then((query_user) => {
          const listCollection = [
            "risu",
            "usagi",
            "sika",
            "kuma",
            "tukinowa",
            "challenge",
            "syokyu",
            "nikyu",
            "ikkyu",
            "kiku",
            "hayabusa",
            "fuji",
            "user",
            "activity_personal",
          ];
          for (const category of listCollection) {
            const collectionRef = fireStore
              .collection(category)
              .where( "group", "==", group_from)
              .where("uid", "==", uid_from);
            collectionRef
              .get()
              .then((query) => {
                let count = 0;
                const docs = query.docs;
                for (const collectionSnapshot of docs) {
                  let map = collectionSnapshot.data();
                  map["uid"] = uid;
                  if (category !== "user" && category !== "activity_personal") {
                    let dataSigned = collectionSnapshot.get("signed");
                    for (let key in dataSigned) {
                      const map_data = dataSigned[key]["data"];
                      if (map_data !== undefined) {
                        for (let key_map in map_data) {
                          let detail_data = map_data[key_map];
                          const type_data = detail_data["type"];
                          if (type_data == "image" || type_data == "video") {
                            let location_data = detail_data["body"].split("/");
                            detail_data["body"] =
                              group + "/" + uid + "/" + location_data[2];
                          }
                          map_data[key_map] = detail_data;
                        }
                        dataSigned[key]["data"] = map_data;
                      }
                    }
                    map["signed"] = dataSigned;
                    batch.update(
                      fireStore.collection(category).doc(collectionSnapshot.id),
                      map
                    );
                  } else if (category === "user") {
                    admin
                      .auth()
                      .setCustomUserClaims(uid, {
                        name: collectionSnapshot.get("name"),
                        group: group,
                        family: collectionSnapshot.get("family"),
                        first: collectionSnapshot.get("first"),
                        call: collectionSnapshot.get("call"),
                        age: collectionSnapshot.get("age"),
                        position: collectionSnapshot.get("position"),
                        grade: collectionSnapshot.get("grade"),
                        groupName: map["groupName"],
                      })
                      .then()
                      .catch();
                    batch.update(
                      fireStore.collection(category).doc(collectionSnapshot.id),
                      map
                    );
                  } else if (category === "activity_personal") {
                    batch.set(fireStore.collection(category).doc(), map);
                  }
                  count += 1;
                }

                if (count > 0) {
                  count_category += 1;
                  count = 0;
                  console.log(category + " is done");
                } else {
                  count_category += 1;
                  console.log(category + " is empty");
                }
                if (listCollection.length == count_category) {
                  batch
                    .commit()
                    .then(function () {
                      console.log("document complete");
                      try {
                        admin
                          .auth()
                          .getUser(uid)
                          .then(function (userRecord) {
                          })
                          .catch();
                      } catch (e) {
                        console.log(`エラー発生 ${e}`);
                        console.log(uid);
                      }
                      bucket.renameFolder(
                        group_from + "/" + uid_from,
                        group + "/" + uid,
                        console.log
                      );
                    })
                    .catch();
                }
              })
              .catch();
          }
          res = "sucess";
          response.send(res);
        })
        .catch();
    });
  });
